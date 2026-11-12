
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PAGE_SIZE = 10;

type ReportType = "violation" | "service" | "both";

type PublicReport = {
  id: number;
  report_type: ReportType;
  violation: string | null;
  authority: string | null;
  consequence: string | null;
  violation_amount_demanded: number | null;
  violation_amount_paid: number | null;
  fine: number | null;
  department: string | null;
  service: string | null;
  service_amount_demanded: number | null;
  service_amount_paid: number | null;
  official_fee: number | null;
  state: string;
  city: string;
  incident_date: string | null;
  outcome: string | null;
  created_at: string;
};

function getDepartment(report: PublicReport) {
  return (
    report.department ||
    report.authority ||
    report.violation ||
    report.service ||
    "Department not specified"
  );
}

function getCategory(report: PublicReport) {
  if (report.report_type === "both") {
    return "Both";
  }

  return report.report_type === "violation"
    ? "Enforcement-related"
    : "Service-related";
}

function getAmount(report: PublicReport) {
  const amounts = [
    report.violation_amount_demanded,
    report.service_amount_demanded,
  ].filter((amount): amount is number => amount !== null);

  if (amounts.length === 0) return null;

  return amounts.reduce((total, amount) => total + amount, 0);
}

function formatAmount(amount: number | null) {
  if (amount === null) return "Not disclosed";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchReports() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/public/reports?limit=100&offset=0`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve reports.");
      }

      const data: PublicReport[] = await response.json();
      setReports(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const availableStates = useMemo(() => {
    return Array.from(
      new Set(reports.map((report) => report.state))
    ).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((report) => {
        const searchableText = [
          report.city,
          report.state,
          report.department,
          report.authority,
          report.violation,
          report.service,
          report.consequence,
          getCategory(report),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    if (category !== "all") {
      result = result.filter(
        (report) => report.report_type === category
      );
    }

    if (selectedState !== "all") {
      result = result.filter(
        (report) => report.state === selectedState
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    }

    if (sortBy === "highest") {
      result.sort(
        (a, b) => (getAmount(b) ?? -1) - (getAmount(a) ?? -1)
      );
    }

    if (sortBy === "lowest") {
      result.sort(
        (a, b) => (getAmount(a) ?? Infinity) - (getAmount(b) ?? Infinity)
      );
    }

    return result;
  }, [reports, search, category, selectedState, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / PAGE_SIZE)
  );

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, selectedState, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSelectedState("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#171717]">

      {/* NAVIGATION */}
      <nav className="border-b border-[#DEDAD1] bg-[#F8F7F3]">
        <div className="mx-auto flex h-[76px] max-w-[1120px] items-center justify-between px-6">

          <Link href="/" className="serif text-[25px] font-bold">
            UnderTheTable
            <span className="text-[#B49B2D]">.</span>
          </Link>

          <div className="hidden items-center gap-8 text-[13px] md:flex">
            <Link href="/" className="text-[#77746D] hover:text-black">
              Home
            </Link>

            <Link href="/reports" className="border-b-2 border-black py-2">
              Reports
            </Link>

            <Link href="/departments" className="text-[#77746D] hover:text-black">
              Departments
            </Link>

            <Link href="/map" className="text-[#77746D] hover:text-black">
              Map
            </Link>

            <Link href="/about" className="text-[#77746D] hover:text-black">
              About
            </Link>
          </div>

          <Link
            href="/report"
            className="bg-black px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#393939]"
          >
            REPORT AN EXPERIENCE →
          </Link>

        </div>
      </nav>

      {/* PAGE HEADER */}
      <section className="mx-auto max-w-[1120px] px-6 pb-12 pt-16">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-[#77746D] hover:text-black"
        >
          <ArrowLeft size={14} />
          Back to homepage
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A18D2B]">
          The public registry
        </p>

        <h1 className="serif mt-4 text-5xl tracking-tight md:text-6xl">
          Report registry.
        </h1>

        <p className="mt-5 max-w-[620px] text-sm leading-7 text-[#77746D]">
          Explore citizen-reported experiences involving unofficial
          payments across India. Reports displayed here have passed
          moderation and have publication consent.
        </p>

        <div className="mt-8 flex flex-wrap gap-5 border-y border-[#DEDAD1] py-4 text-[10px] text-[#77746D]">
          <span className="flex items-center gap-2">
            <FileText size={15} />
            Publicly approved reports
          </span>

          <span className="flex items-center gap-2">
            <MapPin size={15} />
            Across India
          </span>
        </div>

      </section>

      {/* REGISTRY */}
      <section className="mx-auto max-w-[1120px] px-6 pb-24">

        {/* SEARCH */}
        <div className="border border-[#DEDAD1] bg-white p-5 md:p-7">

          <div className="mb-6 flex items-center gap-3">
            <SlidersHorizontal size={18} />

            <h2 className="serif text-2xl">
              Explore the registry
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="report-search"
                className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
              >
                Search reports
              </label>

              <div className="mt-2 flex items-center border border-[#DEDAD1] bg-[#FDFCF9] px-4">
                <Search size={17} className="shrink-0 text-[#96938B]" />

                <input
                  id="report-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search department, city or state..."
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
              >
                Report category
              </label>

              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full border border-[#DEDAD1] bg-[#FDFCF9] px-4 py-3 text-sm outline-none focus:border-[#A99432]"
              >
                <option value="all">All categories</option>
                <option value="violation">Enforcement-related</option>
                <option value="service">Government services</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="state-filter"
                className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
              >
                State / Union Territory
              </label>

              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="mt-2 w-full border border-[#DEDAD1] bg-[#FDFCF9] px-4 py-3 text-sm outline-none focus:border-[#A99432]"
              >
                <option value="all">All states and UTs</option>

                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort-filter"
                className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
              >
                Sort reports
              </label>

              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-2 w-full border border-[#DEDAD1] bg-[#FDFCF9] px-4 py-3 text-sm outline-none focus:border-[#A99432]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount demanded</option>
                <option value="lowest">Lowest amount demanded</option>
              </select>
            </div>

          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

            <button
              onClick={clearFilters}
              className="text-xs text-[#77746D] underline underline-offset-4 hover:text-black"
            >
              Clear all filters
            </button>

            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 border border-[#DEDAD1] px-4 py-2 text-xs hover:bg-[#F8F7F3] disabled:opacity-50"
            >
              <RefreshCw size={13} />
              {loading ? "Refreshing..." : "Refresh reports"}
            </button>

          </div>

        </div>

        {/* RESULTS SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDAD1] py-6">

          <div>
            <p className="serif text-2xl">
              {filteredReports.length.toLocaleString("en-IN")} reports
            </p>

            <p className="mt-1 text-[10px] text-[#96938B]">
              Publicly approved submissions
            </p>
          </div>

          <p className="text-[11px] text-[#77746D]">
            {loading ? "Loading registry..." : `Showing ${paginatedReports.length} results`}
          </p>

        </div>

        {/* REPORT LIST */}
        {loading ? (

          <div className="border-b border-[#DEDAD1] py-20 text-center">
            <p className="serif text-2xl">Loading reports...</p>
            <p className="mt-3 text-xs text-[#77746D]">
              Retrieving approved submissions from the registry.
            </p>
          </div>

        ) : error ? (

          <div className="border-b border-[#DEDAD1] py-20 text-center">
            <p className="serif text-2xl">Unable to load reports.</p>

            <p className="mt-3 text-xs text-red-600">
              {error}
            </p>

            <button
              onClick={fetchReports}
              className="mt-6 bg-black px-6 py-3 text-xs text-white"
            >
              Try again
            </button>
          </div>

        ) : filteredReports.length === 0 ? (

          <div className="border-b border-[#DEDAD1] py-24 text-center">

            <FileText
              size={32}
              strokeWidth={1.2}
              className="mx-auto text-[#AAA69D]"
            />

            <h2 className="serif mt-6 text-3xl">
              No reports found.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#77746D]">
              There are currently no published reports matching your
              search or filters. Try changing your search criteria.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 border border-[#BEBBB2] px-6 py-3 text-xs hover:bg-[#EEECE6]"
            >
              Clear filters
            </button>

          </div>

        ) : (

          <div className="divide-y divide-[#DEDAD1]">

            {paginatedReports.map((report) => (

              <article
                key={report.id}
                className="grid gap-5 py-8 md:grid-cols-[1fr_180px] md:items-center"
              >

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="text-[10px] uppercase tracking-wider text-[#96938B]">
                      Report #{report.id}
                    </span>

                    <span
                      className={`px-3 py-1 text-[9px] ${
                        report.report_type === "service"
                          ? "bg-[#F2E7AE]"
                          : "bg-[#E4E0EB]"
                      }`}
                    >
                      {getCategory(report)}
                    </span>

                  </div>

                  <h3 className="mt-4 text-base font-semibold">
                    {getDepartment(report)}
                  </h3>

                  {report.service && (
                    <p className="mt-1 text-xs text-[#77746D]">
                      Service: {report.service}
                    </p>
                  )}

                  {report.violation && (
                    <p className="mt-1 text-xs text-[#77746D]">
                      Situation: {report.violation}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#77746D]">

                    <span className="flex items-center gap-2">
                      <MapPin size={13} />
                      {report.city}, {report.state}
                    </span>

                    <span className="flex items-center gap-2">
                      <CalendarDays size={13} />
                      {formatDate(report.created_at)}
                    </span>

                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-[#96938B]">
                    Individual citizen-reported experience. Not an
                    independently verified finding of misconduct.
                  </p>

                </div>

                <div className="border-t border-[#DEDAD1] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">

                  <p className="text-[9px] uppercase tracking-wider text-[#96938B]">
                    Amount demanded
                  </p>

                  <p className="serif mt-2 text-2xl">
                    {formatAmount(getAmount(report))}
                  </p>

                  <p className="mt-2 text-[10px] text-[#77746D]">
                    Reported amount
                  </p>

                </div>

              </article>

            ))}

          </div>

        )}

        {/* PAGINATION */}
        {!loading && !error && filteredReports.length > 0 && (

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DEDAD1] pt-7">

            <p className="text-[11px] text-[#77746D]">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">

              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="border border-[#DEDAD1] p-3 hover:bg-[#EEECE6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) =>
                  Math.abs(page - currentPage) <= 2 ||
                  page === 1 ||
                  page === totalPages
                )
                .map((page, index, visiblePages) => (
                  <span key={page} className="contents">

                    {index > 0 &&
                      page - visiblePages[index - 1] > 1 && (
                        <span className="px-1 text-xs text-[#96938B]">
                          ...
                        </span>
                      )}

                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 border px-3 py-2 text-xs ${
                        currentPage === page
                          ? "border-black bg-black text-white"
                          : "border-[#DEDAD1] hover:bg-[#EEECE6]"
                      }`}
                    >
                      {page}
                    </button>

                  </span>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="border border-[#DEDAD1] p-3 hover:bg-[#EEECE6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>

            </div>

          </div>

        )}

      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#EEECE6] py-20">

        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
              Contribute to the registry
            </p>

            <h2 className="serif mt-4 text-3xl md:text-4xl">
              Have an experience to share?
            </h2>

            <p className="mt-3 text-sm text-[#77746D]">
              Help document unofficial payment experiences across India.
            </p>
          </div>

          <Link
            href="/report"
            className="flex items-center gap-3 bg-black px-7 py-4 text-xs font-semibold text-white hover:bg-[#393939]"
          >
            SUBMIT A REPORT
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#DEDAD1] py-9">

        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-5 px-6 md:flex-row md:items-center">

          <div>
            <p className="serif text-2xl font-bold">
              UnderTheTable
              <span className="text-[#B49B2D]">.</span>
            </p>

            <p className="mt-2 text-[10px] text-[#89857B]">
              Documenting experiences. Understanding patterns.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] text-[#77746D]">
            <Link href="/">Home</Link>
            <Link href="/reports">Reports</Link>
            <Link href="/departments">Departments</Link>
            <Link href="/map">Map</Link>
            <Link href="/about">About</Link>
            <Link href="/Privacy" className="hover:text-black">
            Privacy & Methodology
            </Link>
          </div>

        </div>

        <div className="mx-auto mt-7 max-w-[1120px] border-t border-[#DEDAD1] px-6 pt-5">
          <p className="text-[10px] leading-6 text-[#89857B]">
            Citizen-submitted reports represent individual experiences
            and are not, by themselves, verified findings of misconduct.
          </p>

          <p className="mt-2 text-[10px] text-[#AAA69D]">
            © 2026 UnderTheTable. Independent public-interest project.
          </p>
        </div>

      </footer>

    </main>
  );
}
