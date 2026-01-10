export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
  accountNumbers?: string[];
}

export enum Role {
  CLIENT = 'CLIENT',
  AGENT_BANCAIRE = 'AGENT_BANCAIRE',
  ADMIN = 'ADMIN'
}
