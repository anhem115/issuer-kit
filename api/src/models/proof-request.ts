export interface ProofRequest {
  presentation_exchange_id?: string;
  connection_id: string;
  thread_id?: string;
  initiator?: string;
  state: string;
  presentation_proposal_dict?: string;
  presentation_request?: any;
  presentation?: any;
  verified: string;
  auto_present?: boolean;
  error_msg?: string;
}
