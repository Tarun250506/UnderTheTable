
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileText,
  BarChart3,
  Users,
  Scale,
  LockKeyhole,
  MapPin,
} from "lucide-react";

const principles = [
  {
    icon: FileText,
    number: "01",
    title: "Document experiences",
    description:
      "We collect first-hand accounts of unofficial payment demands involving public services and enforcement-related situations.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Identify patterns",
    description:
      "Individual submissions can help reveal broader patterns across departments, services, locations and time periods.",
  },
  {
    icon: Eye,
    number: "03",
    title: "Make information accessible",
    description:
      "We aim to present anonymised, aggregated information in a way that helps citizens, researchers and policymakers understand the problem.",
  },
];

const reportTypes = [
  {
    number: "01",
    title: "Enforcement-related payments",
    description:
      "Experiences involving unofficial payment demands in situations such as traffic enforcement, inspections, fines or other alleged violations.",
    example:
      "For example: being asked for an unofficial payment during a traffic stop.",
  },
  {
    number: "02",
    title: "Public service payments",
    description:
      "Experiences involving unofficial payments demanded to obtain, process or speed up access to a government service.",
    example:
      "For example: being asked for extra money to process an official document.",
  },
];

const safeguards = [
  {
    icon: Users,
    title: "No identity details requested",
    description:
      "Our reporting form does not ask contributors for their names, phone numbers or email addresses.",
  },
  {
    icon: LockKeyhole,
    title: "Careful handling of submissions",
    description:
      "Submitted information should be reviewed and sensitive personal details removed before any public use.",
  },
  {
    icon: ShieldCheck,
    title: "Moderation before publication",
    description:
      "Reports are not automatically published. They are subject to moderation and must meet our publication criteria.",
  },
  {
    icon: Scale,
    title: "Allegations are not established facts",
    description:
      "A submitted experience is a citizen report, not proof of wrongdoing. Published information must be presented with that distinction.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#171717]">
      <div className="mx-auto w-full max-w-[1120px] px-6">

        {/* Navigation */}
        <nav className="flex items-center justify-between border-b border-[#E5E1D8] py-6">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight"
          >
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
        <section className="border-b border-[#E5E1D8] py-20 md:py-28">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#A27C2B]">
            About the initiative
          </p>

          <h1 className="max-w-[850px] font-serif text-5xl leading-[1.12] tracking-tight md:text-7xl">
            The price of getting things done should never be{" "}
            <span className="italic text-[#A27C2B]">unofficial.</span>
          </h1>

          <p className="mt-8 max-w-[690px] text-lg leading-8 text-[#68645D]">
            UnderTheTable is an independent public-interest reporting
            initiative documenting citizens' experiences with unofficial
            payment demands in India.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/report"
              className="inline-flex items-center gap-3 bg-[#171717] px-6 py-4 text-sm text-white transition hover:bg-[#343434]"
            >
              Share your experience
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/reports"
              className="inline-flex items-center gap-3 border border-[#D8D3C8] px-6 py-4 text-sm transition hover:border-[#A27C2B]"
            >
              Explore reported experiences
            </Link>
          </div>
        </section>

        {/* Why we exist */}
        <section className="grid gap-12 border-b border-[#E5E1D8] py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
              01 / Why we exist
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight">
              Some payments never appear on a receipt.
            </h2>
          </div>

          <div className="space-y-6 text-[15px] leading-8 text-[#68645D]">
            <p>
              Across everyday interactions with public institutions, citizens
              may encounter demands for money that are not part of any official
              fee or legally prescribed payment.
            </p>

            <p>
              These experiences can be difficult to document. They are often
              isolated, rarely recorded in formal datasets and difficult to
              compare across locations or departments.
            </p>

            <p>
              UnderTheTable aims to create a structured record of these
              experiences, helping make an otherwise difficult-to-measure
              problem more visible.
            </p>
          </div>
        </section>

        {/* What we document */}
        <section className="border-b border-[#E5E1D8] py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
            02 / What we document
          </p>

          <h2 className="mt-5 max-w-[700px] font-serif text-4xl leading-tight md:text-5xl">
            Two kinds of experiences. One larger picture.
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {reportTypes.map((item) => (
              <article
                key={item.number}
                className="border border-[#E5E1D8] bg-[#FBFAF7] p-8 md:p-10"
              >
                <p className="text-sm tracking-widest text-[#A27C2B]">
                  {item.number}
                </p>

                <h3 className="mt-8 font-serif text-3xl">
                  {item.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-[#68645D]">
                  {item.description}
                </p>

                <p className="mt-6 border-t border-[#E5E1D8] pt-5 text-sm italic leading-6 text-[#8A8479]">
                  {item.example}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-[#E5E1D8] py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
            03 / Our approach
          </p>

          <h2 className="mt-5 max-w-[650px] font-serif text-4xl leading-tight md:text-5xl">
            Turning individual experiences into collective insight.
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.number}>
                  <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-5">
                    <Icon size={23} strokeWidth={1.4} />
                    <span className="text-xs tracking-widest text-[#A27C2B]">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#777168]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Privacy and safeguards */}
        <section className="grid gap-12 border-b border-[#E5E1D8] py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
              04 / Trust and safeguards
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight">
              Transparency must begin with responsibility.
            </h2>

            <p className="mt-6 text-sm leading-7 text-[#777168]">
              Documenting sensitive experiences requires care. Protecting
              contributors and avoiding unsupported accusations are essential
              to the purpose of this initiative.
            </p>
          </div>

          <div className="space-y-8">
            {safeguards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="flex gap-5"
                >
                  <div className="mt-1 shrink-0 text-[#A27C2B]">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  <div>
                    <h3 className="font-serif text-xl">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-[#777168]">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Important disclaimer */}
        <section className="border-b border-[#E5E1D8] py-16">
          <div className="border-l-2 border-[#B18A36] pl-6 md:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A27C2B]">
              An important distinction
            </p>

            <h2 className="mt-4 font-serif text-3xl">
              Reports are accounts, not verdicts.
            </h2>

            <p className="mt-5 max-w-[780px] text-sm leading-7 text-[#777168]">
              Information submitted to UnderTheTable represents individual
              accounts and allegations. It should not be interpreted as
              independently verified proof of misconduct by a particular
              person, official or institution. Our aim is to identify broader
              patterns responsibly, not to publicly accuse individuals.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <MapPin
            size={25}
            strokeWidth={1.4}
            className="mx-auto text-[#A27C2B]"
          />

          <h2 className="mx-auto mt-7 max-w-[700px] font-serif text-4xl leading-tight md:text-5xl">
            Every documented experience adds another piece to the picture.
          </h2>

          <p className="mx-auto mt-6 max-w-[550px] text-sm leading-7 text-[#777168]">
            If you have experienced an unofficial payment demand, consider
            sharing your experience. No names or contact details are requested.
          </p>

          <Link
            href="/report"
            className="mt-9 inline-flex items-center gap-3 bg-[#171717] px-7 py-4 text-sm text-white transition hover:bg-[#343434]"
          >
            Submit a report
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-4 border-t border-[#E5E1D8] py-8 text-xs text-[#8A8479] md:flex-row">
          <p>
            © 2026 UnderTheTable. An independent
            public-interest initiative.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link href="/reports" className="hover:text-black">
              Reports
            </Link>
            <Link href="/departments" className="hover:text-black">
              Departments
            </Link>
            <Link href="/map" className="hover:text-black">
              Map
            </Link>
            <Link href="/report" className="hover:text-black">
              Submit a report
            </Link>
            <Link href="/Privacy" className="hover:text-black">
            Privacy & Methodology
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
