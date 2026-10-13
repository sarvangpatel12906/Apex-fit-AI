import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { saveProfile } from "../services/api";

/* =========================================================
   APEXFIT AI — INTELLIGENT ONBOARDING
   ========================================================= */

type Gender = "Male" | "Female";

type DietStyle =
  | "Vegetarian"
  | "Vegan"
  | "Non-vegetarian"
  | "Eggetarian"
  | "Pescatarian"
  | "Custom";

type UserProfile = {
  age: number;
  weight: number;
  height: number;
  gender: Gender;

  goal: string;

  trainingExperience: string;
  trainingDays: number;
  workoutDuration: number;
  equipment: string[];
  sport: string;

  averageSleep: number;
  sleepQuality: string;
  stress: string;
  energy: string;
  soreness: string;
  recovery: string;
  injuries: string;

  dietStyle: DietStyle;
  mealsPerDay: number;

  allergies: string;
  foodsToAvoid: string;
  cuisine: string;

  bmi: number;
  bmr: number;
  tdee: number;

  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  water: number;

  createdAt: string;
  updatedAt: string;
};

const PROFILE_KEY = "apexfit_user_profile";

/*
  This is your Node / Gemini AI server.
*/
const API_BASE = "http://localhost:5002";

/* =========================================================
   GOALS
   ========================================================= */

const goals = [
  {
    value: "Fat Loss",
    icon: "🔥",
    description:
      "Lose body fat while maintaining muscle.",
  },
  {
    value: "Muscle Building",
    icon: "💪",
    description:
      "Build muscle and increase strength.",
  },
  {
    value: "Body Recomposition",
    icon: "⚡",
    description:
      "Lose fat while building or preserving muscle.",
  },
  {
    value: "Athletic Performance",
    icon: "🏃",
    description:
      "Improve strength, speed and performance.",
  },
  {
    value: "General Fitness",
    icon: "🎯",
    description:
      "Improve overall fitness and health.",
  },
];

/* =========================================================
   EQUIPMENT
   ========================================================= */

const equipmentOptions = [
  "Dumbbells",
  "Barbell",
  "Cable Machine",
  "Machines",
  "Resistance Bands",
  "Pull-up Bar",
  "Cardio Machines",
  "Bodyweight Only",
];

/* =========================================================
   DIET STYLES
   ========================================================= */

const dietStyles: DietStyle[] = [
  "Vegetarian",
  "Vegan",
  "Non-vegetarian",
  "Eggetarian",
  "Pescatarian",
  "Custom",
];

/* =========================================================
   ACTIVITY MULTIPLIER
   ========================================================= */

function getActivityMultiplier(
  trainingDays: number,
  sport: string,
) {
  const hasSport =
    sport.trim() !== "" &&
    sport.toLowerCase() !== "none";

  if (trainingDays <= 1) {
    return 1.2;
  }

  if (trainingDays <= 3) {
    return hasSport
      ? 1.45
      : 1.375;
  }

  if (trainingDays <= 5) {
    return hasSport
      ? 1.6
      : 1.55;
  }

  return hasSport
    ? 1.9
    : 1.725;
}

/* =========================================================
   DJANGO ACTIVITY LEVEL
   ========================================================= */

function getActivityLevel(
  trainingDays: number,
) {
  if (trainingDays <= 1) {
    return "Sedentary";
  }

  if (trainingDays <= 3) {
    return "Lightly Active";
  }

  if (trainingDays <= 5) {
    return "Moderately Active";
  }

  if (trainingDays === 6) {
    return "Very Active";
  }

  return "Extremely Active";
}

/* =========================================================
   CALCULATE METRICS
   ========================================================= */

