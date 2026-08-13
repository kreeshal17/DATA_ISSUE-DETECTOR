"use client";

import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import api from "@/lib/api";

interface DatasetResponse {
  id: number;
  slug: string;
  name: string;
  status: string;
  row_count: number;
  column_count: number;
  quality_score: number | null;
}

export default function UploadDatasetPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      e.target.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    setError("");
    setFile(selectedFile);

    if (!name) {
      const fileName =
        selectedFile.name.replace(
          /\.csv$/i,
          ""
        );

      setName(fileName);
    }
  }

  function removeFile() {
    setFile(null);
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a dataset name.");
      return;
    }

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "file",
        file
      );

      const response =
        await api.post<DatasetResponse>(
          "/api/datasets/",
          formData
        );

      /*
       * Django returns the newly-created dataset.
       *
       * Example:
       *
       * {
       *   id: 1,
       *   name: "test_data",
       *   slug: "test_data"
       * }
       */

      router.push(
        `/dashboard/datasets/${response.data.slug}`
      );

    } catch (error) {
      console.error(error);

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: unknown;
          };
        };

        const data =
          axiosError.response?.data;

        if (
          typeof data === "object" &&
          data !== null
        ) {
          setError(
            Object.values(data)
              .flat()
              .join(" ")
          );
        } else {
          setError("Upload failed.");
        }

      } else {
        setError("Upload failed.");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#060910] text-white">

      <div className="mx-auto max-w-3xl px-6 py-10">

        <button
          onClick={() =>
            router.push("/dashboard")
          }
          className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mb-8">

          <p className="text-sm text-blue-400">
            New analysis
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Add a dataset
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Upload a CSV file and our pipeline will
            profile it and detect data quality issues.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
        >

          <div>

            <label className="text-sm text-slate-300">
              Dataset name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="test_data"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-600">
              Example: customer_data
            </p>

          </div>

          <div className="mt-7">

            <label className="text-sm text-slate-300">
              CSV file
            </label>

            {!file ? (

              <label
                htmlFor="dataset-file"
                className="mt-2 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 transition hover:border-blue-500/40 hover:bg-blue-500/[0.02]"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Upload className="h-7 w-7 text-blue-400" />
                </div>

                <p className="mt-5 text-sm font-medium">
                  Choose a CSV file
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Click to browse your computer
                </p>

                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>

            ) : (

              <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

            )}

          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading and analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload and analyze
              </>
            )}

          </button>

        </form>

      </div>

    </main>
  );
}