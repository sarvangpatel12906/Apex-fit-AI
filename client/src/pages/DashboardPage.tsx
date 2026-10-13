import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock3,
  Copy,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  History,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  UserRound,
  Weight,
  X,
  Zap,
} from "lucide-react";

import { getProfile } from "../services/api";

import {
  type WorkoutExercise,
  type WorkoutResult,
  type WorkoutTemplate,
  createWorkoutId,
  deleteWorkoutResult,
  deleteWorkoutTemplate,
  getWorkoutHistory,
  getWorkoutTemplates,
  saveWorkoutTemplate,
  setActiveWorkout,
} from "../utils/WorkoutStorage";

type ConfirmState =
  | {
      type: "template";
      id: string;
      name: string;
    }
  | {
      type: "history";
      id: string;
      name: string;
    }
  | null;

type AIPlanType = "workout" | "diet";

type AIEditState = {
  type: AIPlanType;
  title: string;
  content: string;
} | null;

type DashboardProfile = {
  name?: string;
  first_name?: string;
  firstName?: string;
  username?: string;
  email?: string;

  age?: number;
  gender?: string;
  height?: number;
  weight?: number;

  goal?: string;

  activity_level?: string;
  activityLevel?: string;

  bmi?: number;
  bmr?: number;
  tdee?: number;

  calories?: number;
  calorieTarget?: number;

  protein?: number;
  proteinTarget?: number;

  carbs?: number;
  carbohydrates?: number;

  fats?: number;
  fat?: number;

  fiber?: number;
  water?: number;

  averageSleep?: number;
  sleepQuality?: string;
  stress?: string;
  energy?: string;
  soreness?: string;
  recovery?: string;
  injuries?: string;

  trainingExperience?: string;
  trainingDays?: number;
  workoutDuration?: number;
  equipment?: string[];
  sport?: string;

  dietStyle?: string;
  mealsPerDay?: number;
  allergies?: string;
  foodsToAvoid?: string;
  cuisine?: string;
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
};

type WorkoutCardProps = {
  workout: WorkoutTemplate;
  onStart: (workout: WorkoutTemplate) => void;
  onEdit: (workout: WorkoutTemplate) => void;
  onDuplicate: (workout: WorkoutTemplate) => void;
  onDelete: (workout: WorkoutTemplate) => void;
};

type HistoryCardProps = {
  workout: WorkoutResult;
  onDelete: (workout: WorkoutResult) => void;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatVolume(volume: number): string {
  const safeVolume = Number(volume) || 0;

  if (safeVolume >= 100000) {
    return `${(safeVolume / 1000).toFixed(0)}k kg`;
  }

  if (safeVolume >= 1000) {
    return `${(safeVolume / 1000).toFixed(1)}k kg`;
  }

  return `${Math.round(safeVolume)} kg`;
}

function calculateTemplateSets(
  workout: WorkoutTemplate,
): number {
  return workout.exercises.reduce(
    (total, exercise) =>
      total +
      Math.max(
        0,
        Number(exercise.sets) || 0,
      ),
    0,
  );
}

function calculateCompletedSets(
  workout: WorkoutResult,
): number {
  return workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.completedSets.filter(
        (set) =>
          set.completed ||
          Boolean(set.completedAt),
      ).length,
    0,
  );
}

function calculateHistoryVolume(
  workout: WorkoutResult,
): number {
  if (Number(workout.totalVolume) > 0) {
    return Number(workout.totalVolume);
  }

  return workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.completedSets.reduce(
        (exerciseTotal, set) => {
          if (
            !set.completed &&
            !set.completedAt
          ) {
            return exerciseTotal;
          }

          return (
            exerciseTotal +
            Number(set.weight || 0) *
              Number(set.reps || 0)
          );
        },
        0,
      ),
    0,
  );
}

function getWorkoutExerciseNames(
  exercises: WorkoutExercise[],
): string[] {
  return exercises
    .map((exercise) => exercise.name)
    .filter(Boolean);
}

