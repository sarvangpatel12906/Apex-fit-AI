const features = [
  {
    number: "01",
    title: "Personalized Health Metrics",
    description:
      "Automatically calculate BMI, BMR, TDEE and personalized macronutrient targets from your profile data.",
  },
  {
    number: "02",
    title: "AI Workout Plans",
    description:
      "Generate workout recommendations based on your fitness goal, activity level and personal profile.",
  },
  {
    number: "03",
    title: "AI Diet Plans",
    description:
      "Receive personalized nutrition recommendations with calorie and macronutrient targets.",
  },
  {
    number: "04",
    title: "AI Fitness Assistant",
    description:
      "Ask fitness and nutrition questions through a conversational AI assistant.",
  },
  {
    number: "05",
    title: "Progress Tracking",
    description:
      "Record your fitness progress and review changes in your body metrics over time.",
  },
  {
    number: "06",
    title: "Reliable Recommendations",
    description:
      "A rule-based fallback system provides curated recommendations when the Gemini API is unavailable or rate-limited.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl mb-16">
          <p className="text-cyan-400 uppercase tracking-widest text-sm">
            PLATFORM FEATURES
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Built around your fitness goals.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg leading-8">
            From health calculations to AI-generated recommendations,
            ApexFit-AI brings the core parts of your fitness journey
            together in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-3xl overflow-hidden">

          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-[#111111] p-8 min-h-[250px] hover:bg-[#151515] transition"
            >
              <p className="text-cyan-400 text-sm font-medium">
                {feature.number}
              </p>

              <h3 className="text-xl font-semibold mt-8">
                {feature.title}
              </h3>

              <p className="text-zinc-400 mt-4 leading-7">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}