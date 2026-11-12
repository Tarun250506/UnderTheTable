
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Database,
  Eye,
  FileCheck,
  BarChart3,
  Scale,
  AlertTriangle,
  LockKeyhole,
} from "lucide-react";

const privacySections = [
  {
    icon: Database,
    title: "1. Information we collect",
    paragraphs: [
      "When you submit a report, we may collect the information you provide through the reporting form. This can include the type of experience, department or authority, service or violation category, amounts demanded or paid, official fees, city, state, incident date, outcome and written description.",
      "The reporting form is designed not to request your name, phone number or email address. Please do not include personal contact details or identifying information about yourself or other individuals in the description.",
    ],
  },
  {
    icon: Eye,
    title: "2. How information is used",
    paragraphs: [
      "Submitted information is used to review reports, identify broad patterns, prepare aggregate statistics and improve public understanding of unofficial payment demands.",
      "Only reports that have been approved through moderation and for which publication consent has been provided are eligible to appear in the public Reports Registry and related public statistics.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "3. Public visibility and consent",
    paragraphs: [
      "Submitting a report does not automatically mean that it will be published. Publication is subject to moderation and the publication-consent choice made when submitting the report.",
      "Public displays are intended to use limited report information, such as category, location, date and relevant amounts. Written descriptions and sensitive details should not be published without an appropriate review.",
    ],
  },
  {
    icon: LockKeyhole,
    title: "4. Privacy limitations",
    paragraphs: [
      "We take a privacy-conscious approach, but we cannot promise absolute anonymity. Information may be processed by the infrastructure and hosting providers required to operate the platform. Technical logs or other operational records may also exist.",
      "A combination of details in a report could potentially identify a person or incident. Avoid submitting names, phone numbers, addresses, identity numbers, case references or other details that could identify you or someone else.",
    ],
  },
  {
    icon: FileCheck,
    title: "5. Review, correction and removal",
    paragraphs: [
      "Reports may be reviewed, rejected, withheld or removed where they contain identifying details, unsupported accusations, irrelevant content or other material that creates privacy or safety concerns.",
      "A report being visible on the platform does not mean that every detail has been independently verified. We intend to provide a contact and request process for privacy, correction and removal concerns before opening the platform to the public.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "6. Sensitive information and third parties",
    paragraphs: [
      "Please do not upload confidential documents, identity documents, financial account information, private correspondence or information obtained unlawfully.",
      "The platform may rely on third-party hosting, database and infrastructure services. Their processing of technical information is governed by their respective terms and privacy practices.",
    ],
  },
];

const methodologySteps = [
  {
    number: "01",
    title: "Submission",
    description:
      "A contributor shares an account through the reporting form. Reports are based on the contributor's own description of an experience.",
  },
  {
    number: "02",
    title: "Moderation",
    description:
      "A report is reviewed before publication. Reports may be rejected or withheld if they contain identifying information, unsafe content or material that does not meet publication criteria.",
  },
  {
    number: "03",
    title: "Categorisation",
    description:
      "Eligible reports are grouped using the information supplied, including report type, department or authority, service or violation category and geographic location.",
  },
  {
    number: "04",
    title: "Aggregation",
    description:
      "Approved reports may contribute to summary statistics and geographic or departmental views. These summaries describe the reports received, not the prevalence of misconduct across the entire population.",
  },
  {
    number: "05",
    title: "Interpretation",
    description:
      "Published findings are presented as citizen-reported experiences. They should be interpreted with care and should not be treated as legal findings or proof against a particular person or institution.",
  },
];

export default function PrivacyMethodologyPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#171717]">
      <div className="mx-auto w-full max-w-[1120px] px-6">

        {/* Navigation */}
        <nav className="flex items-center justify-between border-b border-[#E5E1D8] py-6">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            UnderTheTable<span className="text-[#B18A36]">.</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#68645D] transition hover:text-black"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </nav>

        {/* Hero */}
        <section className="border-b border-[#E5E1D8] py-20 md:py-24">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#A27C2B]">
            Privacy & methodology
          </p>

          <h1 className="max-w-[850px] font-serif text-5xl leading-[1.12] tracking-tight md:text-7xl">
            Trust requires{" "}
            <span className="italic text-[#A27C2B]">transparency.</span>
          </h1>

          <p className="mt-8 max-w-[690px] text-lg leading-8 text-[#68645D]">
            How information is handled, how reports are reviewed and what our
            published findings can — and cannot — tell you.
          </p>

          <p className="mt-6 text-xs text-[#8A8479]">
            Draft policy · Last updated: 12 November 2026
          </p>
        </section>

        {/* Privacy policy */}
        <section id="privacy" className="border-b border-[#E5E1D8] py-20">
          <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
                Part one
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight">
                Privacy policy
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#777168]">
                The principles governing the information contributors choose
                to share with UnderTheTable.
              </p>
            </div>

            <div className="space-y-10">
              {privacySections.map((section) => {
                const Icon = section.icon;

                return (
                  <article
                    key={section.title}
                    className="border-b border-[#E5E1D8] pb-9 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        className="text-[#A27C2B]"
                      />
                      <h3 className="font-serif text-2xl">
                        {section.title}
                      </h3>
                    </div>

                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-sm leading-7 text-[#777168]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="methodology" className="border-b border-[#E5E1D8] py-20">
          <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
                Part two
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight">
                Our methodology
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#777168]">
                How individual submissions become structured information and
                public-interest insights.
              </p>
            </div>

            <div className="space-y-0">
              {methodologySteps.map((step, index) => (
                <article
                  key={step.number}
                  className="relative border-l border-[#D8D0BE] pb-10 pl-8 last:pb-0"
                >
                  <span className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#D8D0BE] bg-[#F8F7F3] text-[10px] text-[#A27C2B]">
                    {step.number}
                  </span>

                  <h3 className="font-serif text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#777168]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Understanding the data */}
        <section className="border-b border-[#E5E1D8] py-20">
          <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
                Reading the data
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight">
                What the numbers mean.
              </h2>
            </div>

            <div className="space-y-7">
              <article>
                <h3 className="font-serif text-xl">
                  Reports are not a representative survey
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#777168]">
                  People choose whether to submit a report. Contributors are
                  not a random sample of India's population. The number of
                  reports from a location does not establish how common an
                  experience is among all citizens there.
                </p>
              </article>

              <article>
                <h3 className="font-serif text-xl">
                  Amounts reflect submitted accounts
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#777168]">
                  Amounts shown are based on information supplied by
                  contributors. They are not independently audited, and
                  differences in circumstances may make direct comparisons
                  misleading.
                </p>
              </article>

              <article>
                <h3 className="font-serif text-xl">
                  Categories depend on submitted information
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#777168]">
                  Department, service and location summaries depend on how
                  contributors describe their experiences. Inconsistent or
                  incomplete descriptions can affect categorisation.
                </p>
              </article>

              <article>
                <h3 className="font-serif text-xl">
                  Reports do not establish wrongdoing
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#777168]">
                  A report is an account of an alleged experience. It is not a
                  judicial finding, an official complaint determination or
                  independently established proof of misconduct.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="border-b border-[#E5E1D8] py-16">
          <div className="border-l-2 border-[#B18A36] pl-6 md:pl-8">
            <div className="flex items-center gap-3">
              <Scale size={21} className="text-[#A27C2B]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
                Limitations and responsibility
              </p>
            </div>

            <h2 className="mt-5 font-serif text-3xl">
              Context matters more than a headline.
            </h2>

            <p className="mt-5 max-w-[780px] text-sm leading-7 text-[#777168]">
              UnderTheTable is a public-interest reporting initiative, not a
              law-enforcement agency, adjudicating body or substitute for
              official grievance mechanisms. Its reports and statistics should
              not be used on their own to draw conclusions about the guilt,
              conduct or integrity of any individual.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <BarChart3
            size={26}
            strokeWidth={1.4}
            className="mx-auto text-[#A27C2B]"
          />

          <h2 className="mx-auto mt-7 max-w-[680px] font-serif text-4xl leading-tight md:text-5xl">
            Better information begins with responsible reporting.
          </h2>

          <p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-[#777168]">
            If you choose to contribute, share only information you are
            comfortable providing. Please avoid identifying details.
          </p>

          <Link
            href="/report"
            className="mt-9 inline-flex items-center gap-3 bg-[#171717] px-7 py-4 text-sm text-white transition hover:bg-[#343434]"
          >
            Share an experience
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-4 border-t border-[#E5E1D8] py-8 text-xs text-[#8A8479] md:flex-row">
          <p>
            © 2026 UnderTheTable. An independent public-interest initiative.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link href="/about" className="hover:text-black">
              About
            </Link>
            <Link href="/reports" className="hover:text-black">
              Reports
            </Link>
            <Link href="/departments" className="hover:text-black">
              Departments
            </Link>
            <Link href="/map" className="hover:text-black">
              Map
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
