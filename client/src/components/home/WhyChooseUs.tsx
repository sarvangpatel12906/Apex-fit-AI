const reasons = [
  {
    number: "01",
    title: "Personalized, Not Generic",
    description:
      "Recommendations are based on each user's profile, fitness goal and activity level rather than a one-size-fits-all plan.",
  },
  {
    number: "02",
    title: "One Connected Platform",
    description:
      "BMI, BMR, TDEE, macro targets, workouts, nutrition and progress tracking are brought together in one application.",
  },
  {
    number: "03",
    title: "AI With a Reliable Fallback",
    description:
      "When the Gemini API is unavailable or rate-limited, a rule-based system uses curated reference data to keep recommendations available.",
  },
  {
    number: "04",
    title: "Built for Real Users",
    description:
      "The platform focuses on practical fitness guidance without requiring the cost of a personal trainer.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <p className="text-cyan-400 uppercase tracking-widest text-sm">
              WHY APEXFIT-AI
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              More than an AI fitness generator.
            </h2>

            <p className="text-zinc-400 mt-6 text-lg leading-8 max-w-xl">
              ApexFit-AI combines automated health calculations,
              personalized recommendations and reliable fallback
              logic into a single fitness application.
            </p>
          </div>

          <div className="space-y-4">

            {reasons.map((reason) => (
              <div
                key={reason.number}
                className="group rounded-2xl border border-zinc-800 bg-[#111111] p-6 hover:border-cyan-500/50 transition"
              >
                <div className="flex gap-5">

                  <span className="text-cyan-400 text-sm font-medium pt-1">
                    {reason.number}
                  </span>

                  <div>
                    <h3 className="text-xl font-semibold">
                      {reason.title}
                    </h3>

                    <p className="text-zinc-400 mt-2 leading-7">
                      {reason.description}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}