import { Id, Params } from "@feathersjs/feathers";
import {
  ServiceSwaggerAddon,
  ServiceSwaggerOptions,
} from "feathers-swagger/types";
import { Application } from "../../declarations";
import { Claim } from "../../models/credential";
import { CredDefServiceResponse } from "../../models/credential-definition";
import {
  AriesCredentialAttribute,
  AriesCredentialOffer,
  CredExServiceResponse,
} from "../../models/credential-exchange";
import { ServiceAction, ServiceType } from "../../models/enums";
import {
  formatCredentialOffer,
  tierChecker,
} from "../../utils/credential-exchange";
import {
  updateInviteRecord,
  getCredentialExchangeInfo,
} from "../../utils/issuer-invite";
const { ObjectID } = require("mongodb");

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

  async update(
    id: Id,
    data: any,
    params?: Params
  ): Promise<CredExServiceResponse> {
    //get the cred exchange id
    // const credential_info = (await getCredentialExchangeInfo(
    //   // {
    //   //   "credExchangeData.credential_exchange_id": cred_exchange_id,
    //   // },
    //   {
    //     application_number: data.application_number,
    //   },
    //   this.app
    // )) as any;
    // const application_number = data.application_number;
    const connection_id = data.connection_id;
    const publish = true;
    const user_info = await this.app
      .service("user")
      .patch(ObjectID(id), { connection_id: connection_id });
    console.log(`data in mongo after update: ${JSON.stringify(user_info)}`);
    const credential_revoke_info = {
      revoc_reg_id: user_info.cred_exchange_data.revoc_reg_id,
      revocation_id: user_info.cred_exchange_data.revocation_id,
      publish: publish,
    };
    const revoke_response = await this.app.service("aries-agent").create({
      service: ServiceType.CredEx,
      action: ServiceAction.Revoke,
      data: credential_revoke_info,
    });

    console.log(`Successfully revoke for : ${this.util.inspect(user_info)}`);

    console.log("Start issuing a new credential!!!!!!!!!");
    const comment = this.app.get("issuer").offerComment;
    let attributes = data.claims.map(
      (claim: any) =>
        ({
          name: claim.name,
          value: claim.value,
        } as AriesCredentialAttribute)
    );
    const cred_def_id = user_info.cred_exchange_data.cred_definition_id;
    const tier = tierChecker(attributes);
    const generated_data = [
      {
        name: "tier",
        value: "1",
      },
    ];

    const attributes_with_extra_info: any = [...attributes, ...generated_data];
    console.log(
      `After replace the tier: ${JSON.stringify(attributes_with_extra_info)}`
    );
    const credentialOffer = formatCredentialOffer(
      data.connection_id,
      comment,
      attributes_with_extra_info,
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

    //check old or new record

    const publish_now = true;
    const query_result: any = await this.app
      .service("user")
      .find({ connection_id: data.connection_id });

    let generated_data: any = [];
    const tier = tierChecker(attributes);
    const current_record = query_result.data;
    if (current_record !== undefined && current_record.length > 0) {
      //has existing record --> update credential
      console.log(
        `Here is the current record :${JSON.stringify(current_record)}`
      );
      const credential_revoke_info = {
        revoc_reg_id: current_record[0].cred_exchange_data.revoc_reg_id,
        revocation_id: current_record[0].cred_exchange_data.revocation_id,
        publish: publish_now,
      };
      console.log(
        `Here is the revok info :${JSON.stringify(credential_revoke_info)}`
      );
      const revoke_response = await this.app.service("aries-agent").create({
        service: ServiceType.CredEx,
        action: ServiceAction.Revoke,
        data: credential_revoke_info,
      });

      console.log(
        `Successfully revoke for : ${this.util.inspect(
          current_record
        )} with repsonse: ${this.util.inspect(revoke_response)}`
      );

      generated_data = [
        {
          name: "tier",
          value: `${tier}`,
        },
        {
          name: "application_number",
          value: current_record[0].application_number,
        },
      ];
    } else {
      //brand new record
      const new_record = await this.app
        .service("user")
        .create({ connection_id: data.connection_id });
      console.log(`NEW RECORDDDDDDDDDDD: ${JSON.stringify(new_record)}`);
      generated_data = [
        {
          name: "tier",
          value: `${tier}`,
        },
        {
          name: "application_number",
          value: new_record._id,
        },
      ];
    }

    const attributes_with_extra_info: any = [...attributes, ...generated_data];
    const credentialOffer = formatCredentialOffer(
      data.connection_id,
      comment,
      attributes_with_extra_info,
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
