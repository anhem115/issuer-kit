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
import { ServiceAction, ServiceType, CredExState } from "../../models/enums";
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
    //query the application number based on the providing connection_id
    //--> find any user record with that application number
    // and revoke

    const publish_now = true;
    const proof_result: any = await this.app
      .service("proof")
      .find({ query: { connection_id: data.connection_id } });

    let generated_data: any = [];
    const tier = tierChecker(attributes);
    console.log(`Proof Result: ${JSON.stringify(proof_result)}`);
    if (proof_result !== undefined && proof_result.length > 0) {
      //has existing record --> update credential
      const application_number =
        proof_result[0].presentation.requested_proof.revealed_attrs
          .application_number.raw;
      console.log(`Found the application_number: ${application_number}`);

      const query_result: any = await this.app
        .service("user")
        .find({ query: { _id: application_number } });
      const current_record = query_result;
      console.log(
        `Found the related record :${JSON.stringify(current_record)}`
      );
      console.log(`Here is record length :${current_record.length}`);
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
        `Successfully revoke for : ${this.util.inspect(current_record)}`
      );

      // generated_data = [
      //   {
      //     name: "tier",
      //     value: `${tier}`,
      //   },
      //   {
      //     name: "application_number",
      //     value: current_record[0].application_number,
      //   },
      // ];
    }

    //generate new record
    const new_record = await this.app.service("user").create({
      connection_id: data.connection_id,
      cred_exchange_data: { state: "initialize" },
    });
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

    const new_attributes = attributes.filter(
      ({ name }) => name !== "tier" && name !== "application_number"
    );
    const attributes_with_extra_info: any = [
      ...new_attributes,
      ...generated_data,
    ];
    console.log(
      `attributes to write: ${JSON.stringify(attributes_with_extra_info)}`
    );
    console.log(`attributes length: ${attributes_with_extra_info.length}`);
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

    await this.app.service("user").patch(new_record._id, {
      cred_exchange_data: {
        state: CredExState.OfferSent,
      },
    });

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
