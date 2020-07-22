import { NotImplemented } from "@feathersjs/errors";
import { Params } from "@feathersjs/feathers";
import Axios, { AxiosRequestConfig } from "axios";
import { Application } from "../../declarations";
import {
  AriesConnection,
  AriesInvitation,
  ConnectionServiceResponse,
} from "../../models/connection";
import { CredDefServiceResponse } from "../../models/credential-definition";
import {
  AriesCredentialExchange,
  AriesCredentialOffer,
  CredExServiceResponse,
  AriesCredentialAttribute,
} from "../../models/credential-exchange";
import { ServiceAction, ServiceType } from "../../models/enums";
import { AriesSchema, SchemaDefinition } from "../../models/schema";
import { formatCredentialDefinition } from "../../utils/credential-definition";
import { loadJSON } from "../../utils/load-config-file";
import {
  formatCredentialPreview,
  tierChecker,
} from "../../utils/credential-exchange";
import { Service } from "feathers-mongodb/types";
import app from "../../app";
import { getCredentialExchangeInfo } from "../../utils/issuer-invite";

interface AgentSettings {
  adminUrl: string;
  adminApiKey: string;
}

interface Data {
  service: ServiceType;
  action: ServiceAction;
  data: any;
}

interface VerifyPresentation {
  presentation_request: any;
  auto_present: false;
  state: string;
  error_msg: string;
  presentation_exchange_id: string;
  role: string;
  connection_id: string;
  initiator: string;
  presentation: {};
  updated_at: string;
  created_at: string;
  verified: string;
}

interface ProofRequest {
  connection_id: string;
  proof_request: any;
  comment: string;
  trace: boolean;
}

interface ServiceOptions {}

export class AriesAgent {
  app: Application;
  options: ServiceOptions;

  agent: AgentSettings;
  schemas: Map<string, AriesSchema>;
  credDefs: Map<string, string>;
  util = require("util");

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;

    const agentSettings = app.get("agent") as AgentSettings;
    this.agent = agentSettings;

