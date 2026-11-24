import { createServer } from "node:http";

const origin = "http://127.0.0.1:4327";
const category = { documentId: "guides", slug: "guias", title: "Guías", description: "Guías técnicas" };
const baseDocument = {
  category: "biblioteca",
  resource_category: category,
  publishedAt: "2026-11-23T17:00:00Z",
  description: "Documento de prueba del catálogo",
};
const documents = [
  { ...baseDocument, id: 1, documentId: "freedoc", access: "free", slug: "guia-libre", title: "Guía libre",
    file: { url: `${origin}/free.pdf`, mime: "application/pdf" } },
  { ...baseDocument, id: 2, documentId: "gateddoc", access: "gated", slug: "guia-restringida", title: "Guía restringida",
    document_type: "project_sheet", sector: "turismo", file: { url: `${origin}/must-not-leak.pdf` } },
  { ...baseDocument, id: 3, documentId: "otherdoc", access: "gated", slug: "guia-adicional", title: "Guía adicional" },
];
const articleSlug = "inversion-productiva-prueba";
const articleTitles = { es: "Impulso a la inversión productiva", en: "Supporting productive investment" };
const sector = { id: 1, name: "Turismo", slug: "turismo", order: 1, is_active: true };
const department = { id: 5, name: "Cortés", slug: "cortes", code: "05", is_active: true };

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

function json(response, data, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  response.end(JSON.stringify(data));
}

createServer(async (request, response) => {
  const url = new URL(request.url, origin);
  const { pathname, searchParams } = url;
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type" }).end();
    return;
  }
  if (pathname === "/health") return json(response, { ok: true });
  if (pathname === "/api/news") {
    const title = articleTitles[searchParams.get("locale")];
    const slug = searchParams.get("filters[slug][$eq]");
    const data = title && (!slug || slug === articleSlug)
      ? [{ id: 1, slug: articleSlug, title, summary: title, published_date: "2026-11-23", category: "news" }]
      : [];
    return json(response, { data, meta: {} });
  }
  if (pathname === "/api/v1/investment/sectors/") return json(response, [sector]);
  if (pathname === "/api/v1/geo/departments/geojson/") {
    return json(response, { type: "FeatureCollection", features: [{ type: "Feature", properties: department, geometry: null }] });
  }
  if (pathname === "/api/v1/geo/municipalities/geojson/") {
    return json(response, { type: "FeatureCollection", features: [] });
  }
  if (pathname === "/api/v1/forms/project-application/" && request.method === "POST") {
    const payload = await readJson(request);
    if (!payload.consent || payload.sector !== sector.slug || payload.department !== department.slug) {
      return json(response, { detail: "Invalid submission" }, 400);
    }
    return json(response, { reference_code: "CNI-QA-001" }, 201);
  }
  if (pathname === "/api/resource-categories") return json(response, { data: [category], meta: {} });
  if (pathname === "/api/documents") return json(response, {
    data: searchParams.get("locale") === "es" && !searchParams.has("filters[document_type][$eq]") ? documents : [], meta: {},
  });
  if (pathname === "/api/v1/forms/resource-download/" && request.method === "POST") {
    const { consent, remember_token: token, strapi_document_id: id } = await readJson(request);
    if (!consent && token !== "test-session") return json(response, { detail: "Missing consent" }, 400);
    return json(response, { download_url: `${origin}/private.pdf?sig=fixture&id=${id}`, remember_token: "test-session", expires_in: 900 }, 201);
  }
  if (pathname === "/free.pdf" || (pathname === "/private.pdf" && searchParams.get("sig") === "fixture")) {
    response.writeHead(200, { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${pathname.slice(1)}"` }).end("%PDF-test-fixture");
    return;
  }
  json(response, { data: [], results: [], count: 0, meta: {} });
}).listen(4327, "127.0.0.1");
