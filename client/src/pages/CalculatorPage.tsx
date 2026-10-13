import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Flame,
  Footprints,
  HeartPulse,
  Scale,
  Target,
  UserRound,
  Weight,
  Zap,
} from "lucide-react";

type Gender = "male" | "female";

type Goal =
  | "maintain"
  | "cut"
  | "bulk"
  | "recomp";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "high"
  | "very_high";

type CalculatorResults = {
  bmi: number;
  bmr: number;
  tdee: number;
  healthyMin: number;
  healthyMax: number;
  targetWeight: number;
  maintainCalories: number;
  cutCaloriesLow: number;
  cutCaloriesHigh: number;
  bulkCaloriesLow: number;
  bulkCaloriesHigh: number;
  recompCaloriesLow: number;
  recompCaloriesHigh: number;
  steps: number;
  bodyAge: number;
};

const ACTIVITY_MULTIPLIERS: Record<
  ActivityLevel,
  number
> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

function calculateBMI(
  weight: number,
  height: number,
) {
  const heightMeters = height / 100;

  if (
    weight <= 0 ||
    heightMeters <= 0
  ) {
    return 0;
  }

  return weight /
    (heightMeters * heightMeters);
}

function calculateBMR(
  age: number,
  weight: number,
  height: number,
  gender: Gender,
) {
  if (
    age <= 0 ||
    weight <= 0 ||
    height <= 0
  ) {
    return 0;
  }

  if (gender === "male") {
    return (
      10 * weight +
      6.25 * height -
      5 * age +
      5
    );
  }

  return (
    10 * weight +
    6.25 * height -
    5 * age -
    161
  );
}

function calculateHealthyWeightRange(
  height: number,
) {
  const heightMeters = height / 100;

  if (heightMeters <= 0) {
    return {
      min: 0,
      max: 0,
      target: 0,
    };
  }

  const min =
    18.5 *
    heightMeters *
    heightMeters;

  const max =
    24.9 *
    heightMeters *
    heightMeters;

  return {
    min,
    max,
    target: (min + max) / 2,
  };
}

function calculateBodyAge(
  age: number,
  bmi: number,
  activity: ActivityLevel,
) {
  let adjustment = 0;

  if (bmi >= 18.5 && bmi <= 24.9) {
    adjustment -= 1;
  } else if (
    bmi >= 25 &&
    bmi < 30
  ) {
    adjustment += 2;
  } else if (bmi >= 30) {
    adjustment += 4;
  } else if (
    bmi > 0 &&
    bmi < 18.5
  ) {
    adjustment += 2;
  }

  if (
    activity === "moderate"
  ) {
    adjustment -= 1;
  }

  if (
    activity === "high" ||
    activity === "very_high"
  ) {
    adjustment -= 2;
  }

  return Math.max(
    18,
    Math.round(age + adjustment),
  );
}

function calculateSteps(
  activity: ActivityLevel,
  goal: Goal,
) {
  if (
    goal === "cut"
  ) {
    return activity === "sedentary"
      ? 9000
      : 10000;
  }

  if (
    goal === "recomp"
  ) {
    return 9000;
  }

  if (
    goal === "bulk"
  ) {
    return 8000;
  }

  if (
    activity === "sedentary"
  ) {
    return 7000;
  }

  return 8000;
}

