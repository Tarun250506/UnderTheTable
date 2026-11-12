
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from "lucide-react";

type ReportType = "violation" | "service" | "both";

const departments = [
  "Police",
  "Regional Transport Office (RTO)",
  "Municipal Corporation",
  "Revenue / Land Records",
  "Passport Office",
  "Electricity Board",
  "Income Tax",
  "Food and Drug Administration",
  "Other / Not sure",
];

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const inputClass =
  "mt-2 w-full border border-[#DEDAD1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A99432]";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-[#55534D]";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportPage() {
  const [reportType, setReportType] = useState<ReportType | "">("");

  const [department, setDepartment] = useState("");
  const [service, setService] = useState("");
  const [violation, setViolation] = useState("");
  const [authority, setAuthority] = useState("");
  const [consequence, setConsequence] = useState("");

  // Separate payment fields for enforcement-related reports
  const [violationAmountDemanded, setViolationAmountDemanded] = useState("");
  const [violationAmountPaid, setViolationAmountPaid] = useState("");

  // Separate payment fields for government-service reports
  const [serviceAmountDemanded, setServiceAmountDemanded] = useState("");
  const [serviceAmountPaid, setServiceAmountPaid] = useState("");

  const [officialFee, setOfficialFee] = useState("");
  const [fine, setFine] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [outcome, setOutcome] = useState("");
  const [description, setDescription] = useState("");

  const [consent, setConsent] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showViolation =
    reportType === "violation" || reportType === "both";

  const showService =
    reportType === "service" || reportType === "both";

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!reportType) {
      setError("Please select the type of experience.");
      return;
    }

    setLoading(true);
    setError("");

    const numberOrNull = (value: string) =>
      value.trim() === "" ? null : Number(value);

    const reportData = {
      report_type: reportType,

      // Enforcement-related information
      violation: showViolation ? violation || null : null,
      authority: showViolation ? authority || null : null,
      consequence: showViolation ? consequence || null : null,
      fine: showViolation ? numberOrNull(fine) : null,

      // Government-service information
      department: showService ? department || null : null,
      service: showService ? service || null : null,
      official_fee: showService ? numberOrNull(officialFee) : null,

      // Payment information — stored separately by report category
      violation_amount_demanded: showViolation
        ? numberOrNull(violationAmountDemanded)
        : null,

      violation_amount_paid: showViolation
        ? numberOrNull(violationAmountPaid)
        : null,

      service_amount_demanded: showService
        ? numberOrNull(serviceAmountDemanded)
        : null,

      service_amount_paid: showService
        ? numberOrNull(serviceAmountPaid)
        : null,

      // Common information
      state,
      city,
      incident_date: incidentDate || null,
      outcome: outcome || null,
      description: description || null,

      // Publication consent
      publication_consent: consent,
    };

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof result.detail === "string"
            ? result.detail
            : result.detail
              ? JSON.stringify(result.detail)
              : "Unable to submit your report.";

        throw new Error(errorMessage);
      }

      if (!result.success) {
        throw new Error("The server could not accept your report.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] px-6 py-20">
        <div className="mx-auto max-w-xl border border-[#DEDAD1] bg-white p-10 text-center">
          <CheckCircle2
            size={48}
            className="mx-auto text-[#A99432]"
          />

          <h1 className="serif mt-7 text-4xl">
            Your report has been received.
          </h1>

          <p className="mt-5 text-sm leading-7 text-[#77746D]">
            Thank you for contributing to a more transparent
            public system. Your report has successfully reached
            our reporting API.
          </p>

          <p className="mt-3 text-xs leading-6 text-[#96938B]">
            Reports are subject to review and moderation before
            any information is considered for publication.
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-8 bg-black px-7 py-4 text-xs font-semibold text-white"
          >
            BACK TO REPORT
          </button>

          <p className="mt-5">
            <Link href="/" className="text-xs underline">
              Return to homepage
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#171717]">
      {/* NAVBAR */}
      <nav className="border-b border-[#DEDAD1]">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-6">
          <Link href="/" className="serif text-2xl font-bold">
            UnderTheTable
            <span className="text-[#B49B2D]">.</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#77746D] hover:text-black"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="mx-auto max-w-[760px] px-6 pb-10 pt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A18D2B]">
          Citizen reporting registry
        </p>

        <h1 className="serif mt-4 text-5xl tracking-tight md:text-6xl">
          Report an experience.
        </h1>

        <p className="mt-5 max-w-[600px] text-sm leading-7 text-[#77746D]">
          Have you ever been asked to make an unofficial payment
          to access a public service or avoid an official
          consequence? Share your experience. Your report can
          help us understand patterns across India.
        </p>

        <div className="mt-7 flex flex-wrap gap-5 border-y border-[#DEDAD1] py-4 text-[10px] text-[#77746D]">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            No name required
          </span>

          <span className="flex items-center gap-2">
            <FileText size={15} />
            No contact details requested
          </span>
        </div>
      </section>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-[760px] px-6 pb-24"
      >
        {/* SECTION 01 */}
        <section className="border border-[#DEDAD1] bg-white p-6 md:p-9">
          <div className="mb-7 flex items-center gap-3">
            <span className="serif text-3xl text-[#C5C1B7]">
              01
            </span>

            <div>
              <h2 className="serif text-2xl">What happened?</h2>
              <p className="mt-1 text-xs text-[#77746D]">
                Choose the experience that best describes your situation.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                value: "violation",
                title: "Avoiding consequences",
                description:
                  "An unofficial payment was demanded or made to avoid a fine, penalty or enforcement action.",
              },
              {
                value: "service",
                title: "Accessing a government service",
                description:
                  "An unofficial payment was demanded or made to obtain or speed up a public service.",
              },
              {
                value: "both",
                title: "Both",
                description:
                  "The experience involved both circumstances.",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setReportType(option.value as ReportType);
                  setError("");
                }}
                className={`border p-5 text-left transition ${
                  reportType === option.value
                    ? "border-black bg-[#F8F7F3]"
                    : "border-[#DEDAD1] hover:border-[#99958A]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {option.title}
                  </span>

                  <span
                    className={`h-4 w-4 rounded-full border ${
                      reportType === option.value
                        ? "border-black bg-black"
                        : "border-[#BEBBB2]"
                    }`}
                  />
                </div>

                <p className="mt-2 text-xs leading-6 text-[#77746D]">
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          {!reportType && (
            <p className="mt-4 text-xs text-[#A18D2B]">
              Select an option to reveal the relevant questions.
            </p>
          )}
        </section>

        {/* SECTION 02: VIOLATION */}
        {showViolation && (
          <section className="mt-7 border border-[#DEDAD1] bg-white p-6 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <span className="serif text-3xl text-[#C5C1B7]">
                02
              </span>

              <div>
                <h2 className="serif text-2xl">
                  Enforcement-related experience
                </h2>

                <p className="mt-1 text-xs text-[#77746D]">
                  Tell us about the unofficial payment.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  What type of situation was involved?
                </label>

                <select
                  required={showViolation}
                  value={violation}
                  onChange={(e) => setViolation(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a category</option>
                  <option>Traffic / road-related matter</option>
                  <option>Regulatory or licensing matter</option>
                  <option>Property or construction matter</option>
                  <option>Tax or financial compliance matter</option>
                  <option>Police or law enforcement matter</option>
                  <option>Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Which authority was involved?
                </label>

                <select
                  required={showViolation}
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select an authority</option>

                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  What consequence was the payment intended to avoid?
                </label>

                <select
                  className={inputClass}
                  value={consequence}
                  onChange={(e) => setConsequence(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option>Fine or monetary penalty</option>
                  <option>Legal or enforcement action</option>
                  <option>Delay or obstruction</option>
                  <option>Other / Not sure</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Amount demanded (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={violationAmountDemanded}
                    onChange={(e) =>
                      setViolationAmountDemanded(e.target.value)
                    }
                    placeholder="e.g. 2000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Amount actually paid (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={violationAmountPaid}
                    onChange={(e) =>
                      setViolationAmountPaid(e.target.value)
                    }
                    placeholder="Enter 0 if refused"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Official fine or penalty, if known (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={fine}
                  onChange={(e) => setFine(e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        )}

        {/* SECTION 03: SERVICE */}
        {showService && (
          <section className="mt-7 border border-[#DEDAD1] bg-white p-6 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <span className="serif text-3xl text-[#C5C1B7]">
                {showViolation ? "03" : "02"}
              </span>

              <div>
                <h2 className="serif text-2xl">
                  Government service experience
                </h2>

                <p className="mt-1 text-xs text-[#77746D]">
                  Tell us about the service and payment involved.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Which department was involved?
                </label>

                <select
                  required={showService}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a department</option>

                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Which service were you trying to access?
                </label>

                <input
                  required={showService}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Driving licence, property registration"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Amount demanded (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={serviceAmountDemanded}
                    onChange={(e) =>
                      setServiceAmountDemanded(e.target.value)
                    }
                    placeholder="e.g. 1500"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Amount actually paid (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={serviceAmountPaid}
                    onChange={(e) =>
                      setServiceAmountPaid(e.target.value)
                    }
                    placeholder="Enter 0 if refused"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Official government fee, if known (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={officialFee}
                  onChange={(e) => setOfficialFee(e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        )}

        {/* SECTION 04: COMMON DETAILS */}
        {reportType && (
          <section className="mt-7 border border-[#DEDAD1] bg-white p-6 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <span className="serif text-3xl text-[#C5C1B7]">
                {showViolation && showService ? "04" : "03"}
              </span>

              <div>
                <h2 className="serif text-2xl">
                  Where and when?
                </h2>

                <p className="mt-1 text-xs text-[#77746D]">
                  Help us understand the geographical pattern.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  State / Union Territory
                </label>

                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select state or UT</option>

                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  City / District
                </label>

                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Approximate incident date
                </label>

                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  What happened afterwards?
                </label>

                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select an outcome</option>
                  <option>Payment made and request fulfilled</option>
                  <option>Payment refused and service provided</option>
                  <option>Payment refused and service denied</option>
                  <option>Payment made but no result</option>
                  <option>Situation is still unresolved</option>
                  <option>Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Additional details (optional)
                </label>

                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your experience. Please do not include names, phone numbers, addresses or other identifying details."
                  className={inputClass}
                />

                <p className="mt-2 text-[10px] leading-5 text-[#96938B]">
                  Avoid identifying individuals or including details
                  that could reveal your identity.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CONSENT */}
        {reportType && (
          <section className="mt-7 border border-[#DEDAD1] bg-[#EEECE6] p-6 md:p-8">
            <h2 className="serif text-2xl">
              A note on publication.
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#77746D]">
              We aim to use reports in anonymised aggregate analysis.
              Individual submissions may be reviewed and moderated
              before any information is made public. Submitting a
              report does not automatically make it verified.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />

              <span className="text-xs leading-6">
                I consent to my report being considered for anonymised
                public-interest analysis and publication after review.
              </span>
            </label>
          </section>
        )}

        {/* SUBMIT */}
        {reportType && (
          <div className="mt-8">
            {error && (
              <div className="mb-5 border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 bg-black px-7 py-5 text-xs font-semibold text-white transition hover:bg-[#393939] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "SUBMITTING REPORT..." : "SUBMIT REPORT"}

              {!loading && <ArrowRight size={16} />}
            </button>

            <p className="mt-4 text-center text-[10px] leading-5 text-[#96938B]">
              Your report will be sent securely to our reporting API.
              Please do not include personally identifying information.
            </p>
          </div>
        )}
      </form>

      {/* FOOTER */}
      <footer className="border-t border-[#DEDAD1] py-8">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-3 px-6 md:flex-row">
          <p className="serif text-lg font-bold">
            UnderTheTable
            <span className="text-[#B49B2D]">.</span>
          </p>

          <p className="text-[10px] text-[#96938B]">
            Independent public-interest project · India
          </p>
        </div>
      </footer>
    </main>
  );
}
