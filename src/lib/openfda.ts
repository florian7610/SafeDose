const OPEN_FDA_DRUG_LABEL_URL = "https://api.fda.gov/drug/label.json";
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;
const MAX_SKIP = 25000;

interface OpenFdaMeta {
  results?: {
    total?: number;
  };
}

interface OpenFdaLabelRecord {
  id?: string;
  set_id?: string;
  purpose?: string[];
  description?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  drug_interactions?: string[];
  warnings?: string[];
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    spl_set_id?: string[];
  };
}

interface OpenFdaErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

interface OpenFdaDrugResponse extends OpenFdaErrorPayload {
  meta?: OpenFdaMeta;
  results?: OpenFdaLabelRecord[];
}

export interface DrugCatalogItem {
  id: string;
  brandName: string;
  genericName: string;
  manufacturerName: string;
  productType: string;
  route: string;
  summary: string;
  interactionSummary: string;
}

export interface DrugCatalogPage {
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  results: DrugCatalogItem[];
}

export class OpenFdaError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "OpenFdaError";
    this.status = status;
  }
}

function parsePositiveInteger(value: number | string | null | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

function getFirstValue(values?: string[]) {
  return values?.find((value) => value.trim().length > 0)?.trim() ?? "";
}

function toPreviewText(value: string, maxLength = 220) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function toDrugCatalogItem(record: OpenFdaLabelRecord): DrugCatalogItem {
  const brandName = getFirstValue(record.openfda?.brand_name) || getFirstValue(record.openfda?.generic_name) || "Unnamed drug";
  const genericName = getFirstValue(record.openfda?.generic_name) || "Generic name not listed";
  const manufacturerName = getFirstValue(record.openfda?.manufacturer_name) || "Manufacturer not listed";
  const productType = getFirstValue(record.openfda?.product_type) || "Drug label";
  const route = getFirstValue(record.openfda?.route) || "Route not listed";
  const summary =
    toPreviewText(
      getFirstValue(record.indications_and_usage) ||
        getFirstValue(record.purpose) ||
        getFirstValue(record.description) ||
        getFirstValue(record.dosage_and_administration) ||
        "No label summary available for this drug.",
    );
  const interactionSummary =
    toPreviewText(
      getFirstValue(record.drug_interactions) ||
        getFirstValue(record.warnings) ||
        "No interaction guidance is listed on this label entry.",
    );
  const fallbackId = `${brandName}-${genericName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: record.id || record.set_id || getFirstValue(record.openfda?.spl_set_id) || fallbackId || "drug-label",
    brandName,
    genericName,
    manufacturerName,
    productType,
    route,
    summary,
    interactionSummary,
  };
}

function buildSearchQuery(query?: string | null) {
  const trimmed = query?.trim();
  if (!trimmed) {
    return "_exists_:openfda.brand_name";
  }

  const sanitized = trimmed.replace(/"/g, "");
  const tokenized = sanitized.split(/\s+/).filter(Boolean).join("+");

  if (!tokenized) {
    return "_exists_:openfda.brand_name";
  }

  return `openfda.brand_name:${tokenized}+OR+openfda.generic_name:${tokenized}`;
}

export async function fetchDrugCatalogPage(options: {
  page?: number | string | null;
  pageSize?: number | string | null;
  query?: string | null;
}): Promise<DrugCatalogPage> {
  const page = parsePositiveInteger(options.page, 1);
  const pageSize = Math.min(parsePositiveInteger(options.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  if (skip > MAX_SKIP) {
    throw new OpenFdaError("Requested page is outside the supported OpenFDA pagination range.", 400);
  }

  const url = new URL(OPEN_FDA_DRUG_LABEL_URL);
  url.searchParams.set("search", buildSearchQuery(options.query));
  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("skip", String(skip));

  if (process.env.OPENFDA_API_KEY) {
    url.searchParams.set("api_key", process.env.OPENFDA_API_KEY);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
    },
  });

  const payload = (await response.json()) as OpenFdaDrugResponse;

  if (!response.ok) {
    throw new OpenFdaError(payload.error?.message || "OpenFDA request failed.", response.status);
  }

  const results = (payload.results ?? []).map(toDrugCatalogItem);
  const totalResults = payload.meta?.results?.total ?? results.length;
  const totalPages = Math.max(1, Math.min(Math.ceil(totalResults / pageSize), Math.floor(MAX_SKIP / pageSize) + 1));

  return {
    page,
    pageSize,
    totalResults,
    totalPages,
    results,
  };
}