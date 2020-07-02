import { Db } from "mongodb";
import { Service, MongoDBServiceOptions } from "feathers-mongodb";
import { Application } from "../../declarations";
import {
  ServiceAction,
  ServiceType,
  ProofRequestState,
} from "../../models/enums";
import { Params } from "@feathersjs/feathers";

export class Proof extends Service {
  app: Application;

  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);

    const client: Promise<Db> = app.get("mongoClient");

    client.then((db) => {
      this.Model = db.collection("proof");
    });
    this.app = app;
  }

  async get(): Promise<any> {
    return { test: true };
  }

  async create(data: any, params?: Params): Promise<any> {
    console.log(`Receive request from front end: ${JSON.stringify(data)}`);
    if (data.connection_id !== "undefined") {
      const proof = await this.app.service("aries-agent").create({
        service: ServiceType.ProofReq,
        action: ServiceAction.SendRequest,
        data: data,
      });
      console.log("Post Promise in proof.class.ts");
      super.create({
        connection_id: data.connection_id,
        state: ProofRequestState.ProposalSent,
        verified: false,
      });
      return proof;
    } else {
      return {};
    }
  }
}
