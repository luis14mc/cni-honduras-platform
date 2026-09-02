import { describe, expect, it } from "vitest";
import { apiFieldErrors, beginSubmission, buildProjectApplicationPayload, emptyProjectSubmission, firstInvalidField, resetMunicipalityOnDepartmentChange, validateProjectSubmission } from "./projectSubmission";

const messages = { required: "required", email: "email", url: "url", description: "description", jobs: "jobs", consent: "consent" };
const valid = { ...emptyProjectSubmission, contact_name: "Ada", email: "ada@example.com", phone: "123", country: "HN", company_name: "CNI", project_name: "Solar", sector: "energy", project_description: "A sufficiently detailed project description.", investment_range: "10m_50m", estimated_jobs: "12", department: "francisco-morazan", municipality: "distrito-central", consent: true };

describe("project submission", () => {
  it("validates required values and returns deterministic first field", () => {
    const errors = validateProjectSubmission(emptyProjectSubmission, messages);
    expect(errors.email).toBe("email");
    expect(firstInvalidField(errors)).toBe("contact_name");
  });
  it("accepts a valid application", () => expect(validateProjectSubmission(valid, messages)).toEqual({}));
  it("clears municipality when department changes", () => expect(resetMunicipalityOnDepartmentChange(valid, "cortes").municipality).toBe(""));
  it("builds exact API aliases, codes and honeypot", () => expect(buildProjectApplicationPayload(valid)).toMatchObject({ contact_name: "Ada", company_name: "CNI", investment_range: "10m_50m", estimated_jobs: 12, department: "francisco-morazan", municipality: "distrito-central", company_fax: "" }));
  it("uses null for optional municipality and jobs", () => expect(buildProjectApplicationPayload({ ...valid, estimated_jobs: "", municipality: "" })).toMatchObject({ estimated_jobs: null, municipality: null }));
  it("maps DRF field errors and ignores unknown keys", () => expect(apiFieldErrors({ email: ["Taken"], source: ["No"] })).toEqual({ email: "Taken" }));
  it("guards double submission", () => { expect(beginSubmission(false).allowed).toBe(true); expect(beginSubmission(true).allowed).toBe(false); });
});
