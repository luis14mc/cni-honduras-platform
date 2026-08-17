/** Nested lite shapes returned by the Django investment serializers. */

export interface SectorLite {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color_hex: string;
}

export interface DepartmentLite {
  id: number;
  name: string;
  slug: string;
  code: string;
}

export interface CNIRegion {
  id: number;
  name: string;
  slug: string;
  description: string;
  color_hex: string;
  geometry: GeoJSON.Geometry | null;
  departments: DepartmentLite[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Municipality {
  id: number;
  department: DepartmentLite;
  name: string;
  slug: string;
  code: string;
  description: string;
  geometry: GeoJSON.Geometry | null;
  center_lat: number | null;
  center_lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  icon: string;
  image: string | null;
  color_hex: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
}

export type OpportunityStatus = "open" | "in_progress" | "closed";

export interface OpportunityMetric {
  id: number;
  label: string;
  value: string;
  note: string;
  icon: string;
  order: number;
  is_public?: boolean;
}

export interface OpportunityFundUse {
  id: number;
  component: string;
  amount: string | null;
  description: string;
  order: number;
}

export interface InvestmentOpportunity {
  id: number;
  code: string;
  title: string;
  slug: string;
  summary: string;
  /** Not returned by the public teaser API — kept optional for admin/legacy. */
  description?: string;
  opportunity_description?: string;
  target_customer?: string;
  market_demand?: string;
  value_proposition?: string;
  sector: SectorLite | null;
  department?: DepartmentLite | null;
  region?: CNIRegion | null;
  estimated_investment: string | null;
  estimated_jobs: number | null;
  status: OpportunityStatus;
  lifecycle_status?: OpportunityStatus;
  is_public: boolean;
  is_featured: boolean;
  order?: number;
  metrics?: OpportunityMetric[];
  fund_uses?: OpportunityFundUse[];
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProjectStage =
  | "promotion"
  | "announced"
  | "startup"
  | "implementing"
  | "stalled"
  | "finished"
  | "cancelled";

export interface InvestmentProject {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  sector: SectorLite;
  department: DepartmentLite | null;
  region: CNIRegion | null;
  municipality: Municipality | null;
  investment_amount: string | null;
  estimated_jobs: number | null;
  project_stage: ProjectStage;
  is_public: boolean;
  is_featured: boolean;
}

export interface SuccessStory {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  sector: SectorLite | null;
  summary: string;
  content: string;
  rich_content?: import("@/src/lib/strapi/blocks").StrapiBlock[] | null;
  image: string | null;
  logo: import("@/src/types/cms").MediaAssetLite | null;
  featured_image?: import("@/src/types/cms").MediaAssetLite | null;
  person_photo?: import("@/src/types/cms").MediaAssetLite | null;
  person_name?: string;
  person_role?: string;
  country_origin: string;
  investment_amount: string | null;
  jobs_generated: number | null;
  testimonial_quote: string;
  testimonial_author: string;
  is_featured: boolean;
  order: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}
