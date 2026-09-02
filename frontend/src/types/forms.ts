export interface ProjectApplicationPayload {
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  company_name: string;
  website?: string;
  project_name: string;
  sector: string;
  project_description: string;
  investment_range: "under_10m" | "10m_50m" | "50m_100m" | "over_100m";
  estimated_jobs: number | null;
  department: string;
  municipality: string | null;
  consent: boolean;
  company_fax: string;
}

export interface ProjectApplicationResponse {
  reference_code: string;
  status: string;
  created_at: string;
}
