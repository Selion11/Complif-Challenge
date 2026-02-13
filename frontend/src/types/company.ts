export interface Company {
  id: string;
  name: string;
  cuit: string;
  country: string;
  industry: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
}