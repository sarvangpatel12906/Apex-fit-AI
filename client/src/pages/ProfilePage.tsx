import { useState } from "react";

export default function ProfilePage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");

  const calculateBMI = () => {
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (!heightValue || !weightValue) {
      return "--";
    }

    const heightInMeters = heightValue / 100;
    const bmi = weightValue / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      {/* Header */}

      <header className="border-b border-zinc-800 bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <a
            href="/dashboard"
            className="text-xl font-bold tracking-tight"
          >
            ApexFit
            <span className="text-cyan-400">-AI</span>
          </a>

          <a
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            ← Dashboard
          </a>

        </div>
      </header>

      {/* Main */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Heading */}

        <div className="max-w-3xl">

          <p className="text-cyan-400 text-sm uppercase tracking-widest">
            FITNESS PROFILE
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Tell us about yourself.
          </h1>

          <p className="text-zinc-400 mt-4 leading-7">
            Your profile information helps ApexFit-AI calculate your
            fitness metrics and prepare personalized recommendations.
          </p>

        </div>

        {/* Profile Form */}

        <div className="grid lg:grid-cols-3 gap-6 mt-10">

          <section className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-[#111111] p-7">

            <h2 className="text-2xl font-semibold">
              Personal information
            </h2>

            <p className="text-zinc-500 text-sm mt-2">
              Enter accurate information for better calculations.
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-7">

              {/* Age */}

              <div>

                <label
                  htmlFor="age"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Age
                </label>

                <input
                  id="age"
                  type="number"
                  min="1"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="e.g. 20"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                />

              </div>

              {/* Gender */}

              <div>

                <label
                  htmlFor="gender"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Gender
                </label>

                <select
                  id="gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              {/* Height */}

              <div>

                <label
                  htmlFor="height"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Height (cm)
                </label>

                <input
                  id="height"
                  type="number"
                  min="1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  placeholder="e.g. 175"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                />

              </div>

              {/* Weight */}

              <div>

                <label
                  htmlFor="weight"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Weight (kg)
                </label>

                <input
                  id="weight"
                  type="number"
                  min="1"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="e.g. 70"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                />

              </div>

              {/* Goal */}

              <div>

                <label
                  htmlFor="goal"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Fitness goal
                </label>

                <select
                  id="goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                >

                  <option value="">
                    Select your goal
                  </option>

                  <option value="fat-loss">
                    Fat Loss
                  </option>

                  <option value="muscle-gain">
                    Muscle Gain
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>

                  <option value="general-fitness">
                    General Fitness
                  </option>

                </select>

              </div>

              {/* Activity */}

              <div>

                <label
                  htmlFor="activity"
                  className="block text-sm text-zinc-300 mb-2"
                >
                  Activity level
                </label>

                <select
                  id="activity"
                  value={activity}
                  onChange={(event) => setActivity(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
                >

                  <option value="">
                    Select activity level
                  </option>

                  <option value="sedentary">
                    Sedentary
                  </option>

                  <option value="light">
                    Lightly Active
                  </option>

                  <option value="moderate">
                    Moderately Active
                  </option>

                  <option value="very-active">
                    Very Active
                  </option>

                  <option value="athlete">
                    Athlete
                  </option>

                </select>

              </div>

            </div>

            <button
              type="button"
              className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold hover:bg-cyan-400 transition"
            >
              Save Profile
            </button>

          </section>

          {/* Metrics Preview */}

          <aside className="rounded-3xl border border-zinc-800 bg-[#111111] p-7 h-fit">

            <p className="text-cyan-400 text-sm uppercase tracking-widest">
              LIVE PREVIEW
            </p>

            <h2 className="text-2xl font-semibold mt-3">
              Your BMI
            </h2>

            <div className="mt-8">

              <p className="text-5xl font-bold">
                {calculateBMI()}
              </p>

              <p className="text-zinc-500 text-sm mt-3">
                BMI will be calculated from your height and weight.
              </p>

            </div>

            <div className="border-t border-zinc-800 mt-8 pt-6 space-y-5">

              <div className="flex justify-between">
                <span className="text-zinc-500">
                  Age
                </span>

                <span>
                  {age || "--"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">
                  Goal
                </span>

                <span className="capitalize">
                  {goal
                    ? goal.replace("-", " ")
                    : "--"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">
                  Activity
                </span>

                <span className="capitalize">
                  {activity
                    ? activity.replace("-", " ")
                    : "--"}
                </span>
              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}