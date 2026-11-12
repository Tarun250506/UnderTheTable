
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Report = {
  id: number;
  report_type: string;
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
  description: string | null;
  publication_consent: boolean;
  created_at: string;
};

type Admin = {
  id: number;
  email: string;
};

function formatAmount(amount: number | null) {
  if (amount === null || amount === undefined) {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-stone-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-stone-900">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : value}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // FETCH PENDING REPORTS
  // --------------------------------------------------

  async function fetchReports() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/reports`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        setAuthenticated(false);
        setAdmin(null);
        setReports([]);

        throw new Error("Your session has expired. Please log in again.");
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to retrieve pending reports."
        );
      }

      setReports(data);

      setMessage(
        data.length === 0
          ? "No pending reports. You're all caught up."
          : `${data.length} pending report(s) found.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // CHECK EXISTING SESSION ON PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setAuthenticated(false);
            setAdmin(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setAdmin(data.admin);
          setAuthenticated(true);
        }

        if (!cancelled) {
          await fetchReports();
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
          setAdmin(null);
          setError(
            "Unable to connect to the authentication server."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
    // Run only when the admin page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // ADMIN LOGIN
  // --------------------------------------------------

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoggingIn(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      setAdmin(data.admin);
      setAuthenticated(true);
      setPassword("");
      setEmail("");

      await fetchReports();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  // --------------------------------------------------
  // ADMIN LOGOUT
  // --------------------------------------------------

  async function logout() {
    setLoggingOut(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to log out.");
      }

      setAuthenticated(false);
      setAdmin(null);
      setReports([]);
      setEmail("");
      setPassword("");
      setMessage("You have been logged out successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Logout failed."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // --------------------------------------------------
  // APPROVE OR REJECT REPORTS
  // --------------------------------------------------

  async function updateModeration(
    reportId: number,
    status: "approved" | "rejected"
  ) {
    if (status === "rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this report?"
      );

      if (!confirmed) return;
    }

    setActionId(reportId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/reports/${reportId}/moderation`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAuthenticated(false);
        setAdmin(null);
        setReports([]);

        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update report.");
      }

      setReports((current) =>
        current.filter((report) => report.id !== reportId)
      );

      setMessage(`Report #${reportId} has been ${status}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  }

  // --------------------------------------------------
  // SESSION CHECK SCREEN
  // --------------------------------------------------

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f3] text-[#1c1c1c]">
        <p className="text-sm text-stone-500">
          Checking administrator session...
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#1c1c1c]">
      <header className="border-b border-[#dedbd2]">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="font-serif text-2xl font-bold"
          >
            UnderTheTable<span className="text-[#b49a43]">.</span>
          </Link>

          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Administration
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            Private workspace
          </p>

          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Report moderation.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Review citizen-submitted experiences before they are
            considered for publication. Reports are allegations and
            should not be treated as verified facts.
          </p>
        </div>

        {!authenticated ? (
          <section className="max-w-xl border border-[#dedbd2] bg-white p-7">
            <h2 className="font-serif text-2xl">
              Administrator login
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Sign in using your individual administrator account.
            </p>

            <form
              className="mt-6"
              onSubmit={login}
            >
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs uppercase tracking-wider text-stone-600"
              >
                Email address
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your administrator email"
                autoComplete="username"
                required
                className="w-full border border-[#dedbd2] bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-black"
              />

              <label
                htmlFor="admin-password"
                className="mb-2 mt-5 block text-xs uppercase tracking-wider text-stone-600"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full border border-[#dedbd2] bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-black"
              />

              <button
                type="submit"
                disabled={loggingIn}
                className="mt-5 w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingIn ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-[#dedbd2] bg-white p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  Signed in as
                </p>

                <p className="mt-1 font-medium">
                  {admin?.email}
                </p>

                <p className="mt-3 text-xs uppercase tracking-wider text-stone-500">
                  Moderation queue
                </p>

                <p className="mt-1 font-serif text-3xl">
                  {reports.length}
                </p>

                <p className="text-xs text-stone-500">
                  Pending reports
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="border border-[#dedbd2] px-4 py-2 text-sm hover:bg-stone-50 disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="bg-black px-4 py-2 text-sm text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>

            {reports.length === 0 && !loading && (
              <div className="border border-[#dedbd2] bg-white px-6 py-16 text-center">
                <h2 className="font-serif text-2xl">
                  No pending reports.
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  New submissions will appear here for review.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="border border-[#dedbd2] bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e5dd] px-6 py-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500">
                        Submission #{report.id}
                      </p>

                      <h2 className="mt-1 font-serif text-2xl">
                        {report.report_type === "both"
                          ? "Violation and service"
                          : report.report_type === "violation"
                          ? "Violation-related report"
                          : "Government service report"}
                      </h2>
                    </div>

                    <span className="border border-[#d8c99a] bg-[#faf7ed] px-3 py-1 text-xs uppercase tracking-wider text-[#806a2e]">
                      Pending review
                    </span>
                  </div>

                  <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Detail label="State" value={report.state} />
                    <Detail label="City" value={report.city} />

                    <Detail
                      label="Submitted"
                      value={new Date(report.created_at).toLocaleString("en-IN")}
                    />

                    {report.violation && (
                      <>
                        <Detail label="Violation" value={report.violation} />
                        <Detail label="Authority" value={report.authority} />
                        <Detail label="Consequence" value={report.consequence} />

                        <Detail
                          label="Amount demanded"
                          value={formatAmount(report.violation_amount_demanded)}
                        />

                        <Detail
                          label="Amount paid"
                          value={formatAmount(report.violation_amount_paid)}
                        />

                        <Detail
                          label="Official fine"
                          value={formatAmount(report.fine)}
                        />
                      </>
                    )}

                    {report.service && (
                      <>
                        <Detail label="Department" value={report.department} />
                        <Detail label="Service" value={report.service} />

                        <Detail
                          label="Amount demanded"
                          value={formatAmount(report.service_amount_demanded)}
                        />

                        <Detail
                          label="Amount paid"
                          value={formatAmount(report.service_amount_paid)}
                        />

                        <Detail
                          label="Official fee"
                          value={formatAmount(report.official_fee)}
                        />
                      </>
                    )}

                    <Detail
                      label="Incident date"
                      value={report.incident_date}
                    />

                    <Detail label="Outcome" value={report.outcome} />

                    <Detail
                      label="Publication consent"
                      value={report.publication_consent ? "Yes" : "No"}
                    />
                  </div>

                  <div className="mx-6 border-t border-[#e8e5dd] py-5">
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      Description
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                      {report.description ||
                        "No additional description provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 border-t border-[#e8e5dd] bg-[#fcfbf8] px-6 py-5">
                    <button
                      onClick={() =>
                        updateModeration(report.id, "rejected")
                      }
                      disabled={actionId === report.id}
                      className="border border-[#dedbd2] px-5 py-3 text-sm hover:bg-stone-100 disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        updateModeration(report.id, "approved")
                      }
                      disabled={actionId === report.id}
                      className="bg-black px-5 py-3 text-sm text-white hover:bg-stone-800 disabled:opacity-50"
                    >
                      {actionId === report.id
                        ? "Updating..."
                        : "Approve report"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-[#dedbd2] bg-white p-4 text-sm text-stone-700">
            {message}
          </div>
        )}

        <footer className="mt-16 border-t border-[#dedbd2] pt-6 text-xs leading-6 text-stone-500">
          UnderTheTable administration. Access is restricted.
          Approval is a moderation decision, not independent verification
          of the reported allegation or permission to publish it.
        </footer>
      </div>
    </main>
  );
}
