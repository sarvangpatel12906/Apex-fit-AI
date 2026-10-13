export default function Hero() {
  return (
    <section className="bg-[#09090B] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              AI-Powered Fitness & Nutrition Platform
            </span>

            <h1 className="mt-8 text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Fitness isn't
              <span className="text-cyan-400"> one-size-fits-all.</span>

              <br />

              Your plan
              <span className="text-violet-400"> shouldn't be either.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg text-zinc-400 leading-8">
              ApexFit-AI uses your profile, fitness goals and activity level
              to calculate personalized fitness metrics and generate
              AI-powered workout and nutrition recommendations.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-xl bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-400 transition">
                Get Started
              </button>

              <button className="rounded-xl border border-zinc-700 px-6 py-3 hover:bg-zinc-900 transition">
                Explore Platform
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111111] p-6 shadow-2xl">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-sm">
                    Fitness Overview
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold">
                    Your Personal Plan
                  </h3>
                </div>

                <div className="rounded-xl bg-cyan-500/10 px-3 py-2 text-cyan-400 text-sm">
                  AI
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-zinc-900 p-5">
                  <p className="text-zinc-500 text-sm">
                    BMI
                  </p>

                  <h4 className="mt-2 text-2xl font-bold">
                    23.6
                  </h4>
                </div>

                <div className="rounded-2xl bg-zinc-900 p-5">
                  <p className="text-zinc-500 text-sm">
                    BMR
                  </p>

                  <h4 className="mt-2 text-2xl font-bold">
                    1825 kcal
                  </h4>
                </div>

                <div className="rounded-2xl bg-zinc-900 p-5">
                  <p className="text-zinc-500 text-sm">
                    TDEE
                  </p>

                  <h4 className="mt-2 text-2xl font-bold">
                    2470 kcal
                  </h4>
                </div>

                <div className="rounded-2xl bg-zinc-900 p-5">
                  <p className="text-zinc-500 text-sm">
                    Goal
                  </p>

                  <h4 className="mt-2 text-2xl font-bold">
                    Fat Loss
                  </h4>
                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-zinc-500 text-sm">
                  Today's AI Recommendation
                </p>

                <p className="mt-2 font-medium">
                  Chest & Triceps workout with a balanced nutrition target.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}