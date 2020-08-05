// Initializes the `connection-record` service on path `/connection-record`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { ConnectionRecord } from "./connection-record.class";
import hooks from "./connection-record.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "connection-record": ConnectionRecord & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {};

  // Initialize our service with any options it requires
  app.use("/connection-record", new ConnectionRecord(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("connection-record");

  service.hooks(hooks);
}
