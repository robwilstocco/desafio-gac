export type OperationType = 'default' | 'deposit' | 'transfer';

export interface ISession {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
}
export interface IUser {
  id: string;
  accountNumber: string;
  name: string;
  email: string;
  password: string;
  balance: number;
  operations: IOperation[];
}

export interface IOperation {
  id: string;
  date: string;
  operationType: string;
  transferedTo?: string;
  receivedFrom?: string;
  value: number;
  reverted: boolean;
}
