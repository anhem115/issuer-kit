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
import { formatCredentialPreview } from "../../utils/credential-exchange";

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
            data.data.attributes
          );
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
      default:
        return new NotImplemented(
          `The operation ${data.service}/${data.action} is not supported`
        );
    }
  }

  private getRequestConfig(): AxiosRequestConfig {
    return {
      headers: {
        "x-api-key": this.agent.adminApiKey,
      },
    } as AxiosRequestConfig;
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
    id: string,
    attributes: AriesCredentialAttribute[]
  ): Promise<CredExServiceResponse> {
    const url = `${this.agent.adminUrl}/issue-credential/records/${id}/issue`;
    const response = await Axios.post(
      url,
      { credential_preview: formatCredentialPreview(attributes) },
      this.getRequestConfig()
    );
    const credExData = response.data as AriesCredentialExchange;
    return {
      credential_exchange_id: credExData.credential_exchange_id,
      state: credExData.state,
    } as CredExServiceResponse;
  }

  private async sendProofRequest(proofRequest: ProofRequest): Promise<any> {
    console.log(`Proof Request data: ${JSON.stringify(proofRequest)}`);
    const url = `${this.agent.adminUrl}/present-proof/send-request`;
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
      const credDef = formatCredentialDefinition(schema_id);
      const response = await Axios.post(url, credDef, this.getRequestConfig());
      credExResponse = response.data as CredDefServiceResponse;
      this.credDefs.set(schema_id, credExResponse.credential_definition_id);
    }
    return credExResponse;
  }
}
