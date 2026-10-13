export default function AIShowcase() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl mb-16">
          <p className="text-cyan-400 uppercase tracking-widest text-sm">
            INTELLIGENT RECOMMENDATIONS
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Your numbers become your plan.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg leading-8">
            ApexFit-AI uses calculated fitness metrics as the foundation
            for personalized workout and nutrition recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* BMI */}

          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-7">
            <p className="text-zinc-500 text-sm">
              BODY MASS INDEX
            </p>

            <div className="mt-6 flex items-end justify-between">
              <h3 className="text-4xl font-bold">
                23.6
              </h3>

              <span className="text-sm text-green-400">
                Normal
              </span>
            </div>

            <div className="mt-6 h-2 rounded-full bg-zinc-800">
              <div className="h-2 w-[62%] rounded-full bg-cyan-400" />
            </div>

            <p className="text-zinc-400 text-sm mt-5 leading-6">
              Calculated automatically from the user's height and weight.
            </p>
          </div>

          {/* BMR */}

          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-7">
            <p className="text-zinc-500 text-sm">
              BASAL METABOLIC RATE
            </p>

            <h3 className="text-4xl font-bold mt-6">
              1,825
              <span className="text-lg text-zinc-500 ml-2">
                kcal/day
              </span>
            </h3>

            <p className="text-zinc-400 text-sm mt-6 leading-6">
              Estimated daily energy requirement at complete rest.
            </p>
          </div>

          {/* TDEE */}

          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-7">
            <p className="text-zinc-500 text-sm">
              TOTAL DAILY ENERGY EXPENDITURE
            </p>

            <h3 className="text-4xl font-bold mt-6">
              2,470
              <span className="text-lg text-zinc-500 ml-2">
                kcal/day
              </span>
            </h3>

            <p className="text-zinc-400 text-sm mt-6 leading-6">
              Estimated daily energy expenditure based on activity level.
            </p>
          </div>

        </div>

        {/* AI Recommendation */}

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-[#111111] p-8">

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div>

              <p className="text-violet-400 uppercase tracking-widest text-sm">
                AI RECOMMENDATION
              </p>

              <h3 className="text-3xl font-bold mt-4">
                From calculated metrics to personalized guidance.
              </h3>

              <p className="text-zinc-400 mt-5 leading-7">
                The calculated metrics are provided to the AI recommendation
                modules along with the user's goals and activity level.
                The system then generates personalized workout and diet plans.
              </p>

            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              <div className="rounded-2xl bg-zinc-900 p-6">
                <p className="text-zinc-500 text-sm">
                  WORKOUT
                </p>

                <h4 className="text-xl font-semibold mt-3">
                  Personalized Training
                </h4>

                <p className="text-zinc-400 text-sm mt-3 leading-6">
                  Recommendations based on fitness goals and profile data.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-900 p-6">
                <p className="text-zinc-500 text-sm">
                  NUTRITION
                </p>

                <h4 className="text-xl font-semibold mt-3">
                  Personalized Diet
                </h4>

                <p className="text-zinc-400 text-sm mt-3 leading-6">
                  Nutrition guidance using calorie and macro targets.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}