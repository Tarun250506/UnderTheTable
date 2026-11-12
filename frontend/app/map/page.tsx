
"use client";
import { ChevronRight } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

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

// Approximate geographic centres for state-level markers.
// These are markers, not state boundary polygons.
const stateCoordinates: Record<string, [number, number]> = {
  "Andhra Pradesh": [15.9, 79.7],
  "Arunachal Pradesh": [28.0, 94.5],
  Assam: [26.2, 92.9],
  Bihar: [25.9, 85.5],
  Chhattisgarh: [21.3, 81.8],
  Goa: [15.3, 74.0],
  Gujarat: [22.3, 71.8],
  Haryana: [29.0, 76.1],
  "Himachal Pradesh": [31.9, 77.2],
  Jharkhand: [23.6, 85.3],
  Karnataka: [15.0, 76.0],
  Kerala: [10.5, 76.3],
  "Madhya Pradesh": [23.5, 78.5],
  Maharashtra: [19.5, 75.5],
  Manipur: [24.7, 93.9],
  Meghalaya: [25.5, 91.3],
  Mizoram: [23.2, 92.8],
  Nagaland: [26.0, 94.5],
  Odisha: [20.9, 84.5],
  Punjab: [31.0, 75.4],
  Rajasthan: [26.8, 73.8],
  Sikkim: [27.5, 88.5],
  "Tamil Nadu": [11.0, 78.5],
  Telangana: [17.9, 79.0],
  Tripura: [23.8, 91.5],
  "Uttar Pradesh": [27.0, 80.8],
  Uttarakhand: [30.0, 79.0],
  "West Bengal": [23.5, 87.5],
  "Andaman and Nicobar Islands": [11.7, 92.7],
  Chandigarh: [30.7, 76.8],
  "Dadra and Nagar Haveli and Daman and Diu": [20.2, 73.0],
  Delhi: [28.6, 77.2],
  "Jammu and Kashmir": [33.8, 76.0],
  Ladakh: [34.2, 77.6],
  Lakshadweep: [10.0, 72.6],
  Puducherry: [11.9, 79.8],
};

type StateSummary = {
  name: string;
  total: number;
  violation: number;
  service: number;
  amount: number;
  reports: PublicReport[];
};

