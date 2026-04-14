import { ArrowRight, FilePenLine, Orbit, PenTool, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Smart Board",
    description: "Focused page-based writing with instant ink-to-text conversion and export.",
    icon: PenTool,
    to: "/board",
    accent: "from-sky-300/45 via-white/50 to-indigo-200/35",
  },
  {
    title: "Infinite Canvas",
    description: "Pan, zoom, brainstorm, and build sprawling visual notes with modular layers.",
    icon: Orbit,
    to: "/canvas",
    accent: "from-emerald-200/45 via-white/50 to-cyan-200/35",
  },
  {
    title: "PDF Editor",
    description: "Upload documents, annotate on top, and export an edited hand-marked version.",
    icon: FilePenLine,
    to: "/pdf",
    accent: "from-amber-200/45 via-white/50 to-rose-200/35",
  },
];

function Dashboard() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="glass-panel grain overflow-hidden rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-ink-900">
                <Sparkles className="h-4 w-4" />
                Glass workspace for handwritten thinking
              </div>
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  SenseCursor turns fluid ink into a modular writing studio.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  A web-based productivity surface that blends the calm structure of a dashboard,
                  the freedom of a handwriting tablet, and the layered control of a design tool.
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="glass-panel rounded-2xl px-4 py-3">Clean Text Mode on by default</div>
              <div className="glass-panel rounded-2xl px-4 py-3">Reusable canvas engine</div>
              <div className="glass-panel rounded-2xl px-4 py-3">JSON + PDF export ready</div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.to}
                className={`glass-panel group relative overflow-hidden rounded-[30px] bg-gradient-to-br p-6 transition duration-300 hover:-translate-y-2 hover:shadow-2xl animate-floatIn ${card.accent}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/35 blur-3xl transition duration-300 group-hover:scale-125" />
                <div className="relative flex h-full flex-col justify-between gap-10">
                  <div className="space-y-4">
                    <div className="inline-flex rounded-2xl border border-white/60 bg-white/55 p-3 text-ink-900">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-slate-900">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    Open workspace
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
