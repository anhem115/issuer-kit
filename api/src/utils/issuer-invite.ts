import { Application } from "@feathersjs/express";
import { TokenValidationResponse } from "../models/token";
import { Db } from "mongodb";

export async function updateInviteRecord(
  filter: any,
  fields: any,
  app: Application
) {
  const client: Promise<Db> = app.get("mongoClient");

  client.then(async (db) => {
    await db
      .collection("issuer-invite")
      .findOneAndUpdate(filter, { $set: fields });
  });
}

export async function storeCredentialExchangeInfo(
  fields: any,
  app: Application
) {
  const client: Promise<Db> = app.get("mongoClient");

  client.then(async (db) => {
    await db.collection("credential_exchange").insertOne(fields);
  });
}

export async function getCredentialExchangeInfo(fields: any, app: Application) {
  const client: Promise<Db> = app.get("mongoClient");
  const collection: any = await client.then(
    async (db) =>
      await new Promise((resolve) =>
        db
          .collection("credential_exchange")
          .find({
            "credExchangeData.credential_exchange_id":
              "b38c3206-739c-4440-9896-8ed77a174ee9",
          })
          .toArray(function (err, docs) {
            if (err == null) {
              console.log("Found the following records");
              console.log(docs);
              resolve(docs);
            } else {
              console.log(`Error :${JSON.stringify(err)}`);
            }
          })
      ).then((data) => data)
    // return result;
  );
  // const data = await client
  //   .then(async (db) => {
  //     const value = await db.collection("credential_exchange").find({
  //       "credExchangeData.credential_exchange_id":
  //         "b38c3206-739c-4440-9896-8ed77a174ee9",
  //     });
  //     return value;
  //   })
  //   .catch((error) => `ERROR in mongo: ${error}`);
  return collection;
}

function isIssued(issued: boolean, multiUse: boolean): boolean {
  if (multiUse) {
    return false;
  } else {
    return issued || multiUse;
  }
}

export async function isValidInvite(
  token: string,
  app: Application
): Promise<TokenValidationResponse> {
  const client: Promise<Db> = app.get("mongoClient");
  const issuer = app.get("issuer");

  return client.then(async (db) => {
    const invite = await db
      .collection("issuer-invite")
      .findOne({ token: token });

    if (!invite) {
      return { token: token } as TokenValidationResponse;
    }

    return {
      token: invite.token,
      issued: isIssued(invite.issued, issuer.multiUse),
      expired: invite.expiry?.getTime() <= Date.now(),
      data: invite.data,
    } as TokenValidationResponse;
  });
}