function formatAmount(amount: number | null) {
  if (amount === null) return "Not disclosed";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDepartment(report: PublicReport) {
  return (
    report.department ||
    report.authority ||
    report.violation ||
    report.service ||
    "Department not specified"
  );
}

export default function MapPage() {
  const mapElement = useRef<HTMLDivElement>(null);
  const getCategory = (report: { report_type: string }) => {
  if (report.report_type === "violation") return "Violation";
  if (report.report_type === "service") return "Public Service";
  if (report.report_type === "both") return "Violation + Service";
  return "Other";
};
 
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchReports() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/public/reports?limit=100&offset=0`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve public reports.");
      }

      const data: PublicReport[] = await response.json();
      setReports(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the map."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const stateSummaries = useMemo(() => {
    const grouped = new Map<string, StateSummary>();

    reports.forEach((report) => {
      const name = report.state.trim();

      const summary = grouped.get(name) || {
        name,
        total: 0,
        violation: 0,
        service: 0,
        amount: 0,
        reports: [],
      };

      summary.total += 1;

      if (
        report.report_type === "violation" ||
        report.report_type === "both"
      ) {
        summary.violation += 1;
      }

      if (
        report.report_type === "service" ||
        report.report_type === "both"
      ) {
        summary.service += 1;
      }

      summary.amount +=
        (report.violation_amount_demanded ?? 0) +
        (report.service_amount_demanded ?? 0);

      summary.reports.push(report);

      grouped.set(name, summary);
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.total - a.total
    );
  }, [reports]);

  const filteredStates = stateSummaries.filter((state) =>
    state.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const selectedSummary = selectedState
    ? stateSummaries.find((state) => state.name === selectedState)
    : null;

  // Build the interactive Leaflet map.
  useEffect(() => {
    if (loading || !mapElement.current) return;

    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    async function createMap() {
      const L = await import("leaflet");

      if (cancelled || !mapElement.current) return;

      map = L.map(mapElement.current, {
        scrollWheelZoom: false,
      }).setView([22.5, 82.0], 4.5);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 12,
        }
      ).addTo(map);

      stateSummaries.forEach((state) => {
        const coordinates = stateCoordinates[state.name];

        if (!coordinates) return;

        const marker = L.circleMarker(coordinates, {
          radius: Math.min(9 + state.total * 2, 23),
          color: "#806B25",
          weight: 1.5,
          fillColor: "#D7BD55",
          fillOpacity: 0.8,
        }).addTo(map!);

        marker.bindTooltip(
          `${state.name}: ${state.total} published report(s)`
        );

        marker.on("click", () => {
          setSelectedState(state.name);
        });
      });
    }

    createMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [loading, stateSummaries]);

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

            <Link href="/departments" className="text-[#77746D] hover:text-black">
              Departments
            </Link>

            <Link href="/map" className="border-b-2 border-black py-2">
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
      <section className="mx-auto max-w-[1120px] px-6 pb-10 pt-16">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-[#77746D] hover:text-black"
        >
          <ArrowLeft size={14} />
          Back to homepage
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A18D2B]">
          Geographic overview
        </p>

        <h1 className="serif mt-4 text-5xl tracking-tight md:text-6xl">
          India, on the map.
        </h1>

        <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#77746D]">
          Explore the geographical distribution of published citizen
          reports across India. Select a state marker to examine its
          reported experiences and aggregated figures.
        </p>

        <div className="mt-8 flex flex-wrap gap-5 border-y border-[#DEDAD1] py-4 text-[10px] text-[#77746D]">
          <span className="flex items-center gap-2">
            <MapPin size={15} />
            State-level report distribution
          </span>

          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Approved reports with publication consent
          </span>
        </div>
      </section>

      {/* MAP AND STATE DETAILS */}
      <section className="mx-auto max-w-[1120px] px-6 pb-24">

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="serif text-2xl">Explore by location</h2>
            <p className="mt-1 text-xs text-[#77746D]">
              Larger markers represent more published reports.
            </p>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 border border-[#DEDAD1] px-4 py-3 text-xs hover:bg-[#EEECE6] disabled:opacity-50"
          >
            <RefreshCw size={14} />
            {loading ? "Loading..." : "Refresh map"}
          </button>
        </div>

        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">

          {/* MAP */}
          <div className="overflow-hidden border border-[#DEDAD1] bg-[#EEECE6]">
            {loading ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <p className="text-sm text-[#77746D]">
                  Loading India map...
                </p>
              </div>
            ) : (
              <div
                ref={mapElement}
                className="h-[520px] w-full"
                aria-label="Interactive map showing published reports by Indian state"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DEDAD1] bg-white px-4 py-3">
              <p className="text-[10px] text-[#77746D]">
                Map markers indicate approximate state centres, not exact incident locations.
              </p>

              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#77746D] underline"
              >
                Map data attribution
              </a>
            </div>
          </div>

          {/* STATE DETAILS */}
          <aside className="border border-[#DEDAD1] bg-white p-6">

            {selectedSummary ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#A18D2B]">
                      Selected state
                    </p>
                    <h2 className="serif mt-2 text-3xl">
                      {selectedSummary.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedState(null)}
                    aria-label="Close state details"
                    className="border border-[#DEDAD1] p-2 hover:bg-[#EEECE6]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-7 border-y border-[#DEDAD1] py-5">
                  <p className="serif text-4xl">
                    {selectedSummary.total}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#77746D]">
                    Published reports
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#77746D]">
                      Enforcement-related
                    </span>
                    <strong>{selectedSummary.violation}</strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#77746D]">
                      Service-related
                    </span>
                    <strong>{selectedSummary.service}</strong>
                  </div>

                  <div className="border-t border-[#DEDAD1] pt-4">
                    <p className="text-[9px] uppercase tracking-wider text-[#96938B]">
                      Total reported amount demanded
                    </p>
                    <p className="serif mt-2 text-2xl">
                      {formatAmount(selectedSummary.amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#77746D]">
                    Recent reports
                  </h3>

                  <div className="mt-3 space-y-3">
                    {selectedSummary.reports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="border-t border-[#E8E5DD] pt-3"
                      >
                        <p className="text-xs font-semibold">
                          {getDepartment(report)}
                        </p>
                        <p className="mt-1 text-[10px] text-[#77746D]">
                          {report.city} · {getCategory(report)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/reports?state=${encodeURIComponent(selectedSummary.name)}`}
                  className="mt-6 flex items-center justify-between border-t border-[#DEDAD1] pt-5 text-xs font-semibold hover:text-[#A18D2B]"
                >
                  Explore reports from this state
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#A18D2B]">
                  State directory
                </p>

                <h2 className="serif mt-2 text-3xl">
                  State overview.
                </h2>

                <p className="mt-3 text-xs leading-6 text-[#77746D]">
                  Select a marker on the map or choose a state below
                  to inspect its published reports.
                </p>

                <div className="relative mt-6">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96938B]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find a state or UT..."
                    className="w-full border border-[#DEDAD1] bg-[#FDFCF9] py-3 pl-9 pr-3 text-xs outline-none focus:border-[#A99432]"
                  />
                </div>

                <div className="mt-4 max-h-[310px] space-y-1 overflow-y-auto">
                  {filteredStates.length === 0 ? (
                    <p className="py-5 text-xs text-[#77746D]">
                      {stateSummaries.length === 0
                        ? "No published reports yet."
                        : "No matching states found."}
                    </p>
                  ) : (
                    filteredStates.map((state) => (
                      <button
                        key={state.name}
                        onClick={() => setSelectedState(state.name)}
                        className="flex w-full items-center justify-between border-b border-[#E8E5DD] px-2 py-3 text-left hover:bg-[#F8F7F3]"
                      >
                        <span className="text-xs">{state.name}</span>
                        <span className="flex items-center gap-2 text-xs font-semibold">
                          {state.total}
                          <ChevronRight size={14} />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

          </aside>
        </div>

        <p className="mt-6 text-[10px] leading-6 text-[#96938B]">
          Locations are shown at approximate state-centre level to protect
          reporter privacy. Figures reflect citizen-reported experiences
          and are not independently verified findings of misconduct.
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
              Help document experiences across India.
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
