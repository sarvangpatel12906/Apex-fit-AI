import {
  ArrowLeft,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Printer,
  Scale,
  Target,
  Weight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Profile = {
  name?: string;
  first_name?: string;
  firstName?: string;
  username?: string;
  email?: string;

  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;

  goal?: string;

  calories?: number;
  calorieTarget?: number;
  protein?: number;
  carbs?: number;
  carbohydrates?: number;
  fats?: number;
  fat?: number;

  averageSleep?: number;
  stress?: string;
  energy?: string;
  recovery?: string;
};

function getName(
  profile: Profile,
) {
  if (profile.name)
    return profile.name;

  if (profile.first_name)
    return profile.first_name;

  if (profile.firstName)
    return profile.firstName;

  if (profile.username)
    return profile.username;

  if (profile.email) {
    const localPart =
      profile.email.split("@")[0];

    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  return "ApexFit Athlete";
}

function calculateHealthyRange(
  height?: number,
) {
  if (!height) {
    return null;
  }

  const meters =
    height / 100;

  const min =
    18.5 *
    meters *
    meters;

  const max =
    24.9 *
    meters *
    meters;

  return {
    min: Math.round(min),
    max: Math.round(max),
    target: Math.round(
      (min + max) / 2,
    ),
  };
}

function getTDEE(
  profile: Profile,
) {
  return Math.round(
    Number(
      profile.tdee ||
        profile.calorieTarget ||
        profile.calories ||
        0,
    ),
  );
}

export default function PrintSummaryPage() {
  const navigate = useNavigate();

  let profile: Profile = {};

  try {
    const saved =
      localStorage.getItem(
        "apexfit_user_profile",
      );

    if (saved) {
      profile = JSON.parse(
        saved,
      );
    }
  } catch {
    profile = {};
  }

  const name =
    getName(profile);

  const healthy =
    calculateHealthyRange(
      profile.height,
    );

  const bmi =
    Number(profile.bmi) ||
    (profile.weight &&
    profile.height
      ? profile.weight /
        Math.pow(
          profile.height / 100,
          2,
        )
      : 0);

  const bmr =
    Number(profile.bmr) || 0;

  const tdee =
    getTDEE(profile);

  const cutLow =
    Math.round(tdee * 0.8);

  const cutHigh =
    Math.round(tdee * 0.9);

  const bulkLow =
    Math.round(tdee * 1.05);

  const bulkHigh =
    Math.round(tdee * 1.15);

  const recompLow =
    Math.round(tdee * 0.95);

  return (
    <div className="min-h-screen bg-zinc-200 py-8 text-zinc-950 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-5">
        <div className="mb-5 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard",
              )
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        <article className="overflow-hidden rounded-3xl bg-white shadow-xl print:rounded-none print:shadow-none">
          <header className="border-b border-zinc-200 px-8 py-8 sm:px-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Dumbbell className="h-5 w-5" />
                  </div>

                  <span className="text-sm font-black tracking-wide">
                    APEXFIT AI
                  </span>
                </div>

                <h1 className="text-3xl font-black">
                  Fitness Summary
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Personalized body, calorie and movement report
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Client
                </p>

                <p className="mt-1 text-lg font-black">
                  {name}
                </p>

                {profile.email && (
                  <p className="text-xs text-zinc-500">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 border-b border-zinc-200 sm:grid-cols-4">
            <SummaryMetric
              icon={
                <Scale className="h-5 w-5" />
              }
              label="BMI"
              value={
                bmi
                  ? bmi.toFixed(1)
                  : "—"
              }
            />

            <SummaryMetric
              icon={
                <Flame className="h-5 w-5" />
              }
              label="BMR"
              value={
                bmr
                  ? `${Math.round(bmr)} kcal`
                  : "—"
              }
            />

            <SummaryMetric
              icon={
                <Target className="h-5 w-5" />
              }
              label="TDEE"
              value={
                tdee
                  ? `${tdee} kcal`
                  : "—"
              }
            />

            <SummaryMetric
              icon={
                <HeartPulse className="h-5 w-5" />
              }
              label="Age"
              value={
                profile.age
                  ? `${profile.age} yrs`
                  : "—"
              }
            />
          </section>

          <section className="px-8 py-8 sm:px-10">
            <SectionTitle>
              Body Analysis
            </SectionTitle>

            <div className="grid gap-4 sm:grid-cols-3">
              <ReportBox
                label="Current Weight"
                value={
                  profile.weight
                    ? `${profile.weight} kg`
                    : "—"
                }
              />

              <ReportBox
                label="Height"
                value={
                  profile.height
                    ? `${profile.height} cm`
                    : "—"
                }
              />

              <ReportBox
                label="Healthy Weight"
                value={
                  healthy
                    ? `${healthy.min}–${healthy.max} kg`
                    : "—"
                }
              />
            </div>

            {healthy && (
              <div className="mt-4 rounded-2xl bg-zinc-100 p-5">
                <div className="flex items-center gap-3">
                  <Weight className="h-5 w-5" />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Suggested target
                    </p>

                    <p className="text-xl font-black">
                      Around{" "}
                      {healthy.target} kg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="border-t border-zinc-200 px-8 py-8 sm:px-10">
            <SectionTitle>
              Calorie Strategy
            </SectionTitle>

            <div className="grid gap-4 sm:grid-cols-2">
              <Strategy
                title="Maintenance"
                value={`${tdee} kcal/day`}
                text="Approximate intake to maintain current body weight."
              />

              <Strategy
                title="Cutting"
                value={`${cutLow}–${cutHigh} kcal/day`}
                text="Approximately 10–20% below estimated TDEE."
              />

              <Strategy
                title="Bulking"
                value={`${bulkLow}–${bulkHigh} kcal/day`}
                text="Approximately 5–15% above estimated TDEE."
              />

              <Strategy
                title="Body Recomposition"
                value={`${recompLow}–${tdee} kcal/day`}
                text="Near maintenance, with a small deficit when appropriate."
              />
            </div>
          </section>

          <section className="border-t border-zinc-200 px-8 py-8 sm:px-10">
            <SectionTitle>
              Daily Movement
            </SectionTitle>

            <div className="flex items-center gap-4 rounded-2xl bg-zinc-100 p-5">
              <Footprints className="h-7 w-7" />

              <div>
                <p className="text-2xl font-black">
                  7,000–10,000
                </p>

                <p className="text-sm text-zinc-500">
                  recommended daily steps, adjusted for the individual's goal and activity level
                </p>
              </div>
            </div>
          </section>

          <footer className="border-t border-zinc-200 px-8 py-6 text-xs leading-5 text-zinc-400 sm:px-10">
            ApexFit AI fitness estimates are intended for general fitness planning and are not medical diagnoses. BMI-based weight ranges, calorie targets and estimated body-age indicators are approximations and should be adjusted according to individual progress and professional guidance when appropriate.
          </footer>
        </article>
      </div>
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-zinc-200 p-5 last:border-r-0">
      <div className="mb-2">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
      {children}
    </h2>
  );
}

function ReportBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function Strategy({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-5">
      <p className="font-black">
        {title}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {text}
      </p>
    </div>
  );
}