// Initializes the `proof` service on path `/proof`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Proof } from "./proof.class";
import hooks from "./proof.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    proof: Proof & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/proof", new Proof({}, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("proof");

  service.hooks(hooks);
}
