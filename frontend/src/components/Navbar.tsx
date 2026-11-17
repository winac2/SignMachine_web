
"use client";

import { useState } from "react";
import Link from "next/link";
import { Handshake, Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";  
import {useLanguage} from "@/contexts/LanguageContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const {t} = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D18]/90 backdrop-blur-xl">

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Handshake size={25} />
          </div>

          <div>
            <h1 className="font-bold tracking-wide text-white">
              SIGN MACHINE
            </h1>
            <p className="text-xs text-slate-400">Community</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            {t.navbar.home}
          </Link>

          <Link href="/contribute" className="text-sm text-slate-300 hover:text-white">
            {t.navbar.contribute}
          </Link>

          <Link href="/#about" className="text-sm text-slate-300 hover:text-white">
            {t.navbar.about}
          </Link>

          <Link href="/#community" className="text-sm text-slate-300 hover:text-white">
            {t.navbar.community}
          </Link>
          <LanguageSwitcher />
        </div>

        <Link
          href="/contribute"
          className="hidden rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 md:block"
        >
          {t.navbar.contributeData}
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#080D18] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            <Link href="/" onClick={closeMenu} className="text-slate-300">
              {t.navbar.home}
            </Link>

            <Link href="/contribute" onClick={closeMenu} className="text-slate-300">
              {t.navbar.contribute}
            </Link>

            <Link href="/#about" onClick={closeMenu} className="text-slate-300">
              {t.navbar.about}
            </Link>

            <Link href="/#community" onClick={closeMenu} className="text-slate-300">
              {t.navbar.community}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      )}
      
    </header>
  );
}
