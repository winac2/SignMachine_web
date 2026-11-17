"use client";


import Link from "next/link";
import {useLanguage} from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    
    <footer className="border-t border-white/10 bg-[#080D18]">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 md:flex-row md:items-center">

        <div>
          <h3 className="font-bold tracking-wider text-white">
            SIGN MACHINE
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {t.footer.des}
          </p>
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            {t.navbar.home}
          </Link>

          <Link href="/contribute" className="hover:text-white">
            {t.navbar.contribute}
          </Link>

          <Link href="/#about" className="hover:text-white">
            {t.navbar.about}
          </Link>
        </div>

        <p className="text-xs text-slate-600">
          © 2026 Sign Machine.
        </p>

      </div>
    </footer>
  );
}
