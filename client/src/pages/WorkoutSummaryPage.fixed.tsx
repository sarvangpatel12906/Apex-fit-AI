import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  type WorkoutResult,
  getLatestWorkout,
} from "../utils/WorkoutStorage";

/* =========================================================
   APEXFIT AI
   WORKOUT SUMMARY PAGE
   ========================================================= */

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secondsLeft = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secondsLeft}s`;
  }

  return `${secondsLeft}s`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

export default function WorkoutSummaryPage() {
  const navigate = useNavigate();

  /*
   * The latest completed workout is stored by WorkoutStorage.
   * We intentionally use the storage helper instead of scanning
   * random localStorage keys.
   */
  const workout: WorkoutResult | null = useMemo(
    () => getLatestWorkout(),
    [],
  );

  /* =========================================================
     EMPTY STATE
     ========================================================= */

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#090909] text-white">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <section className="w-full rounded-3xl border border-zinc-800 bg-[#111111] p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-4xl">
              📊
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-green-400">
              ApexFit AI
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              No Completed Workout
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Complete a workout first and your training report will
              automatically appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/workout")}
              className="mt-8 rounded-2xl bg-green-500 px-8 py-4 font-bold text-black transition hover:bg-green-400"
            >
              Go To Workout
            </button>
          </section>
        </main>
      </div>
    );
  }

  /* =========================================================
     CALCULATIONS
     ========================================================= */

  const completedExercises = useMemo(() => {
    return workout.exercises.filter((exercise) =>
      exercise.completedSets.some((set) => set.completed),
    ).length;
  }, [workout]);

  const completedSets = useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.completedSets.filter(
          (set) => set.completed,
        ).length
      );
    }, 0);
  }, [workout]);

  const totalReps = useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.completedSets.reduce((exerciseTotal, set) => {
          if (!set.completed) {
            return exerciseTotal;
          }

          return exerciseTotal + (Number(set.reps) || 0);
        }, 0)
      );
    }, 0);
  }, [workout]);

  const totalVolume = useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.completedSets.reduce((exerciseTotal, set) => {
          if (!set.completed) {
            return exerciseTotal;
          }

          const reps = Number(set.reps) || 0;
          const weight = Number(set.weight) || 0;

          return exerciseTotal + reps * weight;
        }, 0)
      );
    }, 0);
  }, [workout]);

  const muscles = useMemo(() => {
    const data: Record<string, number> = {};

    workout.exercises.forEach((exercise) => {
      const sets = exercise.completedSets.filter(
        (set) => set.completed,
      ).length;

      if (sets === 0) {
        return;
      }

      data[exercise.muscle] =
        (data[exercise.muscle] || 0) + sets;
    });

    return Object.entries(data).sort(
      (a, b) => b[1] - a[1],
    );
  }, [workout]);

  const completedExerciseRows = workout.exercises.filter(
    (exercise) =>
      exercise.completedSets.some(
        (set) => set.completed,
      ),
  );

  /* =========================================================
     MAIN PAGE
     ========================================================= */

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="border-b border-zinc-800 bg-[#090909]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
                ApexFit AI
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Workout Complete
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Your training session has been recorded.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-fit rounded-xl border border-zinc-800 px-5 py-3 font-semibold transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* ===================================================
            SUCCESS CARD
            =================================================== */}

        <section className="rounded-3xl border border-green-900 bg-green-950/20 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500 text-3xl font-black text-black">
                ✓
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                  Session Completed
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {workout.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {formatDate(workout.completedAt)}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-green-950 px-4 py-2 text-sm font-semibold text-green-400">
              {workout.goal}
            </span>
          </div>
        </section>

        {/* ===================================================
            STATS
            =================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Duration"
            value={formatDuration(workout.durationSeconds)}
          />

          <StatCard
            label="Exercises"
            value={String(completedExercises)}
          />

          <StatCard
            label="Sets"
            value={String(completedSets)}
          />

          <StatCard
            label="Reps"
            value={formatNumber(totalReps)}
          />

          <StatCard
            label="Volume"
            value={formatNumber(totalVolume)}
            suffix="kg"
          />
        </section>

        {/* ===================================================
            TRAINING ANALYSIS
            =================================================== */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-[#111111] p-6 shadow-xl sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
            Training Analysis
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Muscle Groups Trained
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Completed sets grouped by the primary muscle targeted.
          </p>

          {muscles.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-zinc-900 p-6 text-center text-sm text-zinc-500">
              No completed sets were recorded.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {muscles.map(([muscle, sets]) => (
                <div
                  key={muscle}
                  className="rounded-2xl bg-zinc-900 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">
                      {muscle}
                    </span>

                    <span className="text-lg font-bold text-green-400">
                      {sets}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    completed sets
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            EXERCISE LOG
            =================================================== */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-[#111111] p-6 shadow-xl sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
            Exercise Log
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Completed Exercises
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Review the work you completed during this session.
          </p>

          {completedExerciseRows.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-zinc-900 p-6 text-center text-sm text-zinc-500">
              No completed exercises were recorded.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {completedExerciseRows.map(
                (exercise, index) => {
                  const completedSetsForExercise =
                    exercise.completedSets.filter(
                      (set) => set.completed,
                    );

                  const bestWeight =
                    completedSetsForExercise.reduce(
                      (best, set) =>
                        Math.max(
                          best,
                          Number(set.weight) || 0,
                        ),
                      0,
                    );

                  const exerciseReps =
                    completedSetsForExercise.reduce(
                      (total, set) =>
                        total +
                        (Number(set.reps) || 0),
                      0,
                    );

                  return (
                    <div
                      key={exercise.id}
                      className="rounded-2xl bg-zinc-900 p-5"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        {/* Exercise name */}

                        <div>
                          <p className="text-xs text-zinc-600">
                            Exercise {index + 1}
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {exercise.name}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-green-400">
                            {exercise.muscle}
                          </p>
                        </div>

                        {/* Exercise statistics */}

                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div>
                            <p className="text-xs text-zinc-600">
                              Sets
                            </p>

                            <p className="mt-1 font-bold">
                              {
                                completedSetsForExercise.length
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Best
                            </p>

                            <p className="mt-1 font-bold">
                              {formatNumber(bestWeight)} kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Reps
                            </p>

                            <p className="mt-1 font-bold">
                              {formatNumber(exerciseReps)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Individual sets */}

                      <div className="mt-5 border-t border-zinc-800 pt-4">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-600">
                          <span>SET</span>
                          <span>WEIGHT</span>
                          <span>REPS</span>
                        </div>

                        <div className="mt-2 space-y-2">
                          {completedSetsForExercise.map(
                            (set) => (
                              <div
                                key={`${exercise.id}-${set.setNumber}`}
                                className="grid grid-cols-3 gap-2 rounded-xl bg-[#111111] px-3 py-2 text-center text-sm"
                              >
                                <span className="text-zinc-400">
                                  {set.setNumber}
                                </span>

                                <span>
                                  {Number(set.weight) || 0} kg
                                </span>

                                <span>
                                  {Number(set.reps) || 0}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* ===================================================
            ACTIONS
            =================================================== */}

        <section className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/workout")}
            className="rounded-2xl bg-green-500 px-8 py-4 font-bold text-black transition hover:bg-green-400"
          >
            Start Another Workout
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold transition hover:bg-zinc-900"
          >
            Back To Dashboard
          </button>
        </section>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="py-10 text-center">
          <p className="text-xs text-zinc-600">
            ApexFit AI • Workout Intelligence
          </p>
        </footer>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

type StatCardProps = {
  label: string;
  value: string;
  suffix?: string;
};

function StatCard({
  label,
  value,
  suffix,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5 shadow-lg">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold">
          {value}
        </p>

        {suffix ? (
          <span className="text-xs text-zinc-600">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}