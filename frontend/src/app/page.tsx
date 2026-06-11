import { APP_NAME } from "@saptakoshi/shared";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <main className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-700">
          Monorepo Foundation
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          {APP_NAME}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Welcome to the frontend workspace. This page uses shared constants
          from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">@saptakoshi/shared</code>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
            Next.js
          </span>
          <span className="rounded-full bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-800">
            TypeScript
          </span>
          <span className="rounded-full bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-800">
            Tailwind CSS
          </span>
        </div>
      </main>
    </div>
  );
}
