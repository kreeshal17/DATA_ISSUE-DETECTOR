"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileSpreadsheet,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface User {
  id: number;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [datasetResponse, userResponse] =
        await Promise.all([
          api.get<Dataset[]>("/api/datasets/"),
          api.get<User>("/api/auth/me/"),
        ]);

      setDatasets(datasetResponse.data);
      setUser(userResponse.data);

    } catch (error) {
      console.error(error);

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            status?: number;
          };
        };

        if (axiosError.response?.status === 401) {
          router.push("/login");
          return;
        }
      }

      setError("Unable to load your dashboard.");

    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await api.post("/api/auth/logout/");

      router.push("/login");

    } catch (error) {
      console.error(error);
      router.push("/login");

    } finally {
      setLoggingOut(false);
    }
  }

  const totalDatasets = datasets.length;

  const analyzedDatasets = datasets.filter(
    (dataset) => dataset.status === "ANALYZED"
  ).length;

  const processingDatasets = datasets.filter(
    (dataset) => dataset.status === "PROCESSING"
  ).length;

  const failedDatasets = datasets.filter(
    (dataset) => dataset.status === "FAILED"
  ).length;

  const totalRows = datasets.reduce(
    (total, dataset) =>
      total + dataset.row_count,
    0
  );

  const scoredDatasets = datasets.filter(
    (dataset) =>
      dataset.quality_score !== null
  );

  const averageQuality =
    scoredDatasets.length > 0
      ? scoredDatasets.reduce(
          (total, dataset) =>
            total +
            (dataset.quality_score ?? 0),
          0
        ) / scoredDatasets.length
      : null;

  const recentDatasets = [...datasets]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#060910] text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-[120px]" />

        <div className="absolute top-[45%] -right-40 h-[450px] w-[450px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060910]/85 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Data Quality AI
              </p>

              <p className="text-[10px] text-slate-500">
                Intelligent data analysis
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.username ?? "User"}
              </p>

              <p className="text-[11px] text-slate-500">
                {user?.email ?? ""}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() ?? "U"}
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>

          </div>

        </div>

      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure workspace
            </div>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              Your data workspace
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Upload datasets, detect data quality problems,
              and investigate issues with AI.
            </p>

          </div>

          <button
            onClick={() =>
              router.push("/dashboard/upload")
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add dataset
            <ArrowRight className="h-4 w-4" />
          </button>

        </section>

        {error && (
          <div className="mt-8 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">

            <div className="flex items-center gap-3">

              <AlertCircle className="h-5 w-5 text-red-400" />

              <div>
                <p className="text-sm font-medium text-red-300">
                  Dashboard error
                </p>

                <p className="mt-1 text-xs text-red-400/70">
                  {error}
                </p>
              </div>

            </div>

            <button
              onClick={loadDashboard}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>

          </div>
        )}

        {loading ? (

          <div className="flex min-h-[500px] items-center justify-center">

            <div className="flex flex-col items-center">

              <Loader2 className="h-7 w-7 animate-spin text-blue-400" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your workspace...
              </p>

            </div>

          </div>

        ) : (

          <>

            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                icon={<Database className="h-5 w-5" />}
                label="Datasets"
                value={totalDatasets.toString()}
                description="Total uploaded"
              />

              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Analyzed"
                value={analyzedDatasets.toString()}
                description="Analysis completed"
              />

              <StatCard
                icon={<BarChart3 className="h-5 w-5" />}
                label="Average quality"
                value={
                  averageQuality !== null
                    ? `${averageQuality.toFixed(1)}%`
                    : "—"
                }
                description="Across scored datasets"
              />

              <StatCard
                icon={<FileSpreadsheet className="h-5 w-5" />}
                label="Total rows"
                value={totalRows.toLocaleString()}
                description="Across all datasets"
              />

            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="font-semibold">
                      Dataset health
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current workspace status
                    </p>
                  </div>

                  <BarChart3 className="h-5 w-5 text-slate-600" />

                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">

                  <HealthCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Analyzed"
                    value={analyzedDatasets}
                    className="text-emerald-400"
                  />

                  <HealthCard
                    icon={<Clock3 className="h-4 w-4" />}
                    label="Processing"
                    value={processingDatasets}
                    className="text-yellow-400"
                  />

                  <HealthCard
                    icon={<XCircle className="h-4 w-4" />}
                    label="Failed"
                    value={failedDatasets}
                    className="text-red-400"
                  />

                </div>

                <div className="mt-8">

                  <div className="mb-3 flex justify-between">

                    <span className="text-xs text-slate-500">
                      Average quality
                    </span>

                    <span className="text-sm font-semibold">
                      {averageQuality !== null
                        ? `${averageQuality.toFixed(1)}%`
                        : "—"}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{
                        width: `${Math.min(
                          averageQuality ?? 0,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.05] p-6">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Analyze a dataset
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Upload a CSV and detect missing values,
                  duplicates, anomalies, and invalid formats.
                </p>

                <button
                  onClick={() =>
                    router.push("/dashboard/upload")
                  }
                  className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium hover:bg-blue-500"
                >
                  <Upload className="h-4 w-4" />
                  Upload dataset
                </button>

              </div>

            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">

              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">

                <div>
                  <h2 className="font-semibold">
                    Your datasets
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Click Analyze to inspect the dataset.
                  </p>
                </div>

                <button
                  onClick={loadDashboard}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>

              </div>

              {recentDatasets.length === 0 ? (

                <div className="px-6 py-20 text-center">

                  <Database className="mx-auto h-8 w-8 text-slate-600" />

                  <h3 className="mt-5 font-semibold">
                    No datasets yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload your first dataset.
                  </p>

                  <button
                    onClick={() =>
                      router.push("/dashboard/upload")
                    }
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500"
                  >
                    Add dataset
                  </button>

                </div>

              ) : (

                <div className="divide-y divide-white/[0.05]">

                  {recentDatasets.map((dataset) => (

                    <DatasetRow
                      key={dataset.id}
                      dataset={dataset}
                      onAnalyze={() =>
                        router.push(
                          `/dashboard/datasets/${dataset.slug}`
                        )
                      }
                    />

                  ))}

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </main>
  );
}


function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
        {icon}
      </div>

      <p className="mt-5 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>

    </div>
  );
}


function HealthCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">

      <div className={`flex items-center gap-2 ${className}`}>
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>

    </div>
  );
}


function DatasetRow({
  dataset,
  onAnalyze,
}: {
  dataset: Dataset;
  onAnalyze: () => void;
}) {
  const statusClass =
    dataset.status === "ANALYZED"
      ? "bg-emerald-500/10 text-emerald-400"
      : dataset.status === "PROCESSING"
      ? "bg-yellow-500/10 text-yellow-400"
      : dataset.status === "FAILED"
      ? "bg-red-500/10 text-red-400"
      : "bg-slate-500/10 text-slate-400";

  return (
    <div className="group flex flex-col gap-5 px-6 py-5 transition hover:bg-white/[0.02] lg:flex-row lg:items-center lg:justify-between">

      <div className="flex min-w-0 items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="truncate text-sm font-medium">
              {dataset.name}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClass}`}
            >
              {dataset.status}
            </span>

          </div>

          <p className="mt-1 font-mono text-[11px] text-slate-600">
            slug: {dataset.slug}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">

            <span>
              {dataset.row_count.toLocaleString()} rows
            </span>

            <span>•</span>

            <span>
              {dataset.column_count} columns
            </span>

            <span>•</span>

            <span>
              {new Date(
                dataset.created_at
              ).toLocaleDateString()}
            </span>

          </div>

        </div>

      </div>

      <div className="flex items-center justify-between gap-5 lg:justify-end">

        <div className="text-right">

          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Quality
          </p>

          <p className="mt-1 text-sm font-semibold">
            {dataset.quality_score !== null
              ? `${dataset.quality_score.toFixed(1)}%`
              : "Not scored"}
          </p>

        </div>

        <button
          onClick={onAnalyze}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/[0.06] hover:text-blue-300"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Analyze
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

      </div>

    </div>
  );
}