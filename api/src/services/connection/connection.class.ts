import { Id, Params } from "@feathersjs/feathers";
import {
  ServiceSwaggerAddon,
  ServiceSwaggerOptions,
} from "feathers-swagger/types";
import { Application } from "../../declarations";
import {
  ConnectionServiceResponse,
  AriesInvitation,
} from "../../models/connection";
import { ServiceAction, ServiceType } from "../../models/enums";
import { AriesAgent } from "../aries-agent/aries-agent.class";

interface Data {}

interface ServiceOptions {}

export class Connection implements ServiceSwaggerAddon {
  app: Application;
  options: ServiceOptions;
  ariesInvitation: AriesInvitation | undefined;

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async get(id: Id, params?: Params): Promise<ConnectionServiceResponse> {
    return await this.app.service("aries-agent").create({
      service: ServiceType.Connection,
      action: ServiceAction.Fetch,
      data: { connection_id: id },
    });
  }

  async create(data: Data, params?: Params): Promise<AriesInvitation> {
    console.log("GOT A CREATE REQUEST");
    this.ariesInvitation = (await this.app.service("aries-agent").create({
      service: ServiceType.Connection,
      action: ServiceAction.Create,
      data: {},
    })) as AriesInvitation;
    const dumpValue = await this.app
      .service("connection-test")
      .create({
        connection_id: this.ariesInvitation.connection_id,
        state: "invitation",
      })
      .catch((thrown) =>
        console.log(`error in create connection class: ${thrown}`)
      );
    console.log(`CREATE A NEW RECORD: ${JSON.stringify(dumpValue)}`);
    return this.ariesInvitation;
  }

  docs: ServiceSwaggerOptions = {
    description: "Connection",
    idType: "string",
  };

  model = {
    title: "Connection",
    description: "Connection Model",
    type: "object",
    required: [],
    properties: {
      id: {
        type: "string",
        description: "The connection uuid",
        readOnly: true,
      },
      state: {
        type: "string",
        description: "The connection state",
        readOnly: true,
      },
    },
  };
}
