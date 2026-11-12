
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Building2,
  FileText,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PublicReport = {
  id: number;
  report_type: "violation" | "service" | "both";
  violation: string | null;
  authority: string | null;
  department: string | null;
  service: string | null;
  violation_amount_demanded: number | null;
  service_amount_demanded: number | null;
  state: string;
  city: string;
  created_at: string;
};

type DepartmentSummary = {
  name: string;
  totalReports: number;
  violationReports: number;
  serviceReports: number;
  totalAmount: number;
};

function getDepartmentName(report: PublicReport) {
  if (report.department) return report.department;
  if (report.authority) return report.authority;
  if (report.violation) return report.violation;
  if (report.service) return report.service;
  return "Other / Not specified";
}

function getDemandedAmount(report: PublicReport) {
  return (
    (report.violation_amount_demanded ?? 0) +
    (report.service_amount_demanded ?? 0)
  );
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DepartmentsPage() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("reports");

  async function fetchReports() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/public/reports?limit=100&offset=0`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve department data.");
      }

      const data: PublicReport[] = await response.json();
      setReports(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading department data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const departments = useMemo(() => {
    const grouped = new Map<string, DepartmentSummary>();

    reports.forEach((report) => {
      const name = getDepartmentName(report);

      const existing = grouped.get(name) ?? {
        name,
        totalReports: 0,
        violationReports: 0,
        serviceReports: 0,
        totalAmount: 0,
      };

      existing.totalReports += 1;

      if (
        report.report_type === "violation" ||
        report.report_type === "both"
      ) {
        existing.violationReports += 1;
      }

      if (
        report.report_type === "service" ||
        report.report_type === "both"
      ) {
        existing.serviceReports += 1;
      }

      existing.totalAmount += getDemandedAmount(report);

      grouped.set(name, existing);
    });

    return Array.from(grouped.values());
  }, [reports]);

  const filteredDepartments = useMemo(() => {
    let result = departments.filter((department) =>
      department.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (sortBy === "reports") {
      result.sort((a, b) => b.totalReports - a.totalReports);
    } else if (sortBy === "amount") {
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [departments, search, sortBy]);

  const totalReportedAmount = reports.reduce(
    (total, report) => total + getDemandedAmount(report),
    0
  );

  const enforcementCount = reports.filter(
    (report) =>
      report.report_type === "violation" ||
      report.report_type === "both"
  ).length;

  const serviceCount = reports.filter(
    (report) =>
      report.report_type === "service" ||
      report.report_type === "both"
  ).length;

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

            <Link href="/reports" className="text-[#77746D] hover:text-black">
              Reports
            </Link>

            <Link
              href="/departments"
              className="border-b-2 border-black py-2"
            >
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

      {/* HEADER */}
      <section className="mx-auto max-w-[1120px] px-6 pb-12 pt-16">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-[#77746D] hover:text-black"
        >
          <ArrowLeft size={14} />
          Back to homepage
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A18D2B]">
          Explore public institutions
        </p>

        <h1 className="serif mt-4 text-5xl tracking-tight md:text-6xl">
          Departments.
        </h1>

        <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#77746D]">
          Explore citizen-reported unofficial payment experiences
          across public departments and authorities in India.
          Understand where reports have been submitted and examine
          aggregated patterns.
        </p>

        <div className="mt-8 flex flex-wrap gap-5 border-y border-[#DEDAD1] py-4 text-[10px] text-[#77746D]">
          <span className="flex items-center gap-2">
            <Building2 size={15} />
            Department-level insights
          </span>

          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Approved reports only
          </span>
        </div>

      </section>

      {/* OVERVIEW STATISTICS */}
      <section className="mx-auto max-w-[1120px] px-6">

        <div className="grid grid-cols-2 border border-[#DEDAD1] md:grid-cols-4">

          {[
            {
              value: loading ? "…" : reports.length,
              label: "Published reports",
            },
            {
              value: loading ? "…" : departments.length,
              label: "Departments represented",
            },
            {
              value: loading ? "…" : enforcementCount,
              label: "Enforcement-related reports",
            },
            {
              value: loading ? "…" : serviceCount,
              label: "Service-related reports",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`p-6 md:p-8 ${
                index !== 3 ? "border-r border-[#DEDAD1]" : ""
              } ${
                index < 2
                  ? "border-b border-[#DEDAD1] md:border-b-0"
                  : ""
              }`}
            >
              <p className="serif text-[38px] md:text-[43px]">
                {item.value}
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#77746D]">
                {item.label}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* DEPARTMENT DIRECTORY */}
      <section className="mx-auto max-w-[1120px] px-6 py-20">

        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">

          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
              The directory
            </p>

            <h2 className="serif text-[39px] md:text-[48px]">
              Department overview.
            </h2>

            <p className="mt-3 text-sm text-[#77746D]">
              Explore departments represented in the public registry.
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 border border-[#DEDAD1] px-4 py-3 text-xs hover:bg-[#EEECE6] disabled:opacity-50"
          >
            <RefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh data"}
          </button>

        </div>

        {/* SEARCH AND SORT */}
        <div className="grid gap-4 border border-[#DEDAD1] bg-white p-5 md:grid-cols-2 md:p-7">

          <div>
            <label
              htmlFor="department-search"
              className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
            >
              Search departments
            </label>

            <div className="mt-2 flex items-center border border-[#DEDAD1] bg-[#FDFCF9] px-4">
              <Search size={16} className="text-[#96938B]" />

              <input
                id="department-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a department..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="department-sort"
              className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]"
            >
              Sort departments
            </label>

            <select
              id="department-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-2 w-full border border-[#DEDAD1] bg-[#FDFCF9] px-4 py-3 text-sm outline-none focus:border-[#A99432]"
            >
              <option value="reports">Most reports</option>
              <option value="amount">Highest reported amount</option>
              <option value="alphabetical">Alphabetical order</option>
            </select>
          </div>

        </div>

        {/* DIRECTORY RESULTS */}
        <div className="mt-7">

          {loading ? (

            <div className="border-y border-[#DEDAD1] py-20 text-center">
              <p className="serif text-2xl">
                Loading departments...
              </p>

              <p className="mt-3 text-xs text-[#77746D]">
                Retrieving approved reports from the registry.
              </p>
            </div>

          ) : error ? (

            <div className="border-y border-[#DEDAD1] py-20 text-center">
              <p className="serif text-2xl">
                Unable to load departments.
              </p>

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

          ) : filteredDepartments.length === 0 ? (

            <div className="border-y border-[#DEDAD1] py-24 text-center">

              <Building2
                size={32}
                strokeWidth={1.2}
                className="mx-auto text-[#AAA69D]"
              />

              <h3 className="serif mt-6 text-3xl">
                {departments.length === 0
                  ? "No departments represented yet."
                  : "No departments found."}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#77746D]">
                {departments.length === 0
                  ? "Department-level insights will appear as approved and consented reports are published."
                  : "Try a different search term."}
              </p>

            </div>

          ) : (

            <div className="grid gap-4 md:grid-cols-2">

              {filteredDepartments.map((department) => (

                <article
                  key={department.name}
                  className="border border-[#DEDAD1] bg-white p-6 transition hover:border-[#A99432] md:p-8"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-11 w-11 items-center justify-center border border-[#DEDAD1]">
                      <Building2 size={19} />
                    </div>

                    <span className="text-[10px] uppercase tracking-wider text-[#96938B]">
                      Department
                    </span>

                  </div>

                  <h3 className="serif mt-6 text-2xl">
                    {department.name}
                  </h3>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#E8E5DD] py-5">

                    <div>
                      <p className="serif text-3xl">
                        {department.totalReports}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-wider text-[#77746D]">
                        Published reports
                      </p>
                    </div>

                    <div>
                      <p className="serif text-xl">
                        {formatAmount(department.totalAmount)}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-wider text-[#77746D]">
                        Total reported amount demanded
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#77746D]">
                        Enforcement-related
                      </span>

                      <span className="font-semibold">
                        {department.violationReports}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden bg-[#EEECE6]">
                      <div
                        className="h-full bg-[#A18D2B]"
                        style={{
                          width: `${
                            (department.violationReports /
                              department.totalReports) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#77746D]">
                        Service-related
                      </span>

                      <span className="font-semibold">
                        {department.serviceReports}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden bg-[#EEECE6]">
                      <div
                        className="h-full bg-[#82748F]"
                        style={{
                          width: `${
                            (department.serviceReports /
                              department.totalReports) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                  </div>

                  <Link
                    href={`/reports?department=${encodeURIComponent(
                      department.name
                    )}`}
                    className="mt-7 flex items-center justify-between border-t border-[#E8E5DD] pt-5 text-xs font-semibold hover:text-[#A18D2B]"
                  >
                    Explore related reports
                    <ArrowRight size={15} />
                  </Link>

                </article>

              ))}

            </div>

          )}

        </div>

        <p className="mt-6 text-[10px] leading-6 text-[#96938B]">
          Amounts are aggregated from citizen-reported demanded amounts.
          They are not independently verified financial findings.
          Departments are grouped using the department or authority
          category supplied in each submission.
        </p>

      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#EEECE6] py-20">

        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
              Contribute to the registry
            </p>

            <h2 className="serif mt-4 text-3xl md:text-4xl">
              Every experience adds context.
            </h2>

            <p className="mt-3 text-sm text-[#77746D]">
              Help document experiences across public departments in India.
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
