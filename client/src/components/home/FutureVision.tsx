const futureFeatures = [
  {
    number: "01",
    title: "Mobile Applications",
    description:
      "Extend the ApexFit-AI experience to Android and iOS for easier access to personalized fitness recommendations.",
  },
  {
    number: "02",
    title: "Wearable Integration",
    description:
      "Future integration with compatible wearable devices could allow users to connect fitness and activity data with the platform.",
  },
  {
    number: "03",
    title: "Smart Gym Integration",
    description:
      "Connect compatible gym equipment with ApexFit-AI to create a more connected training environment.",
  },
  {
    number: "04",
    title: "IoT Fitness Ecosystem",
    description:
      "Future IoT integration could connect multiple fitness devices and services within a unified ecosystem.",
  },
];

export default function FutureVision() {
  return (
    <section className="bg-[#09090B] py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl mb-16">
          <p className="text-violet-400 uppercase tracking-widest text-sm">
            FUTURE SCOPE
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
            The platform can grow beyond the web.
          </h2>

          <p className="text-zinc-400 mt-5 text-lg leading-8">
            The current project focuses on the web-based fitness
            recommendation system. Future development can extend
            ApexFit-AI into a broader connected fitness ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {futureFeatures.map((feature) => (
            <div
              key={feature.number}
              className="rounded-3xl border border-zinc-800 bg-[#111111] p-8 hover:border-violet-500/50 transition"
            >
              <div className="flex items-start gap-5">

                <span className="text-violet-400 text-sm font-semibold">
                  {feature.number}
                </span>

                <div>
                  <h3 className="text-2xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="text-zinc-400 mt-4 leading-7">
                    {feature.description}
                  </p>
                </div>

              </div>
            </div>
          ))}

        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-[#111111] p-8">

          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            FUTURE ROADMAP
          </p>

          <div className="mt-8 grid sm:grid-cols-4 gap-4">

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-cyan-400 text-sm">
                CURRENT
              </p>

              <h3 className="font-semibold mt-2">
                Web Platform
              </h3>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-cyan-400 text-sm">
                NEXT
              </p>

              <h3 className="font-semibold mt-2">
                Mobile Apps
              </h3>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-cyan-400 text-sm">
                FUTURE
              </p>

              <h3 className="font-semibold mt-2">
                Wearables
              </h3>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-cyan-400 text-sm">
                LONG TERM
              </p>

              <h3 className="font-semibold mt-2">
                Smart Gym & IoT
              </h3>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}