export default function CalculatorPage() {
  const navigate = useNavigate();

  const [age, setAge] =
    useState("25");

  const [gender, setGender] =
    useState<Gender>("male");

  const [height, setHeight] =
    useState("170");

  const [weight, setWeight] =
    useState("70");

  const [activity, setActivity] =
    useState<ActivityLevel>(
      "moderate",
    );

  const [goal, setGoal] =
    useState<Goal>("maintain");

  const results =
    useMemo<CalculatorResults | null>(
      () => {
        const ageValue =
          Number(age);

        const heightValue =
          Number(height);

        const weightValue =
          Number(weight);

        if (
          !ageValue ||
          !heightValue ||
          !weightValue
        ) {
          return null;
        }

        const bmi =
          calculateBMI(
            weightValue,
            heightValue,
          );

        const bmr =
          calculateBMR(
            ageValue,
            weightValue,
            heightValue,
            gender,
          );

        const tdee =
          bmr *
          ACTIVITY_MULTIPLIERS[
            activity
          ];

        const healthy =
          calculateHealthyWeightRange(
            heightValue,
          );

        return {
          bmi,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          healthyMin:
            Math.round(
              healthy.min,
            ),
          healthyMax:
            Math.round(
              healthy.max,
            ),
          targetWeight:
            Math.round(
              healthy.target,
            ),
          maintainCalories:
            Math.round(tdee),
          cutCaloriesLow:
            Math.round(
              tdee * 0.8,
            ),
          cutCaloriesHigh:
            Math.round(
              tdee * 0.9,
            ),
          bulkCaloriesLow:
            Math.round(
              tdee * 1.05,
            ),
          bulkCaloriesHigh:
            Math.round(
              tdee * 1.15,
            ),
          recompCaloriesLow:
            Math.round(
              tdee * 0.95,
            ),
          recompCaloriesHigh:
            Math.round(tdee),
          steps: calculateSteps(
            activity,
            goal,
          ),
          bodyAge:
            calculateBodyAge(
              ageValue,
              bmi,
              activity,
            ),
        };
      },
      [
        age,
        gender,
        height,
        weight,
        activity,
        goal,
      ],
    );

  const calorieValue =
    goal === "cut"
      ? results?.cutCaloriesHigh
      : goal === "bulk"
        ? results?.bulkCaloriesLow
        : goal === "recomp"
          ? results?.recompCaloriesHigh
          : results?.maintainCalories;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
              <Calculator className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                Fitness Calculator
              </h1>

              <p className="text-sm text-zinc-500">
                Your complete ApexFit body and calorie analysis.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="h-fit rounded-3xl border border-zinc-800 bg-[#111111] p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black">
              <UserRound className="h-5 w-5 text-green-400" />
              Your Information
            </h2>

            <div className="space-y-4">
              <Input
                label="Age"
                value={age}
                onChange={setAge}
                type="number"
                suffix="years"
              />

              <Select
                label="Gender"
                value={gender}
                onChange={(value) =>
                  setGender(
                    value as Gender,
                  )
                }
                options={[
                  ["male", "Male"],
                  [
                    "female",
                    "Female",
                  ],
                ]}
              />

              <Input
                label="Height"
                value={height}
                onChange={setHeight}
                type="number"
                suffix="cm"
              />

              <Input
                label="Weight"
                value={weight}
                onChange={setWeight}
                type="number"
                suffix="kg"
              />

              <Select
                label="Activity Level"
                value={activity}
                onChange={(value) =>
                  setActivity(
                    value as ActivityLevel,
                  )
                }
                options={[
                  [
                    "sedentary",
                    "Sedentary",
                  ],
                  [
                    "light",
                    "Lightly Active",
                  ],
                  [
                    "moderate",
                    "Moderately Active",
                  ],
                  [
                    "high",
                    "Very Active",
                  ],
                  [
                    "very_high",
                    "Extremely Active",
                  ],
                ]}
              />

              <Select
                label="Primary Goal"
                value={goal}
                onChange={(value) =>
                  setGoal(
                    value as Goal,
                  )
                }
                options={[
                  [
                    "maintain",
                    "Maintain",
                  ],
                  ["cut", "Cut"],
                  ["bulk", "Bulk"],
                  [
                    "recomp",
                    "Body Recomposition",
                  ],
                ]}
              />
            </div>
          </section>

          {results && (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={
                    <Scale className="h-5 w-5" />
                  }
                  label="BMI"
                  value={results.bmi.toFixed(
                    1,
                  )}
                  helper="Body Mass Index"
                />

                <MetricCard
                  icon={
                    <Flame className="h-5 w-5" />
                  }
                  label="BMR"
                  value={`${results.bmr}`}
                  helper="kcal / day"
                />

                <MetricCard
                  icon={
                    <Zap className="h-5 w-5" />
                  }
                  label="TDEE"
                  value={`${results.tdee}`}
                  helper="Estimated daily burn"
                />

                <MetricCard
                  icon={
                    <HeartPulse className="h-5 w-5" />
                  }
                  label="Body Age"
                  value={`${results.bodyAge}`}
                  helper={`Actual age: ${age}`}
                />
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Weight className="h-5 w-5 text-green-400" />

                  <div>
                    <h2 className="font-black">
                      Healthy Weight Range
                    </h2>

                    <p className="text-xs text-zinc-600">
                      Based on BMI 18.5–24.9
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoBox
                    label="Lower Range"
                    value={`${results.healthyMin} kg`}
                  />

                  <InfoBox
                    label="Suggested Target"
                    value={`${results.targetWeight} kg`}
                    highlight
                  />

                  <InfoBox
                    label="Upper Range"
                    value={`${results.healthyMax} kg`}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-400" />

                  <div>
                    <h2 className="font-black">
                      Calorie Targets
                    </h2>

                    <p className="text-xs text-zinc-600">
                      Based on your estimated TDEE
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CalorieBox
                    title="Maintain"
                    calories={
                      results.maintainCalories
                    }
                    description="Approximate calories to maintain current weight."
                  />

                  <CalorieBox
                    title="Cut"
                    calories={`${results.cutCaloriesLow}–${results.cutCaloriesHigh}`}
                    description="Approximately 10–20% below TDEE."
                  />

                  <CalorieBox
                    title="Bulk"
                    calories={`${results.bulkCaloriesLow}–${results.bulkCaloriesHigh}`}
                    description="Approximately 5–15% above TDEE."
                  />

                  <CalorieBox
                    title="Recomposition"
                    calories={`${results.recompCaloriesLow}–${results.recompCaloriesHigh}`}
                    description="Near maintenance with a small deficit when appropriate."
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-green-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-400">
                    Your selected goal
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {calorieValue} kcal/day
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                    <Footprints className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Daily Movement
                    </p>

                    <p className="text-3xl font-black">
                      {results.steps.toLocaleString()}
                    </p>

                    <p className="text-sm text-zinc-500">
                      recommended steps per day
                    </p>
                  </div>
                </div>
              </section>

              <p className="text-xs leading-5 text-zinc-700">
                ApexFit estimates are intended for fitness planning,
                not medical diagnosis. BMI-based weight ranges and
                calorie targets are general estimates and should be
                adjusted based on real-world progress.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-16 text-white outline-none focus:border-green-500"
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-green-500"
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {helper}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? "bg-green-500/10"
          : "bg-zinc-950"
      }`}
    >
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-black ${
          highlight
            ? "text-green-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CalorieBox({
  title,
  calories,
  description,
}: {
  title: string;
  calories: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-950 p-5">
      <p className="font-black">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-green-400">
        {calories}
        <span className="ml-1 text-xs text-zinc-600">
          kcal
        </span>
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-600">
        {description}
      </p>
    </div>
  );
}