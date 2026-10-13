export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-4 gap-10">

          <div>
            <h2 className="text-2xl font-bold">
              ApexFit<span className="text-cyan-400">-AI</span>
            </h2>

            <p className="mt-4 text-zinc-400 leading-7">
              AI-powered fitness platform that combines workout planning,
              nutrition guidance, health analytics and progress tracking
              into one intelligent ecosystem.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Navigation
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li>Home</li>
              <li>Features</li>
              <li>Research Gap</li>
              <li>Future Scope</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Technologies
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li>React</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Django REST</li>
              <li>Gemini AI</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Contact
            </h3>

            <p className="text-zinc-400">
              apexfit.ai@gmail.com
            </p>

            <p className="text-zinc-400 mt-2">
              SAL Institute of Diploma Studies
            </p>

            <p className="text-zinc-400">
              Ahmedabad, Gujarat
            </p>
          </div>

        </div>

        <div className="border-t border-zinc-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">

          <p className="text-zinc-500 text-sm">
            © 2026 ApexFit-AI. All Rights Reserved.
          </p>

          <p className="text-zinc-500 text-sm mt-3 md:mt-0">
            Made by Team ApexFit-AI ❤️
          </p>

        </div>

      </div>
    </footer>
  );
}