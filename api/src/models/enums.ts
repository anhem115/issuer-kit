export enum ServiceAction {
  Create,
  Fetch,
  Issue,
  Verify,
  SendRequest,
}

export enum ServiceType {
  Connection,
  CredEx,
  CredDef,
  ProofReq,
  RevocationResgitry,
}

export enum WebhookTopic {
  Connections = "connections",
  IssueCredential = "issue_credential",
  ProofRequest = "present_proof",
}

export enum CredExState {
  OfferSent = "offer_sent",
  RequestReceived = "request_received",
  Issued = "credential_issued",
}

export enum ProofRequestState {
  ProposalSent = "proposal_sent",
  ProposalReceived = "proposal_received",
  RequestSent = "request_sent",
  RequestReceived = "request_received",
  PresentationSent = "presentation_sent",
  PresentationReceived = "presentation_received",
  Verfied = "verified",
}
