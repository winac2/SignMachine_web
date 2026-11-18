"use client";

import {useLanguage} from "@/contexts/LanguageContext";

import Link from "next/link";
import {
  ArrowRight,
  Hand,
  Users,
  Database,
  BrainCircuit,
  HeartHandshake,
  Camera,
  Globe,
  ShieldCheck,
} from "lucide-react";




export default function Home() {


  const {t} = useLanguage();

  const features = [
  {
    icon: Camera,
    title: t.home.box1Title,
    description:
      t.home.box1Description,
  },
  {
    icon: Database,
    title: t.home.box2Title,
    description:
      t.home.box2Description,
  },
  {
    icon: BrainCircuit,
    title: t.home.box3Title,
    description:
      t.home.box3Description,
  },
  ];


  
  return (
    <main className="min-h-screen bg-[#080D18] text-white">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 md:grid-cols-2">

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
              <Globe size={16} />
              {t.home.openproject}
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              {t.home.k1}
              <br />
              {t.home.k2}{" "}
              <span className="text-blue-400">{t.home.k3}</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              {t.home.helpus}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/contribute"
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
              >
                {t.home.startcontributing}
                <ArrowRight size={19} />
              </Link>

              <a
                href="#about"
                className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 transition hover:bg-white/5"
              >
                {t.home.learnmore}
              </a>

            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={18} className="text-green-400" />
              {t.home.noaccount}
            </div>
          </div>

          {/* VISUAL */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#142541] to-[#0D1525] p-8 shadow-2xl">

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  Sign Machine
                </span>

                <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-400">
                  {t.home.communitydriven}
                </span>
              </div>

              <div className="flex h-72 flex-col items-center justify-center">

                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10">
                  <Hand size={85} strokeWidth={1.2} className="text-blue-300" />
                </div>

                <p className="mt-7 text-xl font-semibold">
                  {t.home.hand}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {t.home.poweredby}
                </p>

              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                {["MediaPipe", "Landmarks", "Machine Learning"].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg bg-white/5 p-3 text-center text-xs text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-white/5 bg-[#0B1220] py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t.home.about}
            </p>

            <h2 className="mt-5 text-3xl font-bold md:text-4xl">
              {t.home.a1}
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              {t.home.subabout}
            </p>

          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-[#101A2B] p-8 transition hover:-translate-y-1 hover:border-blue-400/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-7 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* CONTRIBUTION PROCESS */}
      <section id="community" className="py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t.home.getinvoled}
            </p>

            <h2 className="mt-5 text-3xl font-bold">
              {t.home.threeSteps}
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">

            {[
              ["01", t.home.step1, t.home.s1ct],
              ["02", t.home.step2, t.home.s2ct],
              ["03", t.home.step3, t.home.s3ct],
            ].map(([number, title, description]) => (
              <div key={number} className="border-l-2 border-blue-500/40 pl-7">
                <span className="text-3xl font-bold text-blue-400">
                  {number}
                </span>

                <h3 className="mt-5 text-xl font-semibold">{title}</h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {description}
                </p>
              </div>
            ))}

          </div>

          <div className="mt-16 text-center">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
            >
              {t.home.join}
              <HeartHandshake size={20} />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
