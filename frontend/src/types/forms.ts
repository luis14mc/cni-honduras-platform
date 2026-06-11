export interface ProjectApplicationPayload {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  source?: string;
  project_name?: string;
  sector: string;
  department?: string;
  project_location?: string;
  investment_range?: string;
  estimated_investment?: string | number | null;
  expected_jobs?: number | null;
  details: string;
  message?: string;
  consent: boolean;
}

export interface ProjectApplicationResponse extends ProjectApplicationPayload {
  id: number;
  status: string;
  crm_synced: boolean;
  crm_record_id: string;
  created_at: string;
  updated_at: string;
}
