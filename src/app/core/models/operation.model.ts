import { OperationType } from './OperationType.model';
import { OperationStatus } from './OperationStatus.model';

export interface Operation {
  id: number;
  type: OperationType;
  amount: number;
  status: OperationStatus;
  createdAt: string;
  validatedAt?: string;
  executedAt?: string;
  sourceAccountNumber: string;
  destinationAccountNumber?: string;
  message?: string;
  requiresDocument: boolean;
  hasDocument: boolean;
}