    this.schemas = new Map<string, AriesSchema>();
    this.credDefs = new Map<string, string>();
  }

  async create(data: Data, params?: Params): Promise<any> {
    if (this.schemas.size === 0) {
      // lazy-load configured schemas on first run
      await this.initSchemas();
    }

    switch (data.service) {
      case ServiceType.Connection:
        if (data.action === ServiceAction.Create) {
          return this.newConnection();
        } else {
          return this.getConnection(data.data.connection_id);
        }
      case ServiceType.CredEx:
        if (data.action === ServiceAction.Create) {
          return this.newCredentialExchange(data.data as AriesCredentialOffer);
        } else if (data.action === ServiceAction.Fetch) {
          return this.getCredentialExchange(data.data.credential_exchange_id);
        } else if (data.action === ServiceAction.Issue) {
          return this.issueCredential(
            data.data.credential_exchange_id,
            data.data.attributes,
            data.data.credential_definition_id
          );
        } else if (data.action === ServiceAction.Revoke) {
          return this.revokeCredential(data.data.credential_exchange_id);
        }
      case ServiceType.CredDef:
        let schema_id = data.data.schema_id;
        if (!schema_id) {
          schema_id = this.schemas.get("default")?.schema_id;
        }
        return this.getOrCreateCredDef(schema_id);
      case ServiceType.ProofReq:
        if (data.action === ServiceAction.SendRequest) {
          return this.sendProofRequest(data.data);
        } else if (data.action === ServiceAction.Verify) {
          return this.verifyPresentation(data.data.presentation_exchange_id);
        }
      case ServiceType.RevocationResgitry:
        if (data.action == ServiceAction.Create) {
          //create revocation registry, fetch tail file, update and publish
          let cred_def_id = data.data.cred_def_id;
          return this.createRevocationRegistry(cred_def_id);
        }
      default:
        return new NotImplemented(
          `The operation ${data.service}/${data.action} is not supported`
        );
    }
  }

  private getRequestConfig(): any {
    return {
      headers: {
        "x-api-key": this.agent.adminApiKey,
      },
    };
  }

  private async initSchemas() {
    const config = loadJSON("schemas.json") as SchemaDefinition[];
    config.forEach(async (schemaDef: SchemaDefinition) => {
      let schema: AriesSchema;
      if (schemaDef.id) {
        // Already published to ledger, add to supported array
        schema = await this.getSchema(schemaDef.id);
      } else {
        // Check wether the schema was registered
        schema = await this.publishSchema(schemaDef);
        console.log(`Schema:${this.util.inspect(schema)}`);
      }
      this.schemas.set(schema.schema_id || schema.schema.id, schema);
      if (schemaDef.default) {
        this.schemas.set("default", schema);
      }
    });
  }

  private async newConnection(): Promise<AriesInvitation> {
    const url = `${this.agent.adminUrl}/connections/create-invitation`;
    const response = await Axios.post(url, {}, this.getRequestConfig());
    return response.data as AriesInvitation;
  }

  private async getConnection(id: string): Promise<ConnectionServiceResponse> {
    const url = `${this.agent.adminUrl}/connections/${id}`;
    const response = await Axios.get(url, this.getRequestConfig());
    const data = response.data as AriesConnection;
    return {
      connection_id: data.connection_id,
      state: data.state,
    } as ConnectionServiceResponse;
  }

  private async newCredentialExchange(
    data: AriesCredentialOffer
  ): Promise<any> {
    const url = `${this.agent.adminUrl}/issue-credential/send-offer`;
    const response = await Axios.post(url, data, this.getRequestConfig());
    const credExData = response.data as AriesCredentialExchange;
    return {
      credential_exchange_id: credExData.credential_exchange_id,
      state: credExData.state,
      revocation_id: credExData.revocation_id,
      revoc_reg_id: credExData.revoc_reg_id,
    } as CredExServiceResponse;
  }

  private async getCredentialExchange(
    id: string
  ): Promise<CredExServiceResponse> {
    const url = `${this.agent.adminUrl}/issue-credential/records/${id}`;
    const response = await Axios.get(url, this.getRequestConfig());
    const credExData = response.data as AriesCredentialExchange;
    return {
      credential_exchange_id: credExData.credential_exchange_id,
      state: credExData.state,
    } as CredExServiceResponse;
  }

  private async issueCredential(
    credential_exchange_id: string,
    attributes: AriesCredentialAttribute[],
    credential_definition_id: string
  ): Promise<CredExServiceResponse> {
    //need to check for active-registry, and creat new revocation registry before issuing
    console.log(
      `Check for revocation registry space for: ${credential_definition_id}`
    );
    await this.checkForRevocationRegistrySpace(credential_definition_id);
    const url = `${this.agent.adminUrl}/issue-credential/records/${credential_exchange_id}/issue`;
    console.log(
      `credential preview: ${this.util.inspect(
        formatCredentialPreview(attributes)
      )}`
    );
    const response = await Axios.post(
      url,
      {
        credential_preview: formatCredentialPreview(attributes),
      },
      this.getRequestConfig()
    );
    const credExData = response.data as AriesCredentialExchange;

    console.log(`credential issued data: ${this.util.inspect(credExData)}`);
    return {
      state: credExData.state,
      revocation_id: credExData.revocation_id,
      revoc_reg_id: credExData.revoc_reg_id,
      cred_exchange_id: credExData.credential_exchange_id,
      cred_definition_id: credExData.credential_definition_id,
    } as CredExServiceResponse;
  }

  private async revokeCredential(credential_revok_info: any) {
    console.log(
      `credential revok info ${JSON.stringify(credential_revok_info)}`
    );
    const revocation_id = credential_revok_info.revocation_id;
    const revoc_reg_id = credential_revok_info.revoc_reg_id;
    const publish_now = credential_revok_info.publish;
    const url = `${this.agent.adminUrl}/issue-credential/revoke?$rev_reg_id=${revoc_reg_id}&revocation_id=${revocation_id}&publish=${publish_now}`;
    const response = await Axios.post(url, {}, this.getRequestConfig());
    return response;
  }

  private async sendProofRequest(proofRequest: ProofRequest): Promise<any> {
    console.log(`Proof Request data: ${this.util.inspect(proofRequest)}`);
    const url = `${this.agent.adminUrl}/present-proof/send-request`;
    console.log(`url: ${this.util.inspect(url)}`);
    const response = await Axios.post(
      url,
      proofRequest,
      this.getRequestConfig()
    );
    console.log(`send Proof Request response from agent: ${response}`);
    return response.data;
  }

  private async verifyPresentation(
    presentation_exchange_id: string
  ): Promise<VerifyPresentation> {
    console.log("Verify in progresssssssssssssss");
    const url = `${this.agent.adminUrl}/present-proof/records/${presentation_exchange_id}/verify-presentation`;
    const response = await Axios.post(url, null, this.getRequestConfig());
    console.log(`verify pres response from agent: ${response}`);
    return response.data as VerifyPresentation;
  }

  private async publishSchema(schema: SchemaDefinition): Promise<AriesSchema> {
    const url = `${this.agent.adminUrl}/schemas`;
    const response = await Axios.post(url, schema, this.getRequestConfig());
    return response.data as AriesSchema;
  }

  private async getSchema(id: string): Promise<AriesSchema> {
    const url = `${this.agent.adminUrl}/schemas/${id}`;
    const response = await Axios.get(url, this.getRequestConfig());
    return response.data as AriesSchema;
  }

  private async getOrCreateCredDef(
    schema_id: string
  ): Promise<CredDefServiceResponse> {
    let credExResponse: CredDefServiceResponse;
    if (this.credDefs.get(schema_id)) {
      credExResponse = {
        credential_definition_id: this.credDefs.get(schema_id) || "",
      };
    } else {
      const url = `${this.agent.adminUrl}/credential-definitions`;
      const tag = this.app.get("credentialDefinitionTag");
      const credDef = formatCredentialDefinition(true, schema_id, tag);
      console.log(`Cred Definition: ${this.util.inspect(credDef)}`);
      const response = await Axios.post(url, credDef, this.getRequestConfig());
      credExResponse = response.data as CredDefServiceResponse;
      this.credDefs.set(schema_id, credExResponse.credential_definition_id);
    }
    console.log(`Finish the Cred Def ${this.util.inspect(credExResponse)}`);
    let cred_def_id = credExResponse.credential_definition_id;
    //check for current active registry
    await this.checkForRevocationRegistrySpace(cred_def_id);
    // const url = `${this.agent.adminUrl}/revocation/active-registry/${cred_def_id}`;
    // const result = await Axios.get(url, this.getRequestConfig())
    //   .then((response) => {
    //     console.log("Revocation registry is available");
    //     return response;
    //   })
    //   .catch((thrown) => {
    //     console.log(`Get some error ${thrown.response.status}`);
    //     return thrown.response.status;
    //   });
    // let rev_reg_result;
    // if (result == 404) {
    //   console.log("Creating revocation registry... ");
    //   rev_reg_result = await this.createRevocationRegistry(cred_def_id)
    //     .then((data) => data)
    //     .catch((thrown) => {
    //       console.log(
    //         `Error in create revocation registry: ${this.util.inspect(thrown)}`
    //       );
    //       return 404;
    //     });
    //   console.log(`Finish cred definition: ${rev_reg_result}`);
    // }
    // console.log(
    //   `Finish creating revocation registry: ${this.util.inspect(result)}`
    // );
    return credExResponse;
  }

  private async checkForRevocationRegistrySpace(cred_def_id: string) {
    const url = `${this.agent.adminUrl}/revocation/active-registry/${cred_def_id}`;
    const result = await Axios.get(url, this.getRequestConfig())
      .then((response) => {
        console.log("Revocation registry is available");
        return response;
      })
      .catch((thrown) => {
        console.log(`Get some error ${thrown.response.status}`);
        return thrown.response.status;
      });
    let rev_reg_result;
    if (result == 404) {
      console.log("Creating revocation registry... ");
      rev_reg_result = await this.createRevocationRegistry(cred_def_id)
        .then((data) => data)
        .catch((thrown) => {
          console.log(
            `Error in create revocation registry: ${this.util.inspect(thrown)}`
          );
          return 404;
        });
      console.log(`Finish cred definition: ${rev_reg_result}`);
      console.log(
        `Finish creating revocation registry: ${this.util.inspect(result)}`
      );
    }
  }

  private async createRevocationRegistry(cred_def_id: string) {
    let url = `${this.agent.adminUrl}/revocation/create-registry`;
    let data = {
      max_cred_num: 20,
      credential_definition_id: cred_def_id,
    };

    console.log(`create registry for ${cred_def_id}`);
    const response: any = await Axios.post(
      url,
      data,
      this.getRequestConfig()
    ).catch((thrown) => {
      console.log(`XXX error: ${this.util.inspect(thrown)}`);
    });
    // console.log("Get response:");
    // console.log(util.inspect(response, false, null, true /* enable colors */));
    console.log(`got response... ${response.data}`);
    const revoc_reg_id = response.data.result.revoc_reg_id;
    console.log(`XXXX: ${revoc_reg_id}`);
    const tailHash = response.data.result.tails_hash;
    //fetch tail file
    url = `${this.agent.adminUrl}/revocation/registry/${revoc_reg_id}/tails-file`;
    const tailFile = await Axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "x-api-key": this.agent.adminApiKey,
      },
    });
    console.log(`XXXX: received the tailFile ${tailFile}`);
    //compare hash between tailFile using sha256
    //update tail file url
    const genesisFile = await Axios.get(
      `${app.get("ledgerUrl")}/genesis`,
      this.getRequestConfig()
    );
    //let test = new Blob();
    //const genesisData = new Blob([JSON.stringify(genesisFile.data)]);
    console.log(`XXXX: Received genesis file ${genesisFile}`);
    const tailFileServer = app.get("publicTailsUrl");
    console.log(`XXXX: public tail url: ${tailFileServer}`);
    const tailFileUrl = `${tailFileServer}/${revoc_reg_id}`;
    const newTailInfo = {
      tails_public_uri: tailFileUrl,
    };
    url = `${this.agent.adminUrl}/revocation/registry/${revoc_reg_id}`;
    const updateUriResult: any = await Axios.patch(
      url,
      newTailInfo,
      this.getRequestConfig()
    ).catch((thrown) => {
      console.log(`error in update Uri: ${this.util.inspect(thrown)}`);
      return "Error";
    });
    console.log(
      `XXXX: update the new tail url: ${this.util.inspect(
        updateUriResult.data
      )}`
    );
    //publish to ledger
    url = `${this.agent.adminUrl}/revocation/registry/${revoc_reg_id}/publish`;
    const publishResult: any = await Axios.post(
      url,
      {},
      this.getRequestConfig()
    ).catch((thrown) => {
      console.log(`${this.util.inspect(thrown.response)}`);
      return "Error";
    });
    console.log(
      `XXXX: publish the revocation to the ledger: ${this.util.inspect(
        publishResult.data
      )}`
    );
    //send tailFile to tail file server
    const tailFileServerData = {
      genesis: genesisFile.data,
      tails: tailFile.data,
    };
    let FormData = require("form-data");
    let formData = new FormData();
    formData.append("genesis", genesisFile.data);
    formData.append("tails", tailFile.data);
    console.log(`tail file server data: ${this.util.inspect(formData)}`);
    const uploadTailHash = await Axios.put(tailFileUrl, formData, {
      headers: formData.getHeaders(),
    })
      .then((data) => data)
      .catch((thrown) => {
        console.log(
          `XXXX: publish the tail file to the tail file server ${this.util.inspect(
            thrown
          )}`
        );
        return "Error";
      });
    console.log(
      `XXXX: publish the tail file to the tail file server: ${this.util.inspect(
        uploadTailHash
      )}`
    );
    return { success: true };
  }
}
