import { Db } from "mongodb";
import { Service, MongoDBServiceOptions } from "feathers-mongodb";
import { Application } from "../../declarations";
import { ServiceType, ServiceAction } from "../../models/enums";

export class RevocationRegistry extends Service {
  app: Application;
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);

    const client: Promise<Db> = app.get("mongoClient");

    client.then((db) => {
      this.Model = db.collection("revocation-registry");
    });
    this.app = app;
  }

  async create(data: any): Promise<any> {
    return this.app.service("aries-agent").create({
      service: ServiceType.RevocationResgitry,
      action: ServiceAction.Create,
      data: data,
    });
  }
}
