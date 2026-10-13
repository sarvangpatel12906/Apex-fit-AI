import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xl font-bold tracking-tight"
          >
            ApexFit
            <span className="text-cyan-400">-AI</span>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Platform
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Dashboard
            </button>
          </nav>

          <div className="flex items-center gap-3">
  <button
    type="button"
    onClick={() => navigate("/login")}
    className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-900"
  >
    Login
  </button>

  <button
    type="button"
    onClick={() => navigate("/setup")}
    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
  >
    Get Started
  </button>
</div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>

        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">

            {/* LEFT */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Intelligent Fitness Platform
                </span>
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Train smarter.
                <br />
                <span className="text-cyan-400">
                  Perform better.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
                ApexFit AI helps you build personalized workouts,
                track your training, monitor progress and make
                better fitness decisions from one intelligent platform.
              </p>

              {/* HERO BUTTONS */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl bg-cyan-500 px-7 py-4 font-bold text-black transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  Get Started
                  <span className="ml-2">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl border border-zinc-700 bg-zinc-900/50 px-7 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Explore Platform
                </button>

              </div>

              {/* SMALL STATS */}
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-zinc-800 pt-7">

                <div>
                  <p className="text-2xl font-bold">AI</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Assisted Training
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Progress Tracking
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Unified Platform
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT HERO CARD */}
            <div className="relative">

              <div className="absolute -inset-4 rounded-[2rem] bg-cyan-500/5 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#111111] shadow-2xl">

                {/* Fake dashboard header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

                  <div>
                    <p className="text-xs uppercase tracking-widest text-cyan-400">
                      ApexFit AI
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      Training Overview
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    ✦
                  </div>

                </div>

                <div className="space-y-5 p-6">

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-xs text-zinc-500">
                        Workouts
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        24
                      </p>

                      <p className="mt-1 text-xs text-cyan-400">
                        Training sessions
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                      <p className="text-xs text-zinc-500">
                        Total Volume
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        12.8K
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        kg × reps
                      </p>
                    </div>

                  </div>

                  {/* AI Recommendation */}
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                        AI
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          AI Workout Recommendation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          Based on your training goal and previous
                          sessions, focus on upper-body strength today.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Muscle distribution */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Muscle Distribution
                      </p>

                      <span className="text-xs text-zinc-500">
                        This week
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">

                      <div>
                        <div className="mb-2 flex justify-between text-xs">
                          <span>Chest</span>
                          <span className="text-zinc-500">
                            80%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-zinc-800">
                          <div className="h-2 w-[80%] rounded-full bg-cyan-500" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex justify-between text-xs">
                          <span>Back</span>
                          <span className="text-zinc-500">
                            70%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-zinc-800">
                          <div className="h-2 w-[70%] rounded-full bg-cyan-500" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex justify-between text-xs">
                          <span>Shoulders</span>
                          <span className="text-zinc-500">
                            60%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-zinc-800">
                          <div className="h-2 w-[60%] rounded-full bg-cyan-500" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="border-y border-zinc-800 bg-[#0D0D0F]">

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="max-w-2xl">

              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Everything in one place
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                A complete fitness management platform.
              </h2>

              <p className="mt-4 leading-7 text-zinc-500">
                From planning your workout to analyzing your
                performance, ApexFit keeps your training organized.
              </p>

            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <FeatureCard
                icon="AI"
                title="AI Workout Planning"
                description="Get exercise recommendations based on your training goal and preferences."
              />

              <FeatureCard
                icon="◈"
                title="Workout Tracking"
                description="Record sets, reps, weights and RIR while completing your sessions."
              />

              <FeatureCard
                icon="↗"
                title="Progress Analysis"
                description="Understand your training volume, muscle distribution and workout history."
              />

              <FeatureCard
                icon="◉"
                title="Body Metrics"
                description="Keep important fitness metrics such as BMI, BMR and TDEE in one place."
              />

            </div>

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From plan to progress.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
              Build your workout, train, record your performance
              and use your data to understand your progress.
            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <StepCard
              number="01"
              title="Build"
              description="Choose your goal and let ApexFit recommend exercises for your workout."
            />

            <StepCard
              number="02"
              title="Train"
              description="Start your session and track sets, reps, weights, RIR and workout duration."
            />

            <StepCard
              number="03"
              title="Analyze"
              description="Finish your workout and review your performance, volume and training history."
            />

          </div>

        </section>

        {/* ================= CTA ================= */}
        <section className="px-6 pb-24">

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-cyan-500/[0.04] px-7 py-16 text-center md:px-16">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Start your journey
            </p>

            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Your training.
              <br />
              <span className="text-cyan-400">
                Smarter with ApexFit AI.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-500">
              Build your first workout and start tracking your
              training performance today.
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-8 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
            >
              Get Started →
            </button>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-800 bg-[#0D0D0F]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-center md:flex-row md:items-center md:justify-between md:text-left">

          <div>
            <p className="font-bold">
              ApexFit
              <span className="text-cyan-400">-AI</span>
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Intelligent Fitness Management
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} ApexFit AI
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   FEATURE CARD
   ========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-6 transition hover:-translate-y-1 hover:border-cyan-500/30">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 font-bold text-cyan-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   STEP CARD
   ========================================================= */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-7">

      <span className="text-sm font-bold text-cyan-400">
        {number}
      </span>

      <h3 className="mt-5 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-zinc-500">
        {description}
      </p>

    </div>
  );
}