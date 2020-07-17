import { AriesCredentialDefinition } from "../models/credential-definition";

export function formatCredentialDefinition(
  revocation: boolean,
  schema_id: string,
  tag_value: string = "default"
): AriesCredentialDefinition {
  return {
    support_revocation: revocation,
    schema_id: schema_id,
    tag: tag_value,
  };
}
