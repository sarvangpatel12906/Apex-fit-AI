/* =========================================================
   APEXFIT AI
   WORKOUT STORAGE ENGINE

   ONE SOURCE OF TRUTH FOR:
   - WorkoutPage
   - DashboardPage
   - WorkoutSummaryPage

   STORAGE:
   - localStorage = local cache / fallback
   - ApexFit AI backend = workout persistence
   ========================================================= */

export const WORKOUT_TEMPLATES_KEY =
  "apexfit_workout_templates";

export const WORKOUT_HISTORY_KEY =
  "apexfit-workout-history";

export const LAST_WORKOUT_KEY =
  "apexfit-last-workout-result";

export const ACTIVE_WORKOUT_KEY =
  "apexfit_active_workout";

/*
 * Old keys used by previous versions.
 * They are retained only for migration/cleanup.
 */
const OLD_TEMPLATES_KEY =
  "apexfit-workout-templates";

const OLD_RESULTS_KEY =
  "apexfit_workout_results";

const OLD_LAST_RESULT_KEY =
  "apexfit_last_workout_result";

/* =========================================================
   BACKEND
   ========================================================= */

const API_BASE_URL = "http://localhost:5002/api";

/* =========================================================
   TYPES
   ========================================================= */

export type Goal =
  | "Hyrox"
  | "Competitive"
  | "Athletic"
  | "General"
  | "Fat Loss"
  | "Muscle Building"
  | "Recomposition"
  | "Heavy Lifting"
  | "Powerlifting"
  | "Olympic";

export type SetLog = {
  setNumber: number;
  reps: number;
  weight: number;
  rir: number;
  completed: boolean;
  completedAt: string;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  muscle: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  description?: string;
  reason: string;

  recommended: boolean;

  sets: number;
  reps: number;
  weight: number;
  previousWeight: number;
  rir: number;

  completedSets: SetLog[];

  startedAt: number | null;
  completedAt: number | null;
};

export type WorkoutTemplate = {
  id: string;

  name: string;

  workoutName?: string;

  goal: Goal;

  sport: string;

  createdAt: string;

  updatedAt: string;

  exercises: WorkoutExercise[];
};

export type WorkoutResult = {
  id: string;

  name: string;
  workoutName: string;

  goal: string;

  sport: string;

  templateId?: string;

  startedAt: string;

  completedAt: string;

  durationSeconds: number;

  totalDurationSeconds: number;

  exercises: WorkoutExercise[];

  totalVolume: number;

  totalSets: number;

  beforePhoto: string | null;

  afterPhoto: string | null;
};

/* =========================================================
   SAFE JSON
   ========================================================= */

