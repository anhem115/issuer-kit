import { NotImplemented } from "@feathersjs/errors";
import { Params } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import {
  CredExState,
  WebhookTopic,
  ServiceType,
  ServiceAction,
  ProofRequestState,
} from "../../models/enums";
import {
  updateInviteRecord,
  storeCredentialExchangeInfo,
  getCredentialExchangeInfo,
} from "../../utils/issuer-invite";
import { AriesCredentialAttribute } from "../../models/credential-exchange";
import { tierChecker } from "../../utils/credential-exchange";
const { ObjectID } = require("mongodb");

interface Data {
  state?: CredExState;
  credential_exchange_id?: string;
  credential_proposal_dict?: any;
  connection_id?: any;
  _id?: any;
  presentation_exchange_id?: string;
  verified?: string;
  credential_definition_id?: string;
}

interface Proof {
  state?: ProofRequestState;
  connection_id?: string;
  presentation_exchange_id?: string;
  verified?: string;
  presentation?: any;
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
  presentation: any;
  updated_at: string;
  created_at: string;
  verified: string;
}

interface ServiceOptions {}

export class Webhooks {
  app: Application;
  options: ServiceOptions;
  util = require("util");

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create(data: any, params?: Params): Promise<any> {
    const topic = params?.route?.topic;
    switch (topic) {
      case WebhookTopic.Connections:
        this.handleConnection(data);
        return { result: "Success" };
      case WebhookTopic.IssueCredential:
        this.handleIssueCredential(data);
        return { result: "Success" };
      case WebhookTopic.ProofRequest:
        this.handleProofRequest(data);
        return { result: "Success" };
      default:
        return new NotImplemented(`Webhook ${topic} is not supported`);
    }
  }

  private async handleConnection(data: Data): Promise<any> {
    console.log(`data: ${this.util.inspect(data)}`);
    const query = (await this.app.service("connection-test").find({
      query: {
        connection_id: data.connection_id,
      },
      paginate: false,
    })) as string[];
    console.log(`Before: ${this.util.inspect(query)}`);
    const foundData = query[0] as Data;
    await this.app
      .service("connection-test")
      .update(foundData._id, {
        connection_id: data.connection_id,
        state: data.state,
      })
      .then(() => console.log("Success"))
      .catch((error) => console.log(error));
    const afterquery = (await this.app.service("connection-test").find({
      query: {
        connection_id: data.connection_id,
      },
      paginate: false,
    })) as string[];
    console.log(`After: ${this.util.inspect(afterquery)}`);
  }

  private async handleProofRequest(data: Proof) {
    // console.log(`Receice webhook! with data: ${this.util.inspect(data)}`);

    const { state } = data;
    // const {
    //   presentation_request,
    //   auto_present,
    //   state,
    //   error_msg,
    //   presentation_exchange_id,
    //   role,
    //   connection_id,
    //   initiator,
    //   presentation,
    //   updated_at,
    //   created_at,
    //   verified,
    // } = data;

    // console.log(
    //   "Presentation: state =",
    //   state,
    //   ", presentation_exchange_id =",
    //   presentation_exchange_id,
    //   ", verified =",
    //   verified
    // );

    if (state === ProofRequestState.Verfied) {
      console.log(`Verified proof date: ${JSON.stringify(data)}`);
      const query = (await this.app.service("proof").find({
        query: {
          connection_id: data.connection_id,
        },
        paginate: false,
      })) as string[];
      const foundData = query[0] as Data;
      await this.app
        .service("proof")
        .update(foundData._id, data)
        .then(() => console.log("Success"))
        .catch((error) => console.log(error));
      //update current connection id to the related user data if proof is correct

      if (data.verified == "true") {
        console.log("CORRECT PROOF");
        const application_number =
          data.presentation.requested_proof.revealed_attrs[
            "0_application_number_uuid"
          ].raw;
        const connection_id = data.connection_id;

        this.app
          .service("user")
          .patch(ObjectID(application_number), {
            connection_id: connection_id,
          })
          .then(() => console.log("Success replace connection id"))
          .catch((error) => console.log(error));
      }
    }
    if (state === ProofRequestState.PresentationReceived) {
      const proof = await this.app.service("aries-agent").create({
        service: ServiceType.ProofReq,
        action: ServiceAction.Verify,
        data: {
          presentation_exchange_id: data.presentation_exchange_id,
        },
      });
      console.log("Proof =", this.util.inspect(proof));
    }
  }

  private async handleIssueCredential(data: Data): Promise<any> {
    switch (data.state) {
      case CredExState.RequestReceived:
        const attributes = data.credential_proposal_dict?.credential_proposal
          ?.attributes as AriesCredentialAttribute[];
        //need to add the credential exchange id (application_number) and tier value
        // const tier = tierChecker(attributes);
        // const generated_data = [
        //   {
        //     name: "tier",
        //     value: tier,
        //   },
        //   {
        //     name: "application_number",
        //     value: data.credential_exchange_id,
        //   },
        // ];

        // const attributes_with_extra_info = [...attributes, ...generated_data];

        console.log(`all data from webhook: ${this.util.inspect(data)}`);
        console.log(
          `all attributes from webhook: ${this.util.inspect(attributes)}`
        );
        const cred_exchange_data = await this.app
          .service("aries-agent")
          .create({
            service: ServiceType.CredEx,
            action: ServiceAction.Issue,
            data: {
              credential_exchange_id: data.credential_exchange_id,
              attributes: attributes,
              credential_definition_id: data.credential_definition_id,
            },
          });
        let cred_data: any = {};
        attributes.forEach((data: any) => {
          cred_data[data["name"]] = data["value"];
        });
        cred_data["cred_exchange_data"] = cred_exchange_data;
        cred_data["connection_id"] = data.connection_id;
        //find the current record
        // const user_id = (await this.app.service("user").find({
        //   query: {
        //     _id: ObjectID(cred_data.application_number),
        //   },
        //   paginate: false,
        // })) as string[];
        //

        //update the old data with new data
        //this is the data from the offer
        const response = await this.app
          .service("user")
          .update(ObjectID(cred_data.application_number), {
            ...cred_data,
          });
        console.log(`all attributes in mongo: ${this.util.inspect(cred_data)}`);
        return { result: "Success" };
      case CredExState.Issued:
        console.log(`Data from webhook issued ${JSON.stringify(data)}`);
        //this.app.service("user").update({})
        const query = (await this.app.service("user").find({
          query: {
            connection_id: data.connection_id,
          },
          paginate: false,
        })) as string[];
        const foundData = query[0] as Data;
        await this.app
          .service("user")
          .patch(foundData._id, { "cred_exchange_data.state": data.state })
          .then(() => console.log("Success"))
          .catch((error) => console.log(error));
        updateInviteRecord(
          { credential_exchange_id: data.credential_exchange_id },
          { issued: true },
          this.app
        );
        return { result: "Success" };
      case CredExState.OfferSent:
        console.log(`Offer send for data: ${this.util.inspect(data)} `);
        return { result: "Success" };
      default:
        console.warn(
          `Received unexpected state ${data.state} for cred_ex_id ${data.credential_exchange_id}`
        );
        return { status: `Unexpected state ${data.state}` };
    }
  }
}
