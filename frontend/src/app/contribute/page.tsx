
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hand,
  User,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { getGestures, type Gesture } from "@/lib/api";

export default function ContributePage() {
  const router = useRouter();

  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [selectedGesture, setSelectedGesture] = useState("");
  const [contributorName, setContributorName] =
    useState("Prefer not to say");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Load gestures from FastAPI
  useEffect(() => {
    async function loadGestures() {
      try {
        const result = await getGestures();

        setGestures(result.gestures);

        if (result.gestures.length > 0) {
          setSelectedGesture(result.gestures[0].name);
        }
      } catch {
        setError(
          "Unable to connect to Sign Machine API. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadGestures();
  }, []);

  function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedGesture) {
      setError("Please select a gesture.");
      return;
    }

    const finalName =
      contributorName.trim() || "Prefer not to say";

    // Prepare contribution information for the next step.
    sessionStorage.setItem(
      "signmachine_contribution",
      JSON.stringify({
        gesture_name: selectedGesture,
        contributor_name: finalName,
      })
    );
    router.push("/contribute/capture");

    setReady(true);
  }

  return (
    <main className="min-h-screen bg-[#080D18] px-6 py-20">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Hand size={34} />
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Community contribution
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Contribute Data
          </h1>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            Help improve Sign Machine by contributing
            your hand gesture data.
          </p>

        </div>

        {/* FORM */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-[#101A2B] p-7 md:p-10">

          <form onSubmit={handleContinue} className="space-y-9">

            {/* GESTURE */}
            <div>

              <label className="mb-3 block text-sm font-semibold text-white">
                01. Select a gesture
              </label>

              {loading ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-slate-400">
                  <LoaderCircle className="animate-spin" size={20} />
                  Loading gestures...
                </div>
              ) : (
                <select
                  value={selectedGesture}
                  onChange={(e) => setSelectedGesture(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080D18] px-5 py-4 text-white outline-none transition focus:border-blue-500"
                >
                  {gestures.map((gesture) => (
                    <option key={gesture.name} value={gesture.name}>
                      {gesture.name.charAt(0).toUpperCase() +
                        gesture.name.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              <p className="mt-3 text-sm text-slate-500">
                Choose the gesture you want to contribute.
              </p>

            </div>

            {/* CONTRIBUTOR NAME */}
            <div>

              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <User size={17} />
                02. Contributor Name
              </label>

              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                maxLength={60}
                placeholder="Prefer not to say"
                className="w-full rounded-xl border border-white/10 bg-[#080D18] px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />

              <p className="mt-3 text-sm leading-6 text-slate-500">
                You can use a nickname or leave the default value.
                Your real name is not required.
              </p>

            </div>

            {/* PRIVACY */}
            <div className="flex gap-4 rounded-xl border border-green-500/20 bg-green-500/5 p-5">

              <ShieldCheck
                size={24}
                className="shrink-0 text-green-400"
              />

              <div>
                <p className="font-semibold text-green-300">
                  Privacy matters
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  No account or email is required.
                  Your contribution will be associated
                  with a generated contributor identifier.
                </p>
              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                <AlertCircle size={19} />
                {error}
              </div>
            )}

            {/* CONTINUE */}
            {!ready ? (
              <button
                type="submit"
                disabled={loading || gestures.length === 0}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Camera
                <ArrowRight size={20} />
              </button>
            ) : (
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">

                <p className="font-semibold text-blue-300">
                  Contribution information prepared!
                </p>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>Gesture: <strong>{selectedGesture}</strong></p>
                  <p>Contributor: <strong>{contributorName.trim() || "Prefer not to say"}</strong></p>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Camera capture will be available in the next development step.
                  No data has been submitted yet.
                </p>

                <button
                  type="button"
                  onClick={() => setReady(false)}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  Edit information
                </button>

              </div>
            )}

          </form>

        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Thank you for supporting Sign Machine.
        </p>

      </div>

    </main>
  );
}