function cloneWorkout(
  workout: WorkoutTemplate,
): WorkoutTemplate {
  const now = new Date().toISOString();

  return {
    ...workout,
    id: createWorkoutId(),
    name: `${workout.name} Copy`,
    workoutName: `${workout.name} Copy`,
    createdAt: now,
    updatedAt: now,
    exercises: workout.exercises.map(
      (exercise) => ({
        ...exercise,
        id: createWorkoutId(),
        completedSets:
          exercise.completedSets.map(
            (set) => ({
              ...set,
              completed: false,
              completedAt: "",
            }),
          ),
        startedAt: null,
        completedAt: null,
      }),
    ),
  };
}

function getDashboardName(
  profile: DashboardProfile | null,
): string {
  try {
    const rawUser = localStorage.getItem("user");

    if (rawUser) {
      const user = JSON.parse(rawUser);

      const userName =
        user?.first_name ||
        user?.firstName ||
        user?.name ||
        user?.username ||
        "";

      if (
        typeof userName === "string" &&
        userName.trim()
      ) {
        return userName
          .trim()
          .split(/\s+/)[0];
      }
    }
  } catch {
    // Ignore invalid stored user data.
  }

  const value =
    profile?.name ||
    profile?.first_name ||
    profile?.firstName ||
    profile?.username ||
    profile?.email?.split("@")[0] ||
    "";

  return (
    value
      .trim()
      .split(/\s+/)[0] || "Athlete"
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [templates, setTemplates] =
    useState<WorkoutTemplate[]>([]);

  const [history, setHistory] =
    useState<WorkoutResult[]>([]);

  const [confirm, setConfirm] =
    useState<ConfirmState>(null);

  const [message, setMessage] =
    useState("");

  const [aiWorkoutPlan, setAiWorkoutPlan] =
    useState("");

  const [aiDietPlan, setAiDietPlan] =
    useState("");

  const [aiEdit, setAiEdit] =
    useState<AIEditState>(null);

  const [aiBusy, setAiBusy] =
    useState<AIPlanType | null>(null);

  const [profile, setProfile] =
    useState<DashboardProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadDashboard = useCallback(
    async () => {
      setLoading(true);

      setTemplates(
        getWorkoutTemplates(),
      );

      setHistory(
        getWorkoutHistory(),
      );

      try {
        const response =
          await getProfile();

        const profileData =
          response?.data ?? response;

        if (profileData) {
          setProfile(
            profileData as DashboardProfile,
          );
        }
      } catch (error) {
        console.warn(
          "Dashboard profile request failed:",
          error,
        );
      }

      try {
        const raw =
          localStorage.getItem(
            "apexfit_user_profile",
          );

        if (raw) {
          const localProfile =
            JSON.parse(
              raw,
            ) as DashboardProfile;

          setProfile((current) => ({
            ...current,
            ...localProfile,
          }));
        }
      } catch {
        // Ignore invalid local profile.
      }

      try {
        const workoutRaw =
          localStorage.getItem(
            "apexfit_ai_workout_plan",
          );

        const dietRaw =
          localStorage.getItem(
            "apexfit_ai_diet_plan",
          );

        if (workoutRaw) {
          try {
            const parsed =
              JSON.parse(workoutRaw);

            setAiWorkoutPlan(
              typeof parsed === "string"
                ? parsed
                : parsed?.response || "",
            );
          } catch {
            setAiWorkoutPlan(
              workoutRaw,
            );
          }
        } else {
          setAiWorkoutPlan("");
        }

        if (dietRaw) {
          try {
            const parsed =
              JSON.parse(dietRaw);

            setAiDietPlan(
              typeof parsed === "string"
                ? parsed
                : parsed?.response || "",
            );
          } catch {
            setAiDietPlan(dietRaw);
          }
        } else {
          setAiDietPlan("");
        }
      } catch {
        setAiWorkoutPlan("");
        setAiDietPlan("");
      }

      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handleUpdate = () => {
      loadDashboard();
    };

    window.addEventListener(
      "apexfit-workout-updated",
      handleUpdate,
    );

    window.addEventListener(
      "apexfit-profile-updated",
      handleUpdate,
    );

    window.addEventListener(
      "apexfit-ai-plan-updated",
      handleUpdate,
    );

    return () => {
      window.removeEventListener(
        "apexfit-workout-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "apexfit-profile-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "apexfit-ai-plan-updated",
        handleUpdate,
      );
    };
  }, [loadDashboard]);

  const displayName = getDashboardName(profile);

  const goal =
    profile?.goal ||
    "Build a healthier lifestyle";

  const bmi =
    Number(profile?.bmi) ||
    (profile?.weight &&
    profile?.height
      ? Number(
          profile.weight /
            Math.pow(
              profile.height / 100,
              2,
            ),
        )
      : 0);

  const weeklySessions =
    history.length;

  const weeklyVolume = useMemo(
    () =>
      history
        .slice(0, 7)
        .reduce(
          (sum, workout) =>
            sum +
            calculateHistoryVolume(
              workout,
            ),
          0,
        ),
    [history],
  );

  const totalCompletedSets =
    useMemo(
      () =>
        history
          .slice(0, 7)
          .reduce(
            (sum, workout) =>
              sum +
              calculateCompletedSets(
                workout,
              ),
            0,
          ),
      [history],
    );

  const handleStartWorkout = (
    workout: WorkoutTemplate,
  ) => {
    setActiveWorkout(workout);
    navigate("/workout");
  };

  const handleEditWorkout = (
    workout: WorkoutTemplate,
  ) => {
    setActiveWorkout(workout);
    navigate("/workout");
  };

  const handleDuplicateWorkout = (
    workout: WorkoutTemplate,
  ) => {
    const duplicate =
      cloneWorkout(workout);

    saveWorkoutTemplate(
      duplicate,
    );

    setMessage(
      "Workout duplicated successfully.",
    );

    loadDashboard();
  };

  const handleDeleteTemplate = (
    workout: WorkoutTemplate,
  ) => {
    setConfirm({
      type: "template",
      id: workout.id,
      name:
        workout.name ||
        workout.workoutName ||
        "Workout",
    });
  };

  const handleDeleteHistory = (
    workout: WorkoutResult,
  ) => {
    setConfirm({
      type: "history",
      id: workout.id,
      name:
        workout.name ||
        workout.workoutName ||
        "Workout",
    });
  };

  const handleConfirmDelete = () => {
    if (!confirm) return;

    if (confirm.type === "template") {
      deleteWorkoutTemplate(
        confirm.id,
      );
    } else {
      deleteWorkoutResult(
        confirm.id,
      );
    }

    setConfirm(null);
    setMessage(
      "Deleted successfully.",
    );
    loadDashboard();
  };

  const handleRegenerateAI = async (
    type: AIPlanType,
  ) => {
    setAiBusy(type);

    try {
      const endpoint =
        type === "workout"
          ? "http://localhost:5002/api/ai/workout-plan"
          : "http://localhost:5002/api/ai/diet-plan";

      const response =
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI generation failed",
        );
      }

      const text =
        data?.response || "";

      if (type === "workout") {
        setAiWorkoutPlan(text);

        localStorage.setItem(
          "apexfit_ai_workout_plan",
          JSON.stringify(data),
        );
      } else {
        setAiDietPlan(text);

        localStorage.setItem(
          "apexfit_ai_diet_plan",
          JSON.stringify(data),
        );
      }

      setMessage(
        `${
          type === "workout"
            ? "Workout"
            : "Diet"
        } plan regenerated.`,
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not regenerate the AI plan.",
      );
    } finally {
      setAiBusy(null);
    }
  };

  const handleSaveAIEdit = () => {
    if (!aiEdit) return;

    if (aiEdit.type === "workout") {
      setAiWorkoutPlan(
        aiEdit.content,
      );

      localStorage.setItem(
        "apexfit_ai_workout_plan",
        JSON.stringify({
          response:
            aiEdit.content,
        }),
      );
    } else {
      setAiDietPlan(
        aiEdit.content,
      );

      localStorage.setItem(
        "apexfit_ai_diet_plan",
        JSON.stringify({
          response:
            aiEdit.content,
        }),
      );
    }

    setAiEdit(null);

    setMessage(
      "AI plan updated.",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white">
        <main className="mx-auto max-w-7xl px-5 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-zinc-900" />

            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-3xl bg-zinc-900"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <DashboardHeader
          name={displayName}
          goal={goal}
          onRefresh={loadDashboard}
          onUpdateProfile={() =>
            navigate("/setup")
          }
        />

        {message && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-green-900/50 bg-green-950/20 px-4 py-3 text-sm text-green-400">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <Dumbbell className="h-5 w-5" />
            }
            label="Workouts"
            value={String(
              weeklySessions,
            )}
            helper="Completed sessions"
          />

          <StatCard
            icon={
              <Flame className="h-5 w-5" />
            }
            label="Volume"
            value={formatVolume(
              weeklyVolume,
            )}
            helper="Recent training"
          />

          <StatCard
            icon={
              <Activity className="h-5 w-5" />
            }
            label="Completed Sets"
            value={String(
              totalCompletedSets,
            )}
            helper="Tracked sets"
          />

          <StatCard
            icon={
              <Weight className="h-5 w-5" />
            }
            label="BMI"
            value={
              bmi
                ? bmi.toFixed(1)
                : "—"
            }
            helper="Current body metric"
          />

        </section>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            <ProfileSnapshot
              profile={profile}
              goal={goal}
            />

            <RecoverySnapshot
              profile={profile}
            />

            <NutritionSnapshot
              profile={profile}
            />

            <section>
              <SectionHeading
                icon={
                  <Dumbbell className="h-5 w-5" />
                }
                title="Saved Workouts"
                description="Your reusable training sessions"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/workout",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-green-400"
                  >
                    <Plus className="h-4 w-4" />
                    New Workout
                  </button>
                }
              />

              {templates.length === 0 ? (
                <EmptyPanel
                  icon={
                    <Dumbbell className="h-7 w-7" />
                  }
                  title="No saved workouts"
                  description="Create your first workout and it will appear here."
                  actionLabel="Create Workout"
                  onAction={() =>
                    navigate(
                      "/workout",
                    )
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {templates.map(
                    (workout) => (
                      <WorkoutCard
                        key={
                          workout.id
                        }
                        workout={
                          workout
                        }
                        onStart={
                          handleStartWorkout
                        }
                        onEdit={
                          handleEditWorkout
                        }
                        onDuplicate={
                          handleDuplicateWorkout
                        }
                        onDelete={
                          handleDeleteTemplate
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>

            <section>
              <SectionHeading
                icon={
                  <SparklineIcon />
                }
                title="Workout History"
                description="Your recent completed sessions"
              />

              {history.length === 0 ? (
                <EmptyPanel
                  icon={
                    <History className="h-7 w-7" />
                  }
                  title="No workout history"
                  description="Once you finish a workout, your completed session will appear here."
                  actionLabel="Start Workout"
                  onAction={() =>
                    navigate(
                      "/workout",
                    )
                  }
                />
              ) : (
                <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111111]">
                  <div className="divide-y divide-zinc-800">
                    {history
                      .slice(0, 10)
                      .map(
                        (
                          workout,
                        ) => (
                          <HistoryCard
                            key={
                              workout.id
                            }
                            workout={
                              workout
                            }
                            onDelete={
                              handleDeleteHistory
                            }
                          />
                        ),
                      )}
                  </div>
                </div>
              )}
            </section>

          </div>

          <div className="space-y-6">

            <AIPlanCard
              type="workout"
              title="AI Workout Plan"
              content={
                aiWorkoutPlan
              }
              busy={
                aiBusy ===
                "workout"
              }
              onEdit={() =>
                setAiEdit({
                  type: "workout",
                  title:
                    "Edit Workout Plan",
                  content:
                    aiWorkoutPlan,
                })
              }
              onRegenerate={() =>
                handleRegenerateAI(
                  "workout",
                )
              }
            />

            <AIPlanCard
              type="diet"
              title="AI Diet Plan"
              content={aiDietPlan}
              busy={
                aiBusy === "diet"
              }
              onEdit={() =>
                setAiEdit({
                  type: "diet",
                  title:
                    "Edit Diet Plan",
                  content:
                    aiDietPlan,
                })
              }
              onRegenerate={() =>
                handleRegenerateAI(
                  "diet",
                )
              }
            />

            <QuickActions
              onCreate={() =>
                navigate(
                  "/workout",
                )
              }
              onSetup={() =>
                navigate(
                  "/setup",
                )
              }
              onRefresh={
                loadDashboard
              }
              onCalculator={() =>
                navigate(
                  "/calculator",
                )
              }
              onPrintSummary={() =>
                navigate(
                  "/print-summary",
                )
              }
            />

          </div>

        </div>
      </main>

      {confirm && (
        <ConfirmModal
          title={
            confirm.type ===
            "template"
              ? "Delete saved workout?"
              : "Delete workout history?"
          }
          description={
            confirm.type ===
            "template"
              ? `This will remove "${confirm.name}" from your saved workouts.`
              : `This will permanently remove "${confirm.name}" from workout history.`
          }
          onCancel={() =>
            setConfirm(null)
          }
          onConfirm={
            handleConfirmDelete
          }
        />
      )}

      {aiEdit && (
        <AIEditModal
          state={aiEdit}
          onChange={(content) =>
            setAiEdit({
              ...aiEdit,
              content,
            })
          }
          onCancel={() =>
            setAiEdit(null)
          }
          onSave={
            handleSaveAIEdit
          }
        />
      )}
    </div>
  );
}
function DashboardHeader({
  name,
  goal,
  onRefresh,
  onUpdateProfile,
}: {
  name: string;
  goal: string;
  onRefresh: () => void;
  onUpdateProfile: () => void;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm font-medium text-green-400">
          Welcome back 👋
        </p>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
            Goal: {goal}
          </span>

          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold text-zinc-500">
            Goal Locked
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUpdateProfile}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-black text-black hover:bg-green-400"
        >
          <Pencil className="h-4 w-4" />
          Update Profile
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:border-zinc-600 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
          {icon}
        </div>

        <TrendingUp className="h-4 w-4 text-zinc-700" />
      </div>

      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {helper}
      </p>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">
            {icon}
          </span>

          <h2 className="text-lg font-black text-white">
            {title}
          </h2>
        </div>

        <p className="mt-1 text-sm text-zinc-600">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function ProfileSnapshot({
  profile,
  goal,
}: {
  profile: DashboardProfile | null;
  goal: string;
}) {
  const metrics = [
    [
      "Weight",
      profile?.weight
        ? `${profile.weight} kg`
        : "—",
    ],
    [
      "Height",
      profile?.height
        ? `${profile.height} cm`
        : "—",
    ],
    [
      "BMI",
      profile?.bmi
        ? Number(profile.bmi).toFixed(1)
        : "—",
    ],
    [
      "BMR",
      profile?.bmr
        ? `${Math.round(profile.bmr)} kcal`
        : "—",
    ],
    [
      "TDEE",
      profile?.tdee
        ? `${Math.round(profile.tdee)} kcal`
        : "—",
    ],
  ];

  return (
    <section>
      <SectionHeading
        icon={
          <UserRound className="h-5 w-5" />
        }
        title="Your Profile"
        description="Your current fitness baseline"
      />

      <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Primary Goal
            </p>

            <p className="mt-1 text-lg font-black text-white">
              {goal}
            </p>
          </div>

          <Target className="h-6 w-6 text-green-400" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {metrics.map(
            ([label, value]) => (
              <div
                key={label}
                className="rounded-2xl bg-zinc-950 p-3"
              >
                <p className="text-xs text-zinc-600">
                  {label}
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {value}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 text-base font-black text-white">
        {value}
      </p>
    </div>
  );
}

function RecoverySnapshot({
  profile,
}: {
  profile: DashboardProfile | null;
}) {
  let localProfile:
    | DashboardProfile
    | null = null;

  try {
    const raw =
      localStorage.getItem(
        "apexfit_user_profile",
      );

    if (raw) {
      localProfile =
        JSON.parse(raw) as DashboardProfile;
    }
  } catch {
    localProfile = null;
  }

  const sleep =
    profile?.averageSleep ??
    localProfile?.averageSleep;

  const sleepQuality =
    profile?.sleepQuality ||
    localProfile?.sleepQuality ||
    "—";

  const stress =
    profile?.stress ||
    localProfile?.stress ||
    "—";

  const energy =
    profile?.energy ||
    localProfile?.energy ||
    "—";

  const soreness =
    profile?.soreness ||
    localProfile?.soreness ||
    "—";

  const recovery =
    profile?.recovery ||
    localProfile?.recovery ||
    "—";

  const injuries =
    profile?.injuries ||
    localProfile?.injuries ||
    "None reported";

  return (
    <section>
      <SectionHeading
        icon={
          <HeartPulse className="h-5 w-5" />
        }
        title="Recovery Snapshot"
        description="Training readiness based on your recovery data"
      />

      <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MiniMetric
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Sleep"
            value={
              sleep
                ? `${sleep} hrs`
                : "—"
            }
          />

          <MiniMetric
            icon={
              <HeartPulse className="h-4 w-4" />
            }
            label="Sleep Quality"
            value={sleepQuality}
          />

          <MiniMetric
            icon={
              <Activity className="h-4 w-4" />
            }
            label="Stress"
            value={stress}
          />

          <MiniMetric
            icon={
              <Zap className="h-4 w-4" />
            }
            label="Energy"
            value={energy}
          />

          <MiniMetric
            icon={
              <Activity className="h-4 w-4" />
            }
            label="Soreness"
            value={soreness}
          />

          <MiniMetric
            icon={
              <HeartPulse className="h-4 w-4" />
            }
            label="Recovery"
            value={recovery}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-widest text-zinc-600">
            Injuries / Limitations
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            {injuries}
          </p>
        </div>
      </div>
    </section>
  );
}

function NutritionSnapshot({
  profile,
}: {
  profile: DashboardProfile | null;
}) {
  const calories =
    profile?.calories ??
    profile?.calorieTarget;

  const protein =
    profile?.protein ??
    profile?.proteinTarget;

  const carbs =
    profile?.carbs ??
    profile?.carbohydrates;

  const fats =
    profile?.fats ??
    profile?.fat;

  return (
    <section>
      <SectionHeading
        icon={
          <Flame className="h-5 w-5" />
        }
        title="Daily Nutrition"
        description="Your current nutrition targets"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniMetric
          icon={
            <Flame className="h-4 w-4" />
          }
          label="Calories"
          value={
            calories
              ? `${Math.round(calories)} kcal`
              : "—"
          }
        />

        <MiniMetric
          icon={
            <Dumbbell className="h-4 w-4" />
          }
          label="Protein"
          value={
            protein
              ? `${Math.round(protein)} g`
              : "—"
          }
        />

        <MiniMetric
          icon={
            <Activity className="h-4 w-4" />
          }
          label="Carbs"
          value={
            carbs
              ? `${Math.round(carbs)} g`
              : "—"
          }
        />

        <MiniMetric
          icon={
            <Droplets className="h-4 w-4" />
          }
          label="Fats"
          value={
            fats
              ? `${Math.round(fats)} g`
              : "—"
          }
        />
      </div>
    </section>
  );
}
function WorkoutCard({
  workout,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
}: WorkoutCardProps) {
  const exercises =
    getWorkoutExerciseNames(
      workout.exercises,
    );

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">
            {workout.name ||
              workout.workoutName ||
              "Workout"}
          </h3>

          <p className="mt-1 text-xs text-zinc-600">
            {exercises.length} exercises •{" "}
            {calculateTemplateSets(workout)} sets
          </p>
        </div>

        <Dumbbell className="h-5 w-5 text-green-400" />
      </div>

      {exercises.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {exercises
            .slice(0, 4)
            .map((name) => (
              <span
                key={name}
                className="rounded-lg bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400"
              >
                {name}
              </span>
            ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() =>
            onStart(workout)
          }
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2.5 text-sm font-black text-black hover:bg-green-400"
        >
          <Play className="h-4 w-4" />
          Start
        </button>

        <button
          type="button"
          onClick={() =>
            onEdit(workout)
          }
          className="flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
          title="Edit workout"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            onDuplicate(workout)
          }
          className="flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
          title="Duplicate workout"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          onDelete(workout)
        }
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-zinc-600 hover:bg-red-950/20 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete workout
      </button>
    </div>
  );
}

function HistoryCard({
  workout,
  onDelete,
}: HistoryCardProps) {
  const completedSets =
    calculateCompletedSets(workout);

  const volume =
    calculateHistoryVolume(workout);

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
          <Trophy className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-white">
            {workout.name ||
              workout.workoutName ||
              "Workout"}
          </h3>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600">
            <span>
              {workout.completedAt
                ? formatDate(
                    workout.completedAt,
                  )
                : "Completed"}
            </span>

            <span>
              {completedSets} sets
            </span>

            <span>
              {formatVolume(volume)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onDelete(workout)
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:bg-red-950/20 hover:text-red-400"
        title="Delete history"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#111111] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-green-400"
      >
        <Plus className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
  );
}

function EmptySmall({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-center">
      <p className="text-sm font-bold text-zinc-400">
        {title}
      </p>

      <p className="mt-1 text-xs text-zinc-700">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-[#111111] p-4 text-left hover:border-zinc-700"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-green-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-zinc-600">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400" />
    </button>
  );
}

function QuickActions({
  onCreate,
  onSetup,
  onRefresh,
  onCalculator,
  onPrintSummary,
}: {
  onCreate: () => void;
  onSetup: () => void;
  onRefresh: () => void;
  onCalculator: () => void;
  onPrintSummary: () => void;
}) {
  return (
    <section>
      <SectionHeading
        icon={
          <Zap className="h-5 w-5" />
        }
        title="Quick Actions"
        description="Manage your ApexFit journey"
      />

      <div className="space-y-3">
        <QuickAction
          icon={
            <Plus className="h-5 w-5" />
          }
          title="Create Workout"
          description="Build a new training session"
          onClick={onCreate}
        />

        <QuickAction
          icon={
            <BarChart3 className="h-5 w-5" />
          }
          title="Fitness Calculator"
          description="Calculate BMI, BMR and TDEE"
          onClick={onCalculator}
        />

        <QuickAction
          icon={
            <History className="h-5 w-5" />
          }
          title="Print Summary"
          description="View and print your fitness summary"
          onClick={onPrintSummary}
        />

        <QuickAction
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Update Profile"
          description="Edit your body, training and nutrition information"
          onClick={onSetup}
        />

        <QuickAction
          icon={
            <RefreshCw className="h-5 w-5" />
          }
          title="Refresh Dashboard"
          description="Load your latest ApexFit data"
          onClick={onRefresh}
        />
      </div>
    </section>
  );
}

function SparklineIcon() {
  return (
    <BarChart3 className="h-5 w-5" />
  );
}
function AIPlanCard({
  type,
  title,
  content,
  busy,
  onEdit,
  onRegenerate,
}: {
  type: AIPlanType;
  title: string;
  content: string;
  busy: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
}) {
  const preview = content
    ? content.slice(0, 700)
    : "";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
            <Zap className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-black text-white">
              {title}
            </h2>

            <p className="text-xs text-zinc-600">
              Gemini personalized plan
            </p>
          </div>
        </div>

        <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-bold text-green-400">
          AI
        </span>
      </div>

      {content ? (
        <div className="mt-5 rounded-2xl bg-zinc-950 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-400">
            {preview}
            {content.length > 700
              ? "..."
              : ""}
          </p>
        </div>
      ) : (
        <EmptySmall
          title={`No ${type} plan yet`}
          description="Generate a personalized plan using your ApexFit profile."
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={!content}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-zinc-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2.5 text-sm font-black text-black hover:bg-green-400 disabled:opacity-50"
        >
          <RefreshCw
            className={
              busy
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          {busy
            ? "Generating..."
            : "Regenerate"}
        </button>
      </div>
    </section>
  );
}

function AIEditModal({
  state,
  onChange,
  onCancel,
  onSave,
}: {
  state: Exclude<AIEditState, null>;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#111111] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white">
              {state.title}
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Modify your AI-generated plan.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          value={state.content}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          rows={16}
          className="mt-5 w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300 outline-none focus:border-green-500"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-green-500 px-4 py-3 text-sm font-black text-black hover:bg-green-400"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111111] p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-xl font-black text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}