function readJSON<T>(
  key: string,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(
  key: string,
  value: unknown,
): void {
  localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

/* =========================================================
   EVENT
   ========================================================= */

export function notifyWorkoutUpdate(): void {
  window.dispatchEvent(
    new Event("apexfit-workout-updated"),
  );
}

/* =========================================================
   ID
   ========================================================= */

export function createWorkoutId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/* =========================================================
   SET CREATOR
   ========================================================= */

export function createSetLogs(
  count: number,
  reps: number,
  weight: number,
  rir: number,
): SetLog[] {
  return Array.from(
    {
      length: Math.max(1, count),
    },
    (_, index) => ({
      setNumber: index + 1,
      reps,
      weight,
      rir,
      completed: false,
      completedAt: "",
    }),
  );
}

/* =========================================================
   NORMALIZE SET
   ========================================================= */

function normalizeSet(
  set: any,
  index: number,
): SetLog {
  const completedAt =
    typeof set?.completedAt === "string"
      ? set.completedAt
      : "";

  const completed = Boolean(
    set?.completed || completedAt,
  );

  return {
    setNumber:
      Number(set?.setNumber) ||
      index + 1,

    reps:
      Number(set?.reps) || 0,

    weight:
      Number(set?.weight) || 0,

    rir:
      Number(set?.rir) || 0,

    completed,

    completedAt: completed
      ? completedAt ||
        new Date().toISOString()
      : "",
  };
}

/* =========================================================
   NORMALIZE EXERCISE
   ========================================================= */

export function normalizeExercise(
  exercise: any,
): WorkoutExercise {
  const sets =
    Array.isArray(exercise?.completedSets)
      ? exercise.completedSets
      : createSetLogs(
          Number(exercise?.sets) || 3,
          Number(exercise?.reps) || 10,
          Number(exercise?.weight) || 0,
          Number(exercise?.rir) || 2,
        );

  return {
    id: String(
      exercise?.id ??
        createWorkoutId(),
    ),

    name: String(
      exercise?.name ?? "Exercise",
    ),

    muscle: String(
      exercise?.muscle ?? "General",
    ),

    category: String(
      exercise?.category ?? "General",
    ),

    equipment:
      exercise?.equipment,

    difficulty:
      exercise?.difficulty,

    description:
      exercise?.description,

    reason: String(
      exercise?.reason ??
        "Selected for your workout.",
    ),

    recommended: Boolean(
      exercise?.recommended,
    ),

    sets:
      Number(exercise?.sets) ||
      sets.length ||
      3,

    reps:
      Number(exercise?.reps) || 10,

    weight:
      Number(exercise?.weight) || 0,

    previousWeight:
      Number(exercise?.previousWeight) || 0,

    rir:
      Number(exercise?.rir) || 2,

    completedSets:
      sets.map(normalizeSet),

    startedAt:
      typeof exercise?.startedAt ===
      "number"
        ? exercise.startedAt
        : null,

    completedAt:
      typeof exercise?.completedAt ===
      "number"
        ? exercise.completedAt
        : null,
  };
}

/* =========================================================
   NORMALIZE TEMPLATE
   ========================================================= */

export function normalizeTemplate(
  template: any,
): WorkoutTemplate {
  const name = String(
    template?.name ??
      template?.workoutName ??
      "My Workout",
  );

  return {
    id: String(
      template?.id ??
        createWorkoutId(),
    ),

    name,

    workoutName: name,

    goal:
      template?.goal ??
      "General",

    sport: String(
      template?.sport ?? "",
    ),

    createdAt: String(
      template?.createdAt ??
        new Date().toISOString(),
    ),

    updatedAt: String(
      template?.updatedAt ??
        new Date().toISOString(),
    ),

    exercises:
      Array.isArray(
        template?.exercises,
      )
        ? template.exercises.map(
            normalizeExercise,
          )
        : [],
  };
}

/* =========================================================
   VOLUME
   ========================================================= */

export function calculateVolume(
  exercises: WorkoutExercise[],
): number {
  return exercises.reduce(
    (total, exercise) =>
      total +
      exercise.completedSets.reduce(
        (exerciseTotal, set) =>
          exerciseTotal +
          set.weight * set.reps,
        0,
      ),
    0,
  );
}

/* =========================================================
   TOTAL SETS
   ========================================================= */

export function calculateCompletedSets(
  exercises: WorkoutExercise[],
): number {
  return exercises.reduce(
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

/* =========================================================
   READ TEMPLATES
   ========================================================= */

export function getWorkoutTemplates():
  WorkoutTemplate[] {
  const current =
    readJSON<any[]>(
      WORKOUT_TEMPLATES_KEY,
      [],
    );

  if (
    Array.isArray(current) &&
    current.length > 0
  ) {
    return current.map(
      normalizeTemplate,
    );
  }

  const old =
    readJSON<any[]>(
      OLD_TEMPLATES_KEY,
      [],
    );

  if (
    Array.isArray(old) &&
    old.length > 0
  ) {
    const migrated =
      old.map(normalizeTemplate);

    writeJSON(
      WORKOUT_TEMPLATES_KEY,
      migrated,
    );

    return migrated;
  }

  return [];
}

/* =========================================================
   SAVE TEMPLATES
   ========================================================= */

function saveTemplates(
  templates: WorkoutTemplate[],
): void {
  writeJSON(
    WORKOUT_TEMPLATES_KEY,
    templates,
  );

  writeJSON(
    OLD_TEMPLATES_KEY,
    templates,
  );
}

/* =========================================================
   SAVE TEMPLATE
   ========================================================= */

export function saveWorkoutTemplate(
  template: WorkoutTemplate,
): WorkoutTemplate {
  const normalized =
    normalizeTemplate(template);

  const templates =
    getWorkoutTemplates();

  const index =
    templates.findIndex(
      (item) =>
        item.id ===
        normalized.id,
    );

  if (index >= 0) {
    templates[index] =
      normalized;
  } else {
    templates.unshift(
      normalized,
    );
  }

  saveTemplates(templates);

  notifyWorkoutUpdate();

  return normalized;
}

/* =========================================================
   DELETE TEMPLATE
   ========================================================= */

export function deleteWorkoutTemplate(
  id: string,
): boolean {
  const templates =
    getWorkoutTemplates();

  const updated =
    templates.filter(
      (item) =>
        item.id !== id,
    );

  if (
    updated.length ===
    templates.length
  ) {
    return false;
  }

  saveTemplates(updated);

  const active =
    getActiveWorkout();

  if (active?.id === id) {
    clearActiveWorkout();
  }

  notifyWorkoutUpdate();

  return true;
}

/* =========================================================
   NORMALIZE RESULT
   ========================================================= */

export function normalizeResult(
  result: any,
): WorkoutResult {
  const exercises =
    Array.isArray(
      result?.exercises,
    )
      ? result.exercises.map(
          normalizeExercise,
        )
      : [];

  const duration =
    Number(
      result?.durationSeconds ??
        result?.totalDurationSeconds ??
        0,
    ) || 0;

  const name = String(
    result?.name ??
      result?.workoutName ??
      "Workout",
  );

  return {
    id: String(
      result?.id ??
        createWorkoutId(),
    ),

    name,

    workoutName: name,

    goal: String(
      result?.goal ?? "General",
    ),

    sport: String(
      result?.sport ?? "",
    ),

    templateId:
      result?.templateId,

    startedAt: String(
      result?.startedAt ??
        new Date().toISOString(),
    ),

    completedAt: String(
      result?.completedAt ??
        new Date().toISOString(),
    ),

    durationSeconds:
      duration,

    totalDurationSeconds:
      duration,

    exercises,

    totalVolume:
      Number(result?.totalVolume) ||
      calculateVolume(exercises),

    totalSets:
      Number(result?.totalSets) ||
      calculateCompletedSets(
        exercises,
      ),

    beforePhoto:
      result?.beforePhoto ?? null,

    afterPhoto:
      result?.afterPhoto ?? null,
  };
}

/* =========================================================
   READ HISTORY
   ========================================================= */

export function getWorkoutHistory():
  WorkoutResult[] {
  const current =
    readJSON<any[]>(
      WORKOUT_HISTORY_KEY,
      [],
    );

  if (
    Array.isArray(current) &&
    current.length > 0
  ) {
    return current.map(
      normalizeResult,
    );
  }

  const old =
    readJSON<any[]>(
      OLD_RESULTS_KEY,
      [],
    );

  if (
    Array.isArray(old) &&
    old.length > 0
  ) {
    const migrated =
      old.map(normalizeResult);

    writeJSON(
      WORKOUT_HISTORY_KEY,
      migrated,
    );

    return migrated;
  }

  return [];
}

/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveHistory(
  history: WorkoutResult[],
): void {
  writeJSON(
    WORKOUT_HISTORY_KEY,
    history,
  );

  writeJSON(
    OLD_RESULTS_KEY,
    history,
  );
}

/* =========================================================
   BACKEND SAVE
   ========================================================= */

async function saveWorkoutToBackend(
  workout: WorkoutResult,
): Promise<WorkoutResult | null> {
  try {
    const response =
      await fetch(
        `${API_BASE_URL}/workouts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            workout,
          ),
        },
      );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as {
        success?: boolean;
        workout?: WorkoutResult;
      };

    if (
      !data.success ||
      !data.workout
    ) {
      return null;
    }

    return normalizeResult(
      data.workout,
    );
  } catch {
    /*
     * Local storage remains the fallback
     * if the backend is unavailable.
     */
    return null;
  }
}

/* =========================================================
   SAVE WORKOUT RESULT
   ========================================================= */

export function saveWorkoutResult(
  result: WorkoutResult,
): WorkoutResult {
  const normalized =
    normalizeResult(result);

  const history =
    getWorkoutHistory();

  const index =
    history.findIndex(
      (item) =>
        item.id ===
        normalized.id,
    );

  if (index >= 0) {
    history[index] =
      normalized;
  } else {
    history.unshift(
      normalized,
    );
  }

  /*
   * Save locally immediately.
   * This keeps the current UI working.
   */
  saveHistory(history);

  writeJSON(
    LAST_WORKOUT_KEY,
    normalized,
  );

  writeJSON(
    OLD_LAST_RESULT_KEY,
    normalized,
  );

  notifyWorkoutUpdate();

  /*
   * Send the same workout to the backend.
   *
   * This is intentionally not awaited so
   * existing pages do not need to become async.
   */
  void saveWorkoutToBackend(
    normalized,
  );

  return normalized;
}

/* =========================================================
   REFRESH HISTORY FROM BACKEND
   ========================================================= */

export async function refreshWorkoutHistory():
  Promise<WorkoutResult[]> {
  try {
    const response =
      await fetch(
        `${API_BASE_URL}/workouts`,
      );

    if (!response.ok) {
      return getWorkoutHistory();
    }

    const data =
      (await response.json()) as {
        success?: boolean;
        workouts?: WorkoutResult[];
      };

    if (
      !data.success ||
      !Array.isArray(
        data.workouts,
      )
    ) {
      return getWorkoutHistory();
    }

    const history =
      data.workouts.map(
        normalizeResult,
      );

    saveHistory(history);

    if (history.length > 0) {
      writeJSON(
        LAST_WORKOUT_KEY,
        history[0],
      );

      writeJSON(
        OLD_LAST_RESULT_KEY,
        history[0],
      );
    }

    notifyWorkoutUpdate();

    return history;
  } catch {
    return getWorkoutHistory();
  }
}

/* =========================================================
   GET LATEST
   ========================================================= */

export function getLatestWorkout():
  WorkoutResult | null {
  const history =
    getWorkoutHistory();

  if (history.length > 0) {
    return history[0];
  }

  const stored =
    readJSON<any | null>(
      LAST_WORKOUT_KEY,
      null,
    );

  if (stored) {
    return normalizeResult(
      stored,
    );
  }

  const old =
    readJSON<any | null>(
      OLD_LAST_RESULT_KEY,
      null,
    );

  if (old) {
    const migrated =
      normalizeResult(old);

    writeJSON(
      LAST_WORKOUT_KEY,
      migrated,
    );

    return migrated;
  }

  return null;
}

/* =========================================================
   UPDATE COMPLETED WORKOUT
   ========================================================= */

export function updateWorkoutResult(
  result: WorkoutResult,
): WorkoutResult {
  return saveWorkoutResult(
    result,
  );
}

/* =========================================================
   BACKEND DELETE
   ========================================================= */

async function deleteWorkoutFromBackend(
  id: string,
): Promise<boolean> {
  try {
    const response =
      await fetch(
        `${API_BASE_URL}/workouts/${encodeURIComponent(
          id,
        )}`,
        {
          method: "DELETE",
        },
      );

    if (!response.ok) {
      return false;
    }

    const data =
      (await response.json()) as {
        success?: boolean;
      };

    return Boolean(
      data.success,
    );
  } catch {
    return false;
  }
}

/* =========================================================
   DELETE COMPLETED WORKOUT
   ========================================================= */

export function deleteWorkoutResult(
  id: string,
): boolean {
  const history =
    getWorkoutHistory();

  const exists =
    history.some(
      (item) =>
        item.id === id,
    );

  if (!exists) {
    return false;
  }

  const updated =
    history.filter(
      (item) =>
        item.id !== id,
    );

  saveHistory(updated);

  const latest =
    updated[0] ?? null;

  if (latest) {
    writeJSON(
      LAST_WORKOUT_KEY,
      latest,
    );

    writeJSON(
      OLD_LAST_RESULT_KEY,
      latest,
    );
  } else {
    localStorage.removeItem(
      LAST_WORKOUT_KEY,
    );

    localStorage.removeItem(
      OLD_LAST_RESULT_KEY,
    );
  }

  const active =
    getActiveWorkout();

  if (active?.id === id) {
    clearActiveWorkout();
  }

  notifyWorkoutUpdate();

  /*
   * Delete the same workout from
   * the backend.
   */
  void deleteWorkoutFromBackend(
    id,
  );

  return true;
}

/* =========================================================
   ACTIVE WORKOUT
   ========================================================= */

export function getActiveWorkout():
  | WorkoutTemplate
  | null {
  const stored =
    readJSON<any | null>(
      ACTIVE_WORKOUT_KEY,
      null,
    );

  if (!stored) {
    return null;
  }

  return normalizeTemplate(
    stored,
  );
}

export function setActiveWorkout(
  workout: WorkoutTemplate,
): void {
  writeJSON(
    ACTIVE_WORKOUT_KEY,
    normalizeTemplate(workout),
  );
}

export function clearActiveWorkout(): void {
  localStorage.removeItem(
    ACTIVE_WORKOUT_KEY,
  );
}

/* =========================================================
   CLEAR EVERYTHING
   ========================================================= */

export function clearWorkoutStorage(): void {
  localStorage.removeItem(
    WORKOUT_TEMPLATES_KEY,
  );

  localStorage.removeItem(
    WORKOUT_HISTORY_KEY,
  );

  localStorage.removeItem(
    LAST_WORKOUT_KEY,
  );

  localStorage.removeItem(
    ACTIVE_WORKOUT_KEY,
  );

  localStorage.removeItem(
    OLD_TEMPLATES_KEY,
  );

  localStorage.removeItem(
    OLD_RESULTS_KEY,
  );

  localStorage.removeItem(
    OLD_LAST_RESULT_KEY,
  );

  notifyWorkoutUpdate();
}