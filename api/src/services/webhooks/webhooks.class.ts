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
        const tier = tierChecker(attributes);
        const generated_data = [
          {
            name: "tier",
            value: tier,
          },
          {
            name: "application_number",
            value: data.credential_exchange_id,
          },
        ];

        const attributes_with_extra_info = [...attributes, ...generated_data];

        const cred_exchange_data = await this.app
          .service("aries-agent")
          .create({
            service: ServiceType.CredEx,
            action: ServiceAction.Issue,
            data: {
              credential_exchange_id: data.credential_exchange_id,
              credential_defnition_id: data.credential_definition_id,
              attributes: attributes_with_extra_info,
            },
          });
        console.log(
          `all data: ${this.util.inspect(attributes_with_extra_info)}`
        );
        let cred_data: any = {};
        attributes_with_extra_info.forEach((data: any) => {
          cred_data[data["name"]] = data["value"];
        });
        cred_data["cred_exchange_data"] = cred_exchange_data;
        cred_data["connection_id"] = data.connection_id;
        const response = await this.app.service("user").create({
          ...cred_data,
        });
        // await storeCredentialExchangeInfo(
        //   {
        //     ...cred_data,
        //   },
        //   this.app
        // );
        console.log(`all attributes: ${this.util.inspect(cred_data)}`);
        return { result: "Success" };
      case CredExState.Issued:
        console.log(
          `Credential issued for cred_ex_id ${data.credential_exchange_id}`
        );
        //this.app.service("user").update({})
        const query = (await this.app.service("user").find({
          query: {
            application_number: data.credential_exchange_id,
            connection_id: data.connection_id,
          },
          paginate: false,
        })) as string[];
        const foundData = query[0] as Data;
        await this.app
          .service("user")
          .patch(foundData._id, { cred_exchange_data: { state: data.state } })
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
      default:
        console.warn(
          `Received unexpected state ${data.state} for cred_ex_id ${data.credential_exchange_id}`
        );
        return { status: `Unexpected state ${data.state}` };
    }
  }
}
