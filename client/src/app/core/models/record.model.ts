export interface WorkRecord {
  id: string;
  ownerUserId: string;
  customer: string;
  region: string;
  category: string;
  amount: number;
  risk: 'Low' | 'Medium' | 'High';
  status: string;
}

export interface RecordsResponse {
  records: WorkRecord[];
  accessNote: string;
}
