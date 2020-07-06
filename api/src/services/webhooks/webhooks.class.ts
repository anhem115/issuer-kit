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
import { updateInviteRecord } from "../../utils/issuer-invite";
import { AriesCredentialAttribute } from "../../models/credential-exchange";

interface Data {
  state?: CredExState;
  credential_exchange_id?: string;
  credential_proposal_dict?: any;
  connection_id?: any;
  _id?: any;
  presentation_exchange_id?: string;
  verified?: string;
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
    console.log(`data: ${JSON.stringify(data)}`);
    const query = (await this.app.service("connection-test").find({
      query: {
        connection_id: data.connection_id,
      },
      paginate: false,
    })) as string[];
    console.log(`Before: ${JSON.stringify(query)}`);
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
    console.log(`After: ${JSON.stringify(afterquery)}`);
  }

  private async handleProofRequest(data: Proof) {
    // console.log(`Receice webhook! with data: ${JSON.stringify(data)}`);

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
      console.log("Proof =", JSON.stringify(proof));
    }
  }

  private async handleIssueCredential(data: Data): Promise<any> {
    switch (data.state) {
      case CredExState.RequestReceived:
        const attributes = data.credential_proposal_dict?.credential_proposal
          ?.attributes as AriesCredentialAttribute[];
        await this.app.service("aries-agent").create({
          service: ServiceType.CredEx,
          action: ServiceAction.Issue,
          data: {
            credential_exchange_id: data.credential_exchange_id,
            attributes: attributes,
          },
        });
        return { result: "Success" };
      case CredExState.Issued:
        console.log(
          `Credential issued for cred_ex_id ${data.credential_exchange_id}`
        );
        updateInviteRecord(
          { credential_exchange_id: data.credential_exchange_id },
          { issued: true },
          this.app
        );
        return { result: "Success" };
      default:
        console.warn(
          `Received unexpected state ${data.state} for cred_ex_id ${data.credential_exchange_id}`
        );
        return { status: `Unexpected state ${data.state}` };
    }
  }
}
