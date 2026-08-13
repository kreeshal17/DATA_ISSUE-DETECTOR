"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileWarning,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import api from "@/lib/api";

interface Issue {
  id: number;
  issue_type: string;
  column: string | null;
  row: number | null;
  severity: string;
  description: string;
}

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const issueId = params.issueId as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIssue();
  }, [slug, issueId]);

  async function loadIssue() {
    try {
      setLoading(true);
      setError("");

      /*
       * We already have the endpoint:
       *
       * GET /api/issues/<slug>/issues/
       *
       * So get all issues for this dataset
       * and find the requested issue ID.
       */

      const response = await api.get<Issue[]>(
        `/api/issues/${slug}/issues/`
      );

      const foundIssue = response.data.find(
        (item) => item.id === Number(issueId)
      );

      if (!foundIssue) {
        setError("Issue not found.");
        return;
      }

      setIssue(foundIssue);

    } catch (error) {
      console.error(error);
      setError("Unable to load issue.");

    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060910] text-white">

        <div className="text-center">

          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading issue...
          </p>

        </div>

      </main>
    );
  }

  if (!issue) {
    return (
      <main className="min-h-screen bg-[#060910] text-white">

        <div className="mx-auto max-w-4xl px-6 py-10">

          <button
            onClick={() =>
              router.push(
                `/dashboard/datasets/${slug}`
              )
            }
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dataset
          </button>

          <div className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-12 text-center">

            <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />

            <h2 className="mt-4 text-lg font-semibold">
              Issue not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }

  const severityClass =
    issue.severity === "HIGH"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : issue.severity === "MEDIUM"
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : "bg-blue-500/10 text-blue-400 border-blue-500/20";

  return (
    <main className="min-h-screen bg-[#060910] text-white">

      {/* Header */}

      <header className="border-b border-white/[0.06]">

        <div className="mx-auto max-w-5xl px-6 py-8">

          <button
            onClick={() =>
              router.push(
                `/dashboard/datasets/${slug}`
              )
            }
            className="mb-8 flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {slug}
          </button>

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <FileWarning className="h-6 w-6 text-red-400" />
            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-slate-600">
                Issue #{issue.id}
              </p>

              <h1 className="mt-1 text-3xl font-semibold capitalize">
                {issue.issue_type.replaceAll(
                  "_",
                  " "
                )}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Dataset:{" "}
                <span className="font-mono text-slate-400">
                  {slug}
                </span>
              </p>

            </div>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Severity */}

        <div className="flex flex-wrap gap-3">

          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${severityClass}`}
          >
            {issue.severity} severity
          </span>

          {issue.column && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
              Column: {issue.column}
            </span>
          )}

          {issue.row !== null && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
              Row: {issue.row}
            </span>
          )}

        </div>

        {/* Detected problem */}

        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>

            <div>

              <h2 className="font-semibold">
                Detected problem
              </h2>

              <p className="text-xs text-slate-600">
                Issue identified by the data quality pipeline
              </p>

            </div>

          </div>

          <div className="mt-6 rounded-xl border border-white/[0.05] bg-black/20 p-5">

            <p className="text-sm leading-7 text-slate-300">
              {issue.description}
            </p>

          </div>

        </section>

        {/* AI Explanation */}

        <section className="mt-6 rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.06] to-violet-500/[0.04] p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>

            <div>

              <h2 className="font-semibold">
                AI explanation
              </h2>

              <p className="text-xs text-slate-600">
                Intelligent root-cause analysis
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-5">

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                What happened?
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                This issue was detected during the automated
                quality analysis of your dataset.
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Root cause
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                AI root-cause analysis will be connected
                here next.
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Recommended action
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                The system will provide a recommended
                correction after the AI analysis is added.
              </p>

            </div>

          </div>

        </section>

        {/* Action */}

        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="h-5 w-5 text-emerald-400" />

            <div>

              <h2 className="font-semibold">
                Fix this issue
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Automatic data correction will be available
                after the AI recommendation.
              </p>

            </div>

          </div>

          <button
            disabled
            className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm text-slate-600"
          >
            Apply recommended fix
          </button>

        </section>

      </div>

    </main>
  );
}