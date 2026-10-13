const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Enter your age, gender, height, weight, fitness goal and activity level to create your personalized fitness profile.",
  },
  {
    number: "02",
    title: "Get Your Fitness Metrics",
    description:
      "ApexFit-AI automatically calculates BMI, BMR, TDEE and macronutrient targets from your profile.",
  },
  {
    number: "03",
    title: "Generate Your Plan",
    description:
      "Your calculated metrics are used by the AI modules to generate personalized workout and diet recommendations.",
  },
  {
    number: "04",
    title: "Track Your Progress",
    description:
      "Record your progress, review your recommendations and use the AI assistant for fitness-related questions.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl mb-16">
          <p className="text-cyan-400 uppercase tracking-widest text-sm">
            HOW IT WORKS
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            From your profile to a personalized plan.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg leading-8">
            ApexFit-AI turns basic user information into meaningful
            fitness metrics and personalized recommendations.
          </p>
        </div>

        <div className="relative">

          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-px bg-zinc-800" />

          <div className="space-y-8">

            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex gap-8 items-start"
              >

                <div className="relative z-10 shrink-0 w-16 h-16 rounded-2xl border border-cyan-500/30 bg-[#111111] flex items-center justify-center">
                  <span className="text-cyan-400 font-semibold">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1 rounded-3xl border border-zinc-800 bg-[#111111] p-7 hover:border-zinc-700 transition">
                  <h3 className="text-2xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="text-zinc-400 mt-3 leading-7 max-w-3xl">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}