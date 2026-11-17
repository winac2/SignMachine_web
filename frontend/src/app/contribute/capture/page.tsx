"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import WebcamCapture from "@/components/WebcamCapture";
import {useLanguage} from "@/contexts/LanguageContext";
interface Contribution {
  gesture_name: string;
  contributor_name: string;
}

export default function CapturePage() {
  const {t} = useLanguage();
  const router = useRouter();

  const [contribution, setContribution] =
    useState<Contribution | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(
      "signmachine_contribution"
    );

    if (!saved) {
      router.replace("/contribute");
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!parsed.gesture_name) {
        router.replace("/contribute");
        return;
      }

      setContribution({
        gesture_name: parsed.gesture_name,
        contributor_name:
          parsed.contributor_name?.trim() ||
          "Prefer not to say",
      });
    } catch {
      router.replace("/contribute");
    }
  }, [router]);

  if (!contribution) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        Loading contribution...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-3 text-3xl font-bold">
        {t.capture.title}
      </h1>

      <p className="mb-8 text-gray-400">
        {t.capture.content1}
        {t.capture.content2}
      </p>

      <WebcamCapture
        gestureName={contribution.gesture_name}
        contributorName={contribution.contributor_name}
      />
    </main>
  );
}