function calculateMetrics({
  age,
  weight,
  height,
  gender,
  trainingDays,
  sport,
  goal,
}: {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  trainingDays: number;
  sport: string;
  goal: string;
}) {
  /* BMI */

  const heightInMeters =
    height / 100;

  const bmi =
    weight /
    (
      heightInMeters *
      heightInMeters
    );

  /* BMR */

  let bmr =
    10 * weight +
    6.25 * height -
    5 * age;

  if (gender === "Male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  /* TDEE */

  const activityMultiplier =
    getActivityMultiplier(
      trainingDays,
      sport,
    );

  const tdee =
    bmr *
    activityMultiplier;

  /* GOAL CALORIES */

  let calories = tdee;

  if (goal === "Fat Loss") {
    calories = tdee * 0.8;
  }

  if (goal === "Muscle Building") {
    calories = tdee * 1.1;
  }

  if (goal === "Body Recomposition") {
    calories = tdee * 0.95;
  }

  if (goal === "Athletic Performance") {
    calories = tdee * 1.08;
  }

  /* PROTEIN */

  let proteinMultiplier = 1.6;

  if (goal === "Fat Loss") {
    proteinMultiplier = 2;
  }

  if (goal === "Muscle Building") {
    proteinMultiplier = 1.8;
  }

  if (goal === "Body Recomposition") {
    proteinMultiplier = 2;
  }

  if (goal === "Athletic Performance") {
    proteinMultiplier = 1.7;
  }

  const protein =
    weight *
    proteinMultiplier;

  /* FAT */

  const fats =
    (calories * 0.25) / 9;

  /* CARBOHYDRATES */

  const proteinCalories =
    protein * 4;

  const fatCalories =
    fats * 9;

  const carbohydrateCalories =
    calories -
    proteinCalories -
    fatCalories;

  const carbohydrates =
    carbohydrateCalories / 4;

  /* FIBER */

  const fiber =
    (calories / 1000) * 14;

  /* WATER */

  const water =
    (weight * 35) / 1000;

  return {
    bmi: Number(
      bmi.toFixed(1),
    ),

    bmr: Math.round(bmr),

    tdee: Math.round(tdee),

    calories: Math.round(calories),

    protein: Math.round(protein),

    carbohydrates: Math.round(
      Math.max(
        carbohydrates,
        0,
      ),
    ),

    fats: Math.round(fats),

    fiber: Math.round(fiber),

    water: Number(
      water.toFixed(1),
    ),
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] =
    useState(1);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ================= BODY ================= */

  const [age, setAge] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [gender, setGender] =
    useState<Gender>("Male");

  /* ================= TRAINING ================= */

  const [goal, setGoal] =
    useState("");

  const [
    trainingExperience,
    setTrainingExperience,
  ] = useState("Beginner");

  const [
    trainingDays,
    setTrainingDays,
  ] = useState("4");

  const [
    workoutDuration,
    setWorkoutDuration,
  ] = useState("60");

  const [equipment, setEquipment] =
    useState<string[]>([
      "Dumbbells",
    ]);

  const [sport, setSport] =
    useState("");

  /* ================= RECOVERY ================= */

  const [
    averageSleep,
    setAverageSleep,
  ] = useState("7");

  const [
    sleepQuality,
    setSleepQuality,
  ] = useState("Good");

  const [stress, setStress] =
    useState("Moderate");

  const [energy, setEnergy] =
    useState("Good");

  const [soreness, setSoreness] =
    useState("Low");

  const [recovery, setRecovery] =
    useState("Good");

  const [injuries, setInjuries] =
    useState("");

  /* ================= NUTRITION ================= */

  const [
    dietStyle,
    setDietStyle,
  ] =
    useState<DietStyle>(
      "Vegetarian",
    );

  const [
    mealsPerDay,
    setMealsPerDay,
  ] = useState("4");

  const [allergies, setAllergies] =
    useState("");

  const [
    foodsToAvoid,
    setFoodsToAvoid,
  ] = useState("");

  const [cuisine, setCuisine] =
    useState("Indian");

  /* =======================================================
     EQUIPMENT TOGGLE
     ======================================================= */

  const toggleEquipment = (
    item: string,
  ) => {
    setEquipment((current) =>
      current.includes(item)
        ? current.filter(
            (equipmentItem) =>
              equipmentItem !== item,
          )
        : [
            ...current,
            item,
          ],
    );
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (
        !age ||
        !weight ||
        !height
      ) {
        setError(
          "Please enter your age, weight and height.",
        );

        return false;
      }

      const ageValue =
        Number(age);

      const weightValue =
        Number(weight);

      const heightValue =
        Number(height);

      if (
        ageValue < 13 ||
        ageValue > 100
      ) {
        setError(
          "Please enter a valid age between 13 and 100.",
        );

        return false;
      }

      if (
        weightValue < 20 ||
        weightValue > 400
      ) {
        setError(
          "Please enter a valid weight.",
        );

        return false;
      }

      if (
        heightValue < 100 ||
        heightValue > 250
      ) {
        setError(
          "Please enter a valid height.",
        );

        return false;
      }
    }

    if (step === 2) {
      if (!goal) {
        setError(
          "Please select your primary fitness goal.",
        );

        return false;
      }

      if (
        equipment.length === 0
      ) {
        setError(
          "Please select at least one available equipment option.",
        );

        return false;
      }
    }

    if (step === 3) {
      if (!averageSleep) {
        setError(
          "Please enter your average sleep.",
        );

        return false;
      }
    }

    if (step === 4) {
      if (!dietStyle) {
        setError(
          "Please select your diet style.",
        );

        return false;
      }
    }

    return true;
  };

  /* =======================================================
     NEXT
     ======================================================= */

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setStep((current) =>
      Math.min(
        current + 1,
        5,
      ),
    );
  };

  /* =======================================================
     BACK
     ======================================================= */

  const handleBack = () => {
    setError("");

    setStep((current) =>
      Math.max(
        current - 1,
        1,
      ),
    );
  };

  /* =======================================================
     CREATE PROFILE + GENERATE AI + SAVE EVERYTHING
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    const calculatedMetrics =
      calculateMetrics({
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        gender,
        trainingDays:
          Number(trainingDays),
        sport,
        goal,
      });

    const now =
      new Date().toISOString();

    const profile: UserProfile = {
      age: Number(age),

      weight: Number(weight),

      height: Number(height),

      gender,

      goal,

      trainingExperience,

      trainingDays:
        Number(trainingDays),

      workoutDuration:
        Number(workoutDuration),

      equipment,

      sport:
        sport.trim() ||
        "None",

      averageSleep:
        Number(averageSleep),

      sleepQuality,

      stress,

      energy,

      soreness,

      recovery,

      injuries:
        injuries.trim() ||
        "None",

      dietStyle,

      mealsPerDay:
        Number(mealsPerDay),

      allergies:
        allergies.trim() ||
        "None",

      foodsToAvoid:
        foodsToAvoid.trim() ||
        "None",

      cuisine:
        cuisine.trim() ||
        "Indian",

      ...calculatedMetrics,

      createdAt: now,

      updatedAt: now,
    };

    try {
      /* ==========================================
         1. SAVE PROFILE TO DJANGO
         ========================================== */

      const activityLevel =
        getActivityLevel(
          Number(trainingDays),
        );

      await saveProfile({
        age: Number(age),

        weight: Number(weight),

        height: Number(height),

        gender,

        goal,

        activity_level:
          activityLevel,
      });

      /* ==========================================
         2. SAVE LOCAL PROFILE BACKUP
         ========================================== */

      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile),
      );

      localStorage.setItem(
        "apexfit_metrics",
        JSON.stringify(
          calculatedMetrics,
        ),
      );

      /* ==========================================
         3. GENERATE WORKOUT PLAN
         ========================================== */

      const workoutResponse =
        await fetch(
          `${API_BASE}/api/ai/workout-plan`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              profile,
            ),
          },
        );

      const workoutData =
        await workoutResponse.json();

      if (
        !workoutResponse.ok ||
        !workoutData.success
      ) {
        throw new Error(
          workoutData.message ||
            "Gemini could not create the workout plan.",
        );
      }

      /* ==========================================
         4. GENERATE DIET PLAN
         ========================================== */

      const dietResponse =
        await fetch(
          `${API_BASE}/api/ai/diet-plan`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              profile,
            ),
          },
        );

      const dietData =
        await dietResponse.json();

      if (
        !dietResponse.ok ||
        !dietData.success
      ) {
        throw new Error(
          dietData.message ||
            "Gemini could not create the diet plan.",
        );
      }

      /* ==========================================
         5. SAVE WORKOUT PLAN TO DJANGO
         ========================================== */

      await api.post(
        "/plans/",
        {
          plan_type:
            "workout",

          title:
            `${goal} Workout Plan`,

          plan_data: {
            response:
              workoutData.response,

            model:
              workoutData.model ||
              "Gemini",

            generated_at:
              new Date().toISOString(),

            profile,
          },

          status:
            "active",
        },
      );

      /* ==========================================
         6. SAVE DIET PLAN TO DJANGO
         ========================================== */

      await api.post(
        "/plans/",
        {
          plan_type:
            "diet",

          title:
            `${goal} Nutrition Plan`,

          plan_data: {
            response:
              dietData.response,

            model:
              dietData.model ||
              "Gemini",

            generated_at:
              new Date().toISOString(),

            profile,
          },

          status:
            "active",
        },
      );

      /* ==========================================
         7. SAVE LOCAL AI BACKUP
         ========================================== */

      localStorage.setItem(
        "apexfit_ai_workout_plan",
        JSON.stringify(
          workoutData,
        ),
      );

      localStorage.setItem(
        "apexfit_ai_diet_plan",
        JSON.stringify(
          dietData,
        ),
      );

      localStorage.setItem(
        "apexfit_ai_generated_at",
        new Date().toISOString(),
      );

      /* ==========================================
         8. NOTIFY APP
         ========================================== */

      window.dispatchEvent(
        new Event(
          "apexfit-profile-updated",
        ),
      );

      window.dispatchEvent(
        new Event(
          "apexfit-ai-plan-updated",
        ),
      );

      /* ==========================================
         9. GO TO DASHBOARD
         ========================================== */

      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );

    } catch (error) {
      console.error(
        "ApexFit onboarding error:",
        error,
      );

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const apiError =
          error as {
            response?: {
              data?: {
                error?: string;
                detail?: string;
              };
            };
          };

        setError(
          apiError.response?.data?.error ||
            apiError.response?.data?.detail ||
            "Unable to save your ApexFit profile.",
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to generate your ApexFit AI plan.",
        );
      }

    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     PROGRESS
     ======================================================= */

  const progress =
    (step / 5) * 100;

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#090909] text-white">

      {/* HEADER */}

      <header className="border-b border-zinc-800">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="text-xl font-bold"
          >
            ApexFit
            <span className="text-cyan-400">
              -AI
            </span>
          </button>

          <div className="text-right">

            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Step {step} of 5
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Intelligent onboarding
            </p>

          </div>

        </div>

        <div className="h-1 bg-zinc-900">

          <div
            className="h-1 bg-cyan-400 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-5 py-10 md:py-16">

        <form
          onSubmit={handleSubmit}
        >

          {/* STEP 1 */}

          {step === 1 && (
            <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6 md:p-10">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Step 1 — Body
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Tell us about your body.
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-500">
                ApexFit uses these details to calculate your BMI, BMR and estimated daily energy requirements.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">

                <Input
                  label="Age"
                  value={age}
                  onChange={setAge}
                  placeholder="19"
                  suffix="years"
                  type="number"
                />

                <Input
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  placeholder="70"
                  suffix="kg"
                  type="number"
                />

                <Input
                  label="Height"
                  value={height}
                  onChange={setHeight}
                  placeholder="175"
                  suffix="cm"
                  type="number"
                />

              </div>

              <div className="mt-8">

                <h2 className="text-lg font-bold">
                  Biological Sex
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  Used for BMR and energy requirement calculations.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <Choice
                    selected={
                      gender === "Male"
                    }
                    onClick={() =>
                      setGender("Male")
                    }
                    title="Male"
                    icon="♂"
                  />

                  <Choice
                    selected={
                      gender === "Female"
                    }
                    onClick={() =>
                      setGender("Female")
                    }
                    title="Female"
                    icon="♀"
                  />

                </div>

              </div>

            </section>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6 md:p-10">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Step 2 — Goal & Training
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                What are we training for?
              </h1>

              <p className="mt-3 text-zinc-500">
                You choose the goal. ApexFit AI personalizes the path to reach it.
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-2">

                {goals.map(
                  (item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setGoal(
                          item.value,
                        )
                      }
                      className={`rounded-2xl border p-5 text-left transition ${
                        goal === item.value
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >

                      <div className="flex gap-4">

                        <span className="text-2xl">
                          {item.icon}
                        </span>

                        <div>

                          <p
                            className={`font-bold ${
                              goal === item.value
                                ? "text-cyan-400"
                                : "text-white"
                            }`}
                          >
                            {item.value}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {item.description}
                          </p>

                        </div>

                      </div>

                    </button>
                  ),
                )}

              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">

                <Select
                  label="Training experience"
                  value={
                    trainingExperience
                  }
                  onChange={
                    setTrainingExperience
                  }
                  options={[
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                  ]}
                />

                <Select
                  label="Training days per week"
                  value={
                    trainingDays
                  }
                  onChange={
                    setTrainingDays
                  }
                  options={[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                  ]}
                />

                <Select
                  label="Workout duration"
                  value={
                    workoutDuration
                  }
                  onChange={
                    setWorkoutDuration
                  }
                  options={[
                    "30",
                    "45",
                    "60",
                    "75",
                    "90",
                    "120",
                  ]}
                  suffix="minutes"
                />

                <Input
                  label="Sport / activity (optional)"
                  value={sport}
                  onChange={setSport}
                  placeholder="Cricket, football, running..."
                />

              </div>

              <div className="mt-8">

                <h2 className="text-lg font-bold">
                  Available equipment
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  Select everything you can use.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">

                  {equipmentOptions.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          toggleEquipment(
                            item,
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          equipment.includes(
                            item,
                          )
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-400"
                        }`}
                      >
                        {equipment.includes(
                          item,
                        )
                          ? "✓ "
                          : ""}
                        {item}
                      </button>
                    ),
                  )}

                </div>

              </div>

            </section>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6 md:p-10">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Step 3 — Recovery
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                How recovered are you?
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-500">
                ApexFit AI uses recovery information to control training stress and avoid unnecessary fatigue.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">

                <Input
                  label="Average sleep"
                  value={averageSleep}
                  onChange={
                    setAverageSleep
                  }
                  placeholder="7"
                  suffix="hours"
                  type="number"
                />

                <Select
                  label="Sleep quality"
                  value={sleepQuality}
                  onChange={
                    setSleepQuality
                  }
                  options={[
                    "Poor",
                    "Fair",
                    "Good",
                    "Excellent",
                  ]}
                />

                <Select
                  label="Daily stress"
                  value={stress}
                  onChange={setStress}
                  options={[
                    "Very Low",
                    "Low",
                    "Moderate",
                    "High",
                    "Very High",
                  ]}
                />

                <Select
                  label="Energy"
                  value={energy}
                  onChange={setEnergy}
                  options={[
                    "Very Low",
                    "Low",
                    "Moderate",
                    "Good",
                    "Excellent",
                  ]}
                />

                <Select
                  label="Muscle soreness"
                  value={soreness}
                  onChange={
                    setSoreness
                  }
                  options={[
                    "None",
                    "Low",
                    "Moderate",
                    "High",
                    "Very High",
                  ]}
                />

                <Select
                  label="Overall recovery"
                  value={recovery}
                  onChange={
                    setRecovery
                  }
                  options={[
                    "Poor",
                    "Fair",
                    "Good",
                    "Excellent",
                  ]}
                />

              </div>

              <div className="mt-6">

                <label className="text-sm font-semibold text-zinc-300">
                  Injuries or physical limitations
                </label>

                <textarea
                  value={injuries}
                  onChange={(event) =>
                    setInjuries(
                      event.target.value,
                    )
                  }
                  placeholder="Example: previous ankle injury, lower-back limitation, none..."
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

            </section>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-6 md:p-10">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Step 4 — Nutrition
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Tell ApexFit how you eat.
              </h1>

              <p className="mt-3 text-zinc-500">
                Tell us your food preferences. ApexFit calculates your nutrition targets and builds your personalized plan.
              </p>

              <div className="mt-8">

                <h2 className="text-lg font-bold">
                  Diet style
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">

                  {dietStyles.map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() =>
                          setDietStyle(
                            style,
                          )
                        }
                        className={`rounded-xl border px-4 py-4 text-left font-semibold transition ${
                          dietStyle === style
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-400"
                        }`}
                      >
                        {dietStyle === style
                          ? "✓ "
                          : ""}
                        {style}
                      </button>
                    ),
                  )}

                </div>

              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">

                <Select
                  label="Meals per day"
                  value={mealsPerDay}
                  onChange={
                    setMealsPerDay
                  }
                  options={[
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                  ]}
                />

                <Input
                  label="Cuisine preference"
                  value={cuisine}
                  onChange={setCuisine}
                  placeholder="Indian"
                />

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Textarea
                  label="Allergies / intolerances"
                  value={allergies}
                  onChange={
                    setAllergies
                  }
                  placeholder="Example: peanuts, lactose..."
                />

                <Textarea
                  label="Foods you avoid/dislike"
                  value={foodsToAvoid}
                  onChange={
                    setFoodsToAvoid
                  }
                  placeholder="Example: mushrooms, soy..."
                />

              </div>

              <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                <p className="font-bold text-cyan-400">
                  ✦ ApexFit Nutrition Engine
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Your daily calories, protein, carbohydrates, fats, fibre and hydration targets will be calculated automatically based on your body, activity and fitness goal.
                </p>

              </div>

            </section>
          )}

          {/* STEP 5 */}

          {step === 5 && (
            <section className="rounded-3xl border border-cyan-500/20 bg-[#111111] p-6 md:p-10">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Step 5 — ApexFit AI
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Ready for your personalized plan?
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
                ApexFit AI will analyze your body, calculated health metrics, goal, training experience, equipment, sleep, stress, recovery and nutrition preferences.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">

                <SummaryCard
                  title="Primary Goal"
                  value={
                    goal ||
                    "Not selected"
                  }
                />

                <SummaryCard
                  title="Training"
                  value={`${trainingDays} days • ${workoutDuration} min`}
                />

                <SummaryCard
                  title="Recovery"
                  value={`${averageSleep}h sleep • ${recovery} recovery`}
                />

                <SummaryCard
                  title="Diet"
                  value={dietStyle}
                />

                <SummaryCard
                  title="Equipment"
                  value={equipment.join(
                    ", ",
                  )}
                />

                <SummaryCard
                  title="Sport"
                  value={
                    sport ||
                    "None"
                  }
                />

              </div>

              <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                <p className="font-bold text-cyan-400">
                  🔒 Your goal stays locked
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  ApexFit AI can adjust exercise selection, volume, intensity and recovery based on your condition, but it will not replace your selected primary goal.
                </p>

              </div>

              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

                <p className="font-bold">
                  📈 Progressive overload stays enabled
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Your future training can progress through load, repetitions, sets or other appropriate variables while respecting recovery.
                </p>

              </div>

            </section>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* NAVIGATION */}

          <div className="mt-6 flex gap-3">

            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 font-bold text-zinc-300 transition hover:border-zinc-700 disabled:opacity-50"
              >
                ← Back
              </button>
            )}

            {step < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400"
              >
                Continue →
              </button>
            )}

            {step === 5 && (
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "ApexFit AI is building your plan..."
                  : "Generate My ApexFit AI Plan →"}
              </button>
            )}

          </div>

        </form>

      </main>

    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
   ========================================================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-zinc-300">
        {label}
      </span>

      <div className="relative mt-2">

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 pr-20 text-white outline-none placeholder:text-zinc-700 focus:border-cyan-500"
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            {suffix}
          </span>
        )}

      </div>

    </label>
  );
}

/* =========================================================
   SELECT COMPONENT
   ========================================================= */

function Select({
  label,
  value,
  onChange,
  options,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
  suffix?: string;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-zinc-300">
        {label}
      </span>

      <div className="relative mt-2">

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
                {suffix
                  ? ` ${suffix}`
                  : ""}
              </option>
            ),
          )}
        </select>

      </div>

    </label>
  );
}

/* =========================================================
   CHOICE COMPONENT
   ========================================================= */

function Choice({
  selected,
  onClick,
  title,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-5 py-4 text-left transition ${
        selected
          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
          : "border-zinc-800 bg-zinc-900 text-zinc-400"
      }`}
    >

      <span className="text-lg">
        {icon}
      </span>

      <span className="ml-3 font-semibold">
        {title}
      </span>

    </button>
  );
}

/* =========================================================
   TEXTAREA COMPONENT
   ========================================================= */

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-zinc-300">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-cyan-500"
      />

    </label>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

      <p className="text-xs uppercase tracking-wider text-zinc-600">
        {title}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>

    </div>
  );
}