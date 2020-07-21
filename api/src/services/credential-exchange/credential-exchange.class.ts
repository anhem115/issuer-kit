import { Id, Params } from "@feathersjs/feathers";
import {
  ServiceSwaggerAddon,
  ServiceSwaggerOptions,
} from "feathers-swagger/types";
import { Application } from "../../declarations";
import { Claim, UserInfo, UserCredentialInfo } from "../../models/credential";
import { CredDefServiceResponse } from "../../models/credential-definition";
import {
  AriesCredentialAttribute,
  AriesCredentialOffer,
  CredExServiceResponse,
} from "../../models/credential-exchange";
import { ServiceAction, ServiceType } from "../../models/enums";
import { formatCredentialOffer } from "../../utils/credential-exchange";
import {
  updateInviteRecord,
  getCredentialExchangeInfo,
} from "../../utils/issuer-invite";

interface Data {
  token?: string;
  schema_id: string;
  connection_id: string;
  claims: Claim[];
}

interface ServiceOptions {}

export class CredentialExchange implements ServiceSwaggerAddon {
  app: Application;
  options: ServiceOptions;
  util = require("util");

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async get(id: Id, params?: Params): Promise<CredExServiceResponse> {
    return await this.app.service("aries-agent").create({
      service: ServiceType.CredEx,
      action: ServiceAction.Fetch,
      data: { credential_exchange_id: id },
    });
  }

  async update(data: any, params?: Params): Promise<CredExServiceResponse> {
    //get the cred exchange id
    const credential_info = (await getCredentialExchangeInfo(
      // {
      //   "credExchangeData.credential_exchange_id": cred_exchange_id,
      // },
      {
        application_number: data.application_number,
      },
      this.app
    )) as UserCredentialInfo;
    console.log(`data in mongo: ${JSON.stringify(credential_info)}`);
    const credential_revoke_info = {
      revoc_reg_id: credential_info.credential_exchange_data.revoc_reg_id,
      revocation_id: credential_info.credential_exchange_data.revocation_id,
    };
    const revoke_response = await this.app.service("aries-agent").create({
      service: ServiceType.CredEx,
      action: ServiceAction.Revoke,
      data: credential_revoke_info,
    });

    console.log(
      `Successfully revoke for : ${this.util.inspect(credential_info)}`
    );

    console.log("Start issuing a new credential!!!!!!!!!");
    //check the tier of the info
    const comment = this.app.get("issuer").offerComment;
    let attributes: any = Object.keys(data).forEach(
      (claim: any) =>
        ({
          name: claim,
          value: data[claim],
        } as AriesCredentialAttribute)
    );
    //get cred def id from the cred exchange data
    const cred_def_id =
      credential_info.credential_exchange_data.credential_definition_id;
    const credentialOffer = formatCredentialOffer(
      data.connection_id,
      comment,
      attributes,
      cred_def_id
    ) as AriesCredentialOffer;

    const newCredEx = (await this.app.service("aries-agent").create({
      service: ServiceType.CredEx,
      action: ServiceAction.Create,
      data: credentialOffer,
    })) as CredExServiceResponse;

    if (data.token) {
      updateInviteRecord(
        { token: data.token },
        { credential_exchange_id: newCredEx.credential_exchange_id },
        this.app
      );
    }
    return newCredEx;
  }

  async create(data: Data, params?: Params): Promise<CredExServiceResponse> {
    const comment = this.app.get("issuer").offerComment;
    let attributes = data.claims.map(
      (claim: any) =>
        ({
          name: claim.name,
          value: claim.value,
        } as AriesCredentialAttribute)
    );

    // console.log(`data: ${this.util.inspect(data)}`);

    // console.log(`attributes: ${this.util.inspect(attributes)}`);

    const cred_def_id = (await this.app
      .service("aries-agent")
      .create({
        service: ServiceType.CredDef,
        action: ServiceAction.Create,
        data: { schema_id: data.schema_id },
      })
      .catch((thrown) =>
        console.log(
          `Get error at credential definition: ${this.util.inspect(thrown)}`
        )
      )) as CredDefServiceResponse;

    const credentialOffer = formatCredentialOffer(
      data.connection_id,
      comment,
      attributes,
      cred_def_id.credential_definition_id
    ) as AriesCredentialOffer;

    const newCredEx = (await this.app.service("aries-agent").create({
      service: ServiceType.CredEx,
      action: ServiceAction.Create,
      data: credentialOffer,
    })) as CredExServiceResponse;

    if (data.token) {
      updateInviteRecord(
        { token: data.token },
        { credential_exchange_id: newCredEx.credential_exchange_id },
        this.app
      );
    }
    return newCredEx;
  }

  docs: ServiceSwaggerOptions = {
    description: "Credential Exchange",
    idType: "string",
  };

  model = {
    title: "Credential Exchange",
    description: "Credential Exchange Model",
    type: "object",
    required: [],
    properties: {
      id: {
        type: "string",
        description: "The credential exchange uuid",
        readOnly: true,
      },
      state: {
        type: "string",
        description: "The credential exchange state",
        readOnly: true,
      },
      connection_id: {
        type: "string",
        description:
          "The uuid for the connection used during the credential exchange",
      },
      claims: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "The uuid for the connection used during the credential exchange",
      },
    },
  };
}
