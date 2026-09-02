import { z } from "zod";
import type { ProjectApplicationPayload } from "@/src/types/forms";

export const investmentRanges = ["under_10m", "10m_50m", "50m_100m", "over_100m"] as const;

export const projectSubmissionFields = [
  "contact_name", "email", "phone", "country", "company_name", "website", "project_name",
  "sector", "project_description", "investment_range", "estimated_jobs", "department",
  "municipality", "consent", "company_fax",
] as const;
export type ProjectSubmissionField = (typeof projectSubmissionFields)[number];
export type ProjectSubmissionValues = Record<Exclude<ProjectSubmissionField, "consent">, string> & { consent: boolean };
export type FieldErrors = Partial<Record<ProjectSubmissionField, string>>;

export const emptyProjectSubmission: ProjectSubmissionValues = {
  contact_name: "", email: "", phone: "", country: "", company_name: "", website: "",
  project_name: "", sector: "", project_description: "", investment_range: "", estimated_jobs: "",
  department: "", municipality: "", consent: false, company_fax: "",
};

const schema = z.object({
  contact_name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  country: z.string().trim().min(1),
  company_name: z.string().trim().min(1),
  website: z.union([z.literal(""), z.string().trim().url()]),
  project_name: z.string().trim().min(1),
  sector: z.string().trim().min(1),
  project_description: z.string().trim().min(20),
  investment_range: z.enum(investmentRanges),
  estimated_jobs: z.union([z.literal(""), z.string().regex(/^\d+$/)]),
  department: z.string().trim().min(1),
  municipality: z.string(),
  consent: z.literal(true),
  company_fax: z.string().max(0),
});

export function validateProjectSubmission(values: ProjectSubmissionValues, messages: Record<"required" | "email" | "url" | "description" | "jobs" | "consent", string>): FieldErrors {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ProjectSubmissionField;
    if (errors[field]) continue;
    if (field === "email") errors[field] = messages.email;
    else if (field === "website") errors[field] = messages.url;
    else if (field === "project_description") errors[field] = messages.description;
    else if (field === "estimated_jobs") errors[field] = messages.jobs;
    else if (field === "consent") errors[field] = messages.consent;
    else errors[field] = messages.required;
  }
  return errors;
}

export function firstInvalidField(errors: FieldErrors): ProjectSubmissionField | undefined {
  return projectSubmissionFields.find((field) => Boolean(errors[field]));
}

export function resetMunicipalityOnDepartmentChange(values: ProjectSubmissionValues, department: string): ProjectSubmissionValues {
  return { ...values, department, municipality: "" };
}

export function buildProjectApplicationPayload(values: ProjectSubmissionValues): ProjectApplicationPayload {
  const jobs = values.estimated_jobs === "" ? null : Number(values.estimated_jobs);
  return {
    contact_name: values.contact_name.trim(), email: values.email.trim(), phone: values.phone.trim(),
    country: values.country.trim(), company_name: values.company_name.trim(),
    ...(values.website.trim() ? { website: values.website.trim() } : {}),
    project_name: values.project_name.trim(), sector: values.sector,
    project_description: values.project_description.trim(),
    investment_range: values.investment_range as ProjectApplicationPayload["investment_range"],
    estimated_jobs: jobs, department: values.department, municipality: values.municipality || null,
    consent: values.consent, company_fax: values.company_fax,
  };
}

export function apiFieldErrors(data: unknown): FieldErrors {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const errors: FieldErrors = {};
  for (const field of projectSubmissionFields) {
    const value = (data as Record<string, unknown>)[field];
    if (typeof value === "string") errors[field] = value;
    else if (Array.isArray(value) && typeof value[0] === "string") errors[field] = value[0];
  }
  return errors;
}

export function beginSubmission(inFlight: boolean): { allowed: boolean; inFlight: boolean } {
  return inFlight ? { allowed: false, inFlight: true } : { allowed: true, inFlight: true };
}
