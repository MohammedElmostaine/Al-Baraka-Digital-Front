export interface OperationRequest {
  //type: OperationType;
  type : String;
  amount: number;
  destinationAccountNumber?: string;
}
