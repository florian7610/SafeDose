"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPackage } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import type { DrugCatalogPage } from "@/lib/openfda";

const PAGE_SIZE = 12;

const emptyCatalog: DrugCatalogPage = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalResults: 0,
  totalPages: 1,
  results: [],
};

export default function DrugsPage() {
  const [catalog, setCatalog] = useState<DrugCatalogPage>(emptyCatalog);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadDrugs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/drugs?page=${page}&pageSize=${PAGE_SIZE}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as DrugCatalogPage | { message?: string };

        if (!response.ok) {
          throw new Error("message" in payload ? payload.message || "Failed to load drug labels." : "Failed to load drug labels.");
        }

        setCatalog(payload as DrugCatalogPage);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load drug labels.");
        setCatalog(emptyCatalog);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadDrugs();

    return () => {
      controller.abort();
    };
  }, [page]);

  const rangeStart = catalog.totalResults === 0 ? 0 : (catalog.page - 1) * catalog.pageSize + 1;
  const rangeEnd = catalog.totalResults === 0 ? 0 : Math.min(catalog.page * catalog.pageSize, catalog.totalResults);

  return (
    <AppShell title="Drug Directory" subtitle="Browse paginated FDA drug labels powered by openFDA">
      <section className="card-box" style={{ marginBottom: "20px" }}>
        <div className="section-hdr">
          <h3>OpenFDA Catalog</h3>
          <span className="view-all">{catalog.totalResults.toLocaleString()} labels</span>
        </div>

        <p className="drugs-intro">
          SafeDose is now pulling label data directly from the FDA drug labeling dataset. This page stays paginated so large result sets remain fast and readable.
        </p>

        <div className="drugs-meta">
          <span className="drugs-chip">Showing {rangeStart}-{rangeEnd}</span>
          <span className="drugs-chip">Page {catalog.page} of {catalog.totalPages}</span>
          <span className="drugs-chip">{catalog.pageSize} labels per page</span>
        </div>
      </section>

      {error ? (
        <section className="card-box" style={{ marginBottom: "20px" }}>
          <p className="catalog-error">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="card-box">
          <p className="catalog-empty">Loading drug labels...</p>
        </section>
      ) : catalog.results.length === 0 ? (
        <section className="card-box">
          <p className="catalog-empty">No drug labels were returned for this page.</p>
        </section>
      ) : (
        <section className="drugs-grid">
          {catalog.results.map((drug) => (
            <article key={drug.id} className="drug-card">
              <div className="drug-card-head">
                <div className="drug-card-icon">
                  <FiPackage />
                </div>

                <div>
                  <h3 className="drug-brand">{drug.brandName}</h3>
                  <p className="drug-generic">Generic: {drug.genericName}</p>
                  <p className="drug-maker">Manufacturer: {drug.manufacturerName}</p>
                </div>
              </div>

              <div className="drug-tag-row">
                <span className="drug-tag">{drug.productType}</span>
                <span className="drug-tag">Route: {drug.route}</span>
              </div>

              <p className="drug-copy">
                <strong>Label Summary</strong>
                {drug.summary}
              </p>

              <p className="drug-copy">
                <strong>Interaction Guidance</strong>
                {drug.interactionSummary}
              </p>
            </article>
          ))}
        </section>
      )}

      <div className="drug-pagination">
        <button
          className="pager-btn"
          type="button"
          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          disabled={page === 1 || isLoading}
        >
          <FiChevronLeft />
          Previous
        </button>

        <div className="pager-status">
          {catalog.totalResults.toLocaleString()} total labels available through the current OpenFDA result window.
        </div>

        <button
          className="pager-btn"
          type="button"
          onClick={() => setPage((currentPage) => Math.min(catalog.totalPages, currentPage + 1))}
          disabled={page >= catalog.totalPages || isLoading}
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </AppShell>
  );
}