import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getProfile,
  saveProfile,
} from "../services/api";

type Profile = {
  age: number;
  weight: number;
  height: number;
  gender: string;
  goal: string;
  activity_level: string;
  bmi: number;
  bmr: number;
  tdee: number;
};

export default function BodyMetricsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "Male",
    goal: "General Fitness",
    activity_level: "Moderately Active",
  });

  const [metrics, setMetrics] = useState({
    bmi: 0,
    bmr: 0,
    tdee: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const calculateMetrics = (
    age: number,
    weight: number,
    height: number,
    gender: string,
    activityLevel: string
  ) => {
    if (!age || !weight || !height) {
      return {
        bmi: 0,
        bmr: 0,
        tdee: 0,
      };
    }

    const heightMeters = height / 100;

    const bmi = weight / (heightMeters * heightMeters);

    let bmr = 0;

    if (gender === "Male") {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age +
        5;
    } else {
      bmr =
        10 * weight +
        6.25 * height -
        5 * age -
        161;
    }

    const activityMultipliers: Record<
      string,
      number
    > = {
      Sedentary: 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
      "Extremely Active": 1.9,
    };

    const multiplier =
      activityMultipliers[activityLevel] || 1.55;

    const tdee = bmr * multiplier;

    return {
      bmi: Number(bmi.toFixed(2)),
      bmr: Number(bmr.toFixed(2)),
      tdee: Number(tdee.toFixed(2)),
    };
  };

  const calculateNutrition = () => {
    let calories = metrics.tdee;

    switch (form.goal) {
      case "Fat Loss":
        calories = metrics.tdee - 500;
        break;

      case "Muscle Building":
        calories = metrics.tdee + 300;
        break;

      case "Body Recomposition":
        calories = metrics.tdee;
        break;

      case "Athletic Performance":
        calories = metrics.tdee + 400;
        break;

      default:
        calories = metrics.tdee;
    }

    const weight = Number(form.weight) || 0;

    const protein =
      form.goal === "Muscle Building"
        ? weight * 2
        : weight * 1.8;

    const fat =
      weight * 0.9;

    const carbs =
      (calories - protein * 4 - fat * 9) / 4;

    const water =
      weight * 0.035;

    const fiber =
      (calories / 1000) * 14;

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(Math.max(carbs, 0)),
      fat: Math.round(fat),
      water: water.toFixed(1),
      fiber: Math.round(fiber),
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        const profile: Profile | undefined =
          data.profile || data;

        if (profile && profile.age) {
          setForm({
            age: String(profile.age),
            weight: String(profile.weight),
            height: String(profile.height),
            gender: profile.gender,
            goal: profile.goal,
            activity_level:
              profile.activity_level,
          });

          setMetrics({
            bmi: profile.bmi || 0,
            bmr: profile.bmr || 0,
            tdee: profile.tdee || 0,
          });
        }
      } catch (err) {
        console.error(
          "Unable to load profile:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    const newMetrics = calculateMetrics(
      age,
      weight,
      height,
      form.gender,
      form.activity_level
    );

    setMetrics(newMetrics);
  }, [
    form.age,
    form.weight,
    form.height,
    form.gender,
    form.activity_level,
  ]);

  const nutrition =
    calculateNutrition();

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.age ||
      !form.weight ||
      !form.height
    ) {
      setError(
        "Please complete all body measurements."
      );
      return;
    }

    try {
      setSaving(true);

      const data = await saveProfile({
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        gender: form.gender,
        goal: form.goal,
        activity_level:
          form.activity_level,
      });

      const updatedProfile =
        data.profile || data;

      if (updatedProfile) {
        setMetrics({
          bmi:
            updatedProfile.bmi ||
            metrics.bmi,
          bmr:
            updatedProfile.bmr ||
            metrics.bmr,
          tdee:
            updatedProfile.tdee ||
            metrics.tdee,
        });
      }

      setMessage(
        "Body metrics updated successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (err: any) {
      console.error(
        "Unable to save profile:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Unable to update your body metrics."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBMICategory = () => {
    if (!metrics.bmi) return "—";

    if (metrics.bmi < 18.5)
      return "Underweight";

    if (metrics.bmi < 25)
      return "Healthy";

    if (metrics.bmi < 30)
      return "Overweight";

    return "Obesity Range";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        Loading your body metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      {/* HEADER */}

      <header className="border-b border-zinc-800 bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <Link
            to="/dashboard"
            className="font-bold text-xl"
          >
            ApexFit
            <span className="text-cyan-400">
              -AI
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-zinc-400 hover:text-cyan-400 transition"
          >
            ← Dashboard
          </Link>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-10">

          <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-2">
            Your Body Intelligence
          </p>

          <h1 className="text-4xl font-bold">
            Body Metrics
          </h1>

          <p className="text-zinc-400 mt-3">
            Update your measurements and ApexFit AI
            automatically recalculates your fitness data.
          </p>

        </div>

        {/* METRIC CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <MetricCard
            label="BMI"
            value={
              metrics.bmi
                ? metrics.bmi.toFixed(1)
                : "—"
            }
            description={getBMICategory()}
          />

          <MetricCard
            label="BMR"
            value={
              metrics.bmr
                ? `${Math.round(metrics.bmr)}`
                : "—"
            }
            description="Calories at complete rest"
          />

          <MetricCard
            label="TDEE"
            value={
              metrics.tdee
                ? `${Math.round(metrics.tdee)}`
                : "—"
            }
            description="Estimated daily calorie burn"
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* BODY FORM */}

          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8">

            <h2 className="text-xl font-semibold mb-6">
              Body Information
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                />

                <SelectField
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={[
                    "Male",
                    "Female",
                  ]}
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={form.weight}
                  onChange={handleChange}
                />

                <InputField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={form.height}
                  onChange={handleChange}
                />

              </div>

              <SelectField
                label="Primary Goal"
                name="goal"
                value={form.goal}
                onChange={handleChange}
                options={[
                  "Fat Loss",
                  "Muscle Building",
                  "Body Recomposition",
                  "Athletic Performance",
                  "General Fitness",
                ]}
              />

              <SelectField
                label="Activity Level"
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                options={[
                  "Sedentary",
                  "Lightly Active",
                  "Moderately Active",
                  "Very Active",
                  "Extremely Active",
                ]}
              />

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 py-4 font-semibold hover:bg-cyan-400 transition disabled:opacity-60"
              >
                {saving
                  ? "Updating..."
                  : "Update Body Metrics"}
              </button>

            </form>

          </div>

          {/* NUTRITION TARGETS */}

          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h2 className="text-xl font-semibold">
                  Daily Targets
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  Estimated from your current metrics
                </p>
              </div>

              <span className="text-cyan-400 text-sm">
                LIVE
              </span>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <TargetCard
                label="Calories"
                value={nutrition.calories}
                unit="kcal"
              />

              <TargetCard
                label="Protein"
                value={nutrition.protein}
                unit="g"
              />

              <TargetCard
                label="Carbs"
                value={nutrition.carbs}
                unit="g"
              />

              <TargetCard
                label="Fat"
                value={nutrition.fat}
                unit="g"
              />

              <TargetCard
                label="Fiber"
                value={nutrition.fiber}
                unit="g"
              />

              <TargetCard
                label="Water"
                value={nutrition.water}
                unit="L"
              />

            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">

              <p className="text-sm text-zinc-500 leading-relaxed">
                These targets are estimates based on your
                age, body measurements, activity level,
                and primary fitness goal. Your ApexFit AI
                plans can further personalize them.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================
   SMALL COMPONENTS
   ========================================= */

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-6">

      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

      <p className="text-sm text-cyan-400 mt-2">
        {description}
      </p>

    </div>
  );
}


function TargetCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">

      <p className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="text-2xl font-bold mt-2">

        {value}

        <span className="text-sm text-zinc-500 ml-1">
          {unit}
        </span>

      </p>

    </div>
  );
}


function InputField({
  label,
  name,
  type,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <div>

      <label className="block text-sm text-zinc-400 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        min="1"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
      />

    </div>
  );
}


function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="block text-sm text-zinc-400 mb-2">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400 transition"
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}