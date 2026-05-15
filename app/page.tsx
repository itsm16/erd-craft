"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Workflow,
  ArrowRight,
} from "lucide-react";

type FlowItem = {
  flowId: string;
  erdText: string;
  nodes: unknown[];
  edges: unknown[];
};

import crypto from 'node:crypto'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [search, setSearch] = useState("");
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const allFlows: FlowItem[] = [];

    for (const key in localStorage) {
      if (!key.startsWith("flow-")) continue;

      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);

        allFlows.push(parsed);
      } catch {
        //
      }
    }

    setFlows(allFlows);
  }, []);

  const filteredFlows = useMemo(() => {
    return flows.filter((flow) =>
      flow.flowId.toLowerCase().includes(search.toLowerCase())
    );
  }, [flows, search]);

  const createNewFlow = () => {
    const flowId = crypto.randomBytes(5).toString('hex')
    router.push(`/canvas/${flowId}`);
  };

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="flex h-screen">
        <section className="flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Dashboard
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  Open flows and manage ERD diagrams
                </p>
              </div>

              <button onClick={createNewFlow} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90">
                <Plus className="h-4 w-4" />
                New Flow
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-8 pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search flows..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Flow Cards */}
          <div className="grid gap-5 px-8 py-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredFlows.map((flow) => (
              <a
                key={flow.flowId}
                href={`/canvas/${flow.flowId}`}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-500/40 hover:bg-white/[0.05]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                    <Workflow className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold">
                  {flow.flowId}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">
                  {flow.erdText}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <code className="rounded-xl bg-black/30 px-3 py-2 text-xs text-indigo-300">
                    /canvas/{flow.flowId}
                  </code>

                  <ArrowRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}