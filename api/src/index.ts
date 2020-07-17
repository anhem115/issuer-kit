import logger from "./logger";
import app from "./app";

const port = app.get("port");
const ledgerUrl = app.get("port");
const server = app.listen(port);

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () =>
  logger.info(
    "Feathers application started on http://%s:%d with ledger: %s, tails server: %s, tag: %s",
    app.get("host"),
    port,
    app.get("ledgerUrl"),
    app.get("publicTailsUrl"),
    app.get("credentialDefinitionTag")
  )
);
