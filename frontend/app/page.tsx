"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  MapPin,
  ShieldCheck,
  FileText,
  TrendingUp,
  ChevronRight,
  Eye,
} from "lucide-react";

type PublicStats = {
  reports_submitted: number;
  departments_covered: number;
  states_covered: number;
  median_amount_demanded: number | null;
};

type PublicReport = {
  id: number;
  report_type: "violation" | "service" | "both";
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const initialStats: PublicStats = {
  reports_submitted: 0,
  departments_covered: 0,
  states_covered: 0,
  median_amount_demanded: null,
};

function formatAmount(amount: number | null) {
  if (amount === null || amount === undefined) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getReportCategory(report: PublicReport) {
  if (report.report_type === "both") return "Violation & service";

  return report.report_type === "violation"
    ? "Enforcement-related"
    : "Service-related";
}

function getReportDepartment(report: PublicReport) {
  return (
    report.department ||
    report.authority ||
    report.violation ||
    report.service ||
    "Department not specified"
  );
}

function getReportAmount(report: PublicReport) {
  const amounts = [
    report.violation_amount_demanded,
    report.service_amount_demanded,
  ].filter((amount): amount is number => amount !== null);

  if (amounts.length === 0) return "Not disclosed";

  return amounts
    .map((amount) => formatAmount(amount))
    .filter(Boolean)
    .join(" + ");
}

const steps = [
  {
    number: "01",
    title: "Report an experience",
    description:
      "Share what happened, the department involved and the payment that was demanded.",
    icon: FileText,
  },
  {
    number: "02",
    title: "We review the report",
    description:
      "Every submission undergoes privacy checks and moderation before publication.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Understand the patterns",
    description:
      "Explore anonymised experiences and aggregated patterns across India.",
    icon: TrendingUp,
  },
];

export default function Home() {
  const [stats, setStats] = useState<PublicStats>(initialStats);
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch(`${API_URL}/api/public/stats`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load statistics.");
        }

        const data: PublicStats = await response.json();

        if (active) setStats(data);
      } catch {
        if (active) {
          setStatsError("Statistics are temporarily unavailable.");
        }
      } finally {
        if (active) setStatsLoading(false);
      }
    }

    async function loadReports() {
      try {
        const response = await fetch(
          `${API_URL}/api/public/reports?limit=5&offset=0`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Unable to load reports.");
        }

        const data: PublicReport[] = await response.json();

        if (active) setReports(data);
      } catch {
        if (active) {
          setReportsError("Reports are temporarily unavailable.");
        }
      } finally {
        if (active) setReportsLoading(false);
      }
    }

    loadStats();
    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const statItems = [
    {
      value: statsLoading
        ? "…"
        : stats.reports_submitted.toLocaleString("en-IN"),
      label: "Reports submitted",
    },
    {
      value: statsLoading
        ? "…"
        : stats.departments_covered.toLocaleString("en-IN"),
      label: "Departments covered",
    },
    {
      value: statsLoading
        ? "…"
        : stats.states_covered.toLocaleString("en-IN"),
      label: "States & UTs covered",
    },
    {
      value: statsLoading
        ? "…"
        : formatAmount(stats.median_amount_demanded) || "—",
      label: "Median amount demanded",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#171717]">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-[#DEDAD1] bg-[#F8F7F3]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1120px] px-6 flex h-[76px] items-center justify-between">

          <Link
            href="/"
            className="serif text-[25px] font-bold tracking-tight"
          >
            UnderTheTable<span className="text-[#B49B2D]">.</span>
          </Link>

          <div className="hidden items-center gap-9 text-[13px] font-medium md:flex">

            <Link href="/" className="border-b-2 border-black py-2">
              Home
            </Link>

            <Link href="/reports" className="text-[#77746D] hover:text-black">
              Reports
            </Link>

            <Link
              href="/departments"
              className="text-[#77746D] hover:text-black"
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

          <div className="flex items-center gap-4">

            <button
              aria-label="Search"
              className="hidden p-2 hover:bg-[#EEECE6] sm:block"
            >
              <Search size={18} />
            </button>

            <Link
              href="/report"
              className="bg-black px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-[#393939]"
            >
              REPORT AN EXPERIENCE <span className="ml-2">→</span>
            </Link>

          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="mx-auto w-full max-w-[1120px] px-6 grid min-h-[550px] items-center gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-20">

        <div>

          <div className="mb-7 flex items-center gap-3">
            <span className="h-[1px] w-9 bg-[#A99432]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#77746D]">
              Independent citizen-powered registry
            </p>
          </div>

          <h1 className="serif max-w-[690px] text-[51px] leading-[1.08] tracking-[-2px] md:text-[72px]">
            Some payments
            <br />
            are never meant
            <br />
            to be{" "}
            <span className="bg-[#F2DF70] px-2 italic">
              made.
            </span>
          </h1>

          <p className="mt-8 max-w-[510px] text-[15px] leading-[1.9] text-[#69675F]">
            An independent platform documenting reported
            unofficial payments across India. Share your
            experience, explore department-level patterns
            and help make public systems more transparent.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">

            <Link
              href="/report"
              className="flex items-center gap-4 bg-black px-6 py-4 text-[13px] font-medium text-white transition hover:bg-[#383838]"
            >
              Report an experience
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-3 border border-[#BEBBB2] px-6 py-4 text-[13px] transition hover:bg-[#EEECE6]"
            >
              Explore reports
            </Link>

          </div>

          <div className="mt-9 flex items-center gap-3 text-[11px] text-[#77746D]">
            <ShieldCheck size={16} />
            No public profile required. Reports are reviewed before publication.
          </div>

        </div>

        {/* HERO VISUAL */}
        <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-[#EEECE6] p-8">

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(#9E9A8F 0.7px, transparent 0.7px)",
              backgroundSize: "13px 13px",
            }}
          />

          <div className="relative w-full max-w-[380px]">

            <div className="mb-7 flex items-center justify-between border-b border-[#C9C5BA] pb-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#77746D]">
                The bigger picture
              </span>

              <Eye size={17} className="text-[#77746D]" />
            </div>

            <p className="serif text-[42px] leading-[1.12] md:text-[49px]">
              Individual
              <br />
              stories.
              <br />
              <span className="italic text-[#A18D2B]">
                Collective insight.
              </span>
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">

              <div className="border border-[#C9C5BA] bg-[#F8F7F3]/70 p-4">
                <FileText size={19} />

                <p className="mt-4 text-[10px] uppercase tracking-wider text-[#77746D]">
                  Citizen reports
                </p>
              </div>

              <div className="border border-[#C9C5BA] bg-[#F8F7F3]/70 p-4">
                <MapPin size={19} />

                <p className="mt-4 text-[10px] uppercase tracking-wider text-[#77746D]">
                  Across India
                </p>
              </div>

            </div>

            <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-[#77746D]">
              Document · Analyse · Understand
            </p>

          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="mx-auto w-full max-w-[1120px] px-6">

        <div className="grid grid-cols-2 border border-[#DEDAD1] md:grid-cols-4">

          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className={`p-6 md:p-8 ${
                index !== 3 ? "border-r border-[#DEDAD1]" : ""
              } ${
                index < 2
                  ? "border-b border-[#DEDAD1] md:border-b-0"
                  : ""
              }`}
            >

              <p className="serif text-[38px] md:text-[43px]">
                {stat.value}
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#77746D]">
                {stat.label}
              </p>

            </div>
          ))}

        </div>

        <p className="mt-3 text-right text-[9px] text-[#96938B]">
          {statsError || "Based on approved reports with publication consent."}
        </p>

      </section>

      {/* LATEST REPORTS */}
      <section className="mx-auto w-full max-w-[1120px] px-6 py-24">

        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">

          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
              From the registry
            </p>

            <h2 className="serif text-[39px] md:text-[48px]">
              Latest reports.
            </h2>

            <p className="mt-3 text-sm text-[#77746D]">
              Explore citizen-submitted experiences from across India.
            </p>
          </div>

          <Link
            href="/reports"
            className="flex items-center gap-2 text-[12px] font-semibold"
          >
            View all reports <ArrowRight size={15} />
          </Link>

        </div>

        <div className="border-y border-[#DEDAD1]">

          {reportsLoading ? (
            <p className="py-10 text-sm text-[#77746D]">
              Loading approved reports…
            </p>
          ) : reportsError ? (
            <p className="py-10 text-sm text-[#77746D]">
              {reportsError}
            </p>
          ) : reports.length === 0 ? (
            <p className="py-10 text-sm text-[#77746D]">
              No approved reports have been published yet. Check back as the
              registry grows.
            </p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="grid gap-4 border-b border-[#DEDAD1] py-6 last:border-b-0 md:grid-cols-[75px_1fr_1fr_160px_30px] md:items-center"
              >

                <span className="text-[11px] text-[#96938B]">
                  #{report.id}
                </span>

                <div>
                  <p className="text-[14px] font-semibold">
                    {getReportDepartment(report)}
                  </p>

                  <p className="mt-1 text-[11px] text-[#77746D]">
                    {report.city}, {report.state}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-block px-3 py-1 text-[9px] ${
                      report.report_type === "service"
                        ? "bg-[#F2E7AE]"
                        : "bg-[#E4E0EB]"
                    }`}
                  >
                    {getReportCategory(report)}
                  </span>

                  <p className="mt-2 text-[10px] text-[#96938B]">
                    Reported experience ·{" "}
                    {new Date(report.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <p className="serif text-[20px]">
                  {getReportAmount(report)}
                </p>

                <ChevronRight size={17} className="hidden md:block" />

              </div>
            ))
          )}

        </div>

        <p className="mt-4 text-[10px] leading-5 text-[#96938B]">
          Reports reflect individual experiences and are not, by themselves,
          verified findings of misconduct.
        </p>

      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#EEECE6] py-24">

        <div className="mx-auto w-full max-w-[1120px] px-6">

          <div className="mb-14 grid gap-5 md:grid-cols-2 md:items-end">

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
                The process
              </p>

              <h2 className="serif text-[42px] leading-tight md:text-[53px]">
                How it works.
                <br />
                <span className="italic">Three simple steps.</span>
              </h2>
            </div>

            <p className="max-w-[430px] text-sm leading-7 text-[#77746D] md:justify-self-end">
              Individual experiences can help reveal larger
              patterns. Every submission is handled with
              privacy and moderation in mind.
            </p>

          </div>

          <div className="grid border-y border-[#CCC8BD] md:grid-cols-3">

            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="border-b border-[#CCC8BD] p-8 md:border-b-0 md:border-r last:border-r-0"
                >

                  <p className="serif text-[50px] text-[#C5C1B7]">
                    {step.number}
                  </p>

                  <div className="my-7 flex h-11 w-11 items-center justify-center border border-[#CCC8BD]">
                    <Icon size={19} />
                  </div>

                  <h3 className="serif text-[25px]">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-[12px] leading-7 text-[#77746D]">
                    {step.description}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="mx-auto w-full max-w-[1120px] px-6 py-24">

        <div className="flex flex-col items-start justify-between gap-8 border border-[#DEDAD1] p-8 md:flex-row md:items-center md:p-14">

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#89857B]">
              Your experience matters
            </p>

            <h2 className="serif max-w-[550px] text-[40px] leading-tight md:text-[52px]">
              Help make the invisible visible.
            </h2>

            <p className="mt-4 max-w-[450px] text-sm leading-7 text-[#77746D]">
              One report may seem small. Together, experiences
              can help us understand the bigger picture.
            </p>
          </div>

          <Link
            href="/report"
            className="flex shrink-0 items-center gap-4 bg-black px-7 py-5 text-[12px] font-semibold text-white hover:bg-[#393939]"
          >
            SUBMIT A REPORT <ArrowRight size={17} />
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#DEDAD1] py-10">

        <div className="mx-auto w-full max-w-[1120px] px-6 flex flex-col justify-between gap-8 md:flex-row md:items-center">

          <div>
            <p className="serif text-[25px] font-bold">
              UnderTheTable<span className="text-[#B49B2D]">.</span>
            </p>

            <p className="mt-2 text-[10px] text-[#89857B]">
              Documenting experiences. Understanding patterns.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] text-[#77746D]">
            <Link href="/reports">Reports</Link>
            <Link href="/departments">Departments</Link>
            <Link href="/map">Map</Link>
            <Link href="/about">About</Link>
            <Link href="/Privacy" className="hover:text-black">
            Privacy & Methodology
            </Link>
          </div>

        </div>

        <div className="mx-auto w-full max-w-[1120px] px-6 mt-8 border-t border-[#DEDAD1] pt-5">

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
