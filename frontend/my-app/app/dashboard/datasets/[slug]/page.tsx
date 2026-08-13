"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import api from "@/lib/api";

interface Dataset {
  id: number;
  slug: string;
  name: string;
  file: string;
  status: string;
  row_count: number;
  column_count: number;
  quality_score: number | null;
  created_at: string;
  updated_at: string;
}

interface Issue {
  id: number;
  issue_type: string;
  column: string | null;
  row: number | null;
  severity: string;
  description: string;
}

export default function DatasetPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [dataset, setDataset] =
    useState<Dataset | null>(null);

  const [issues, setIssues] =
    useState<Issue[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDataset();
  }, [slug]);

  async function loadDataset() {
    try {
      setLoading(true);
      setError("");

      /*
       * First get datasets belonging to
       * the authenticated user.
       */

      const datasetResponse =
        await api.get<Dataset[]>(
          "/api/datasets/"
        );

      const foundDataset =
        datasetResponse.data.find(
          (dataset) =>
            dataset.slug === slug
        );

      if (!foundDataset) {
        setError("Dataset not found.");
        return;
      }

      setDataset(foundDataset);

      /*
       * Now use the slug to get issues.
       */

      const issueResponse =
        await api.get<Issue[]>(
          `/api/issues/${slug}/issues/`
        );

      setIssues(issueResponse.data);

    } catch (error) {
      console.error(error);

      setError(
        "Unable to load dataset details."
      );

    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060910] flex items-center justify-center text-white">

        <div className="text-center">

          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading dataset...
          </p>

        </div>

      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="min-h-screen bg-[#060910] text-white">

        <div className="mx-auto max-w-5xl px-6 py-10">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-12 text-center">

            <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />

            <h2 className="mt-4 text-lg font-semibold">
              Dataset not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }

  const highIssues = issues.filter(
    (issue) =>
      issue.severity === "HIGH"
  ).length;

  const mediumIssues = issues.filter(
    (issue) =>
      issue.severity === "MEDIUM"
  ).length;

  const lowIssues = issues.filter(
    (issue) =>
      issue.severity === "LOW"
  ).length;

  return (
    <main className="min-h-screen bg-[#060910] text-white">

      <header className="border-b border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-7 flex items-center gap-2 text-sm text-slate-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                </div>

                <div>

                  <h1 className="text-3xl font-semibold">
                    {dataset.name}
                  </h1>

                  <p className="mt-1 font-mono text-xs text-slate-600">
                    slug: {dataset.slug}
                  </p>

                </div>

              </div>

            </div>

            <div
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                dataset.status === "ANALYZED"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : dataset.status === "PROCESSING"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {dataset.status}
            </div>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Dataset information */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={<Database className="h-5 w-5" />}
            label="Rows"
            value={dataset.row_count.toLocaleString()}
          />

          <InfoCard
            icon={<FileSpreadsheet className="h-5 w-5" />}
            label="Columns"
            value={dataset.column_count.toString()}
          />

          <InfoCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Quality score"
            value={
              dataset.quality_score !== null
                ? `${dataset.quality_score.toFixed(1)}%`
                : "—"
            }
          />

          <InfoCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Issues"
            value={issues.length.toString()}
          />

        </section>

        {/* Severity */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <SeverityCard
            label="High"
            value={highIssues}
            className="text-red-400"
          />

          <SeverityCard
            label="Medium"
            value={mediumIssues}
            className="text-yellow-400"
          />

          <SeverityCard
            label="Low"
            value={lowIssues}
            className="text-blue-400"
          />

        </section>

        {/* Issues */}

        <section className="mt-8">

          <div className="mb-5">

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-blue-400" />

              <h2 className="text-xl font-semibold">
                Detected issues
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Problems discovered during dataset analysis.
            </p>

          </div>

          {issues.length === 0 ? (

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-12 text-center">

              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-400" />

              <h3 className="mt-4 font-semibold">
                No issues detected
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                This dataset looks clean.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {issues.map((issue) => (

                <div
                  key={issue.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/datasets/${slug}/issues/${issue.id}`
                    )
                  }
                  className="cursor-pointer rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
                >

                  <div className="flex items-start justify-between gap-5">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="font-medium">
                          {issue.issue_type.replaceAll(
                            "_",
                            " "
                          )}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                            issue.severity === "HIGH"
                              ? "bg-red-500/10 text-red-400"
                              : issue.severity === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {issue.severity}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {issue.description}
                      </p>

                      <div className="mt-3 flex gap-5 text-xs text-slate-600">

                        {issue.column && (
                          <span>
                            Column: {issue.column}
                          </span>
                        )}

                        {issue.row !== null && (
                          <span>
                            Row: {issue.row}
                          </span>
                        )}

                      </div>

                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-700" />

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}


function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
        {icon}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

    </div>
  );
}


function SeverityCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

      <p className="text-xs text-slate-500">
        {label} severity
      </p>

      <p className={`mt-2 text-2xl font-semibold ${className}`}>
        {value}
      </p>

    </div>
  );
}