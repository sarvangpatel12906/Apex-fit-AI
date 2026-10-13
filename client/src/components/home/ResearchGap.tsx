const comparison = [
  {
    area: "Fitness calculations",
    existing: "Often requires separate tools or manual calculation",
    apex: "BMI, BMR, TDEE and macro targets calculated within the platform",
  },
  {
    area: "Workout planning",
    existing: "Generic or fixed workout recommendations",
    apex: "Personalized recommendations based on user profile and goals",
  },
  {
    area: "Nutrition planning",
    existing: "Limited personalization",
    apex: "AI-generated diet guidance using calorie and macro targets",
  },
  {
    area: "AI assistance",
    existing: "Limited conversational guidance",
    apex: "Conversational AI assistant for fitness-related queries",
  },
  {
    area: "AI reliability",
    existing: "Recommendation may depend entirely on an external AI service",
    apex: "Rule-based fallback when Gemini is unavailable or rate-limited",
  },
  {
    area: "Progress",
    existing: "Tracking may be separated from recommendations",
    apex: "Progress tracking integrated with the personalized platform",
  },
];

export default function ResearchGap() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl mb-14">
          <p className="text-cyan-400 uppercase tracking-widest text-sm">
            RESEARCH GAP
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
            From separate fitness tools to one intelligent platform.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg leading-8">
            Existing fitness solutions can provide individual services,
            but ApexFit-AI brings health calculations, personalized
            recommendations, conversational assistance and progress
            tracking together in one application.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-3xl overflow-hidden">

          <div className="hidden md:grid grid-cols-3 bg-[#141414] border-b border-zinc-800">
            <div className="p-6 text-sm uppercase tracking-wider text-zinc-500">
              Area
            </div>

            <div className="p-6 text-sm uppercase tracking-wider text-zinc-500">
              Existing Approach
            </div>

            <div className="p-6 text-sm uppercase tracking-wider text-cyan-400">
              ApexFit-AI
            </div>
          </div>

          {comparison.map((item, index) => (
            <div
              key={item.area}
              className={`grid md:grid-cols-3 ${
                index !== comparison.length - 1
                  ? "border-b border-zinc-800"
                  : ""
              }`}
            >

              <div className="p-6">
                <p className="text-white font-semibold">
                  {item.area}
                </p>
              </div>

              <div className="p-6">
                <p className="text-zinc-400 leading-7">
                  {item.existing}
                </p>
              </div>

              <div className="p-6 bg-cyan-500/[0.03]">
                <p className="text-zinc-300 leading-7">
                  {item.apex}
                </p>
              </div>

            </div>
          ))}

        </div>

        <div className="mt-8 rounded-3xl border border-violet-500/20 bg-violet-500/[0.04] p-8">

          <p className="text-violet-400 text-sm uppercase tracking-widest">
            KEY ENGINEERING CONTRIBUTION
          </p>

          <h3 className="text-2xl font-semibold mt-3">
            AI with a rule-based fallback
          </h3>

          <p className="text-zinc-400 mt-3 max-w-4xl leading-7">
            ApexFit-AI does not rely solely on Gemini availability.
            When the external AI service is unavailable or rate-limited,
            the system switches to curated reference data and
            rule-based recommendations to maintain service reliability.
          </p>

        </div>

      </div>
    </section>
  );
}