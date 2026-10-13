import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  type Goal,
  type WorkoutExercise,
  type WorkoutTemplate,
  type WorkoutResult,
  createWorkoutId,
  createSetLogs,
  getWorkoutTemplates,
  getActiveWorkout,
  saveWorkoutTemplate,
  deleteWorkoutTemplate,
  saveWorkoutResult,
  setActiveWorkout,
  clearActiveWorkout,
} from "../utils/WorkoutStorage";

/* =========================================================
   APEXFIT AI
   WORKOUT PAGE
   ========================================================= */

/* =========================================================
   EXERCISE DATABASE
   ========================================================= */

type Exercise = {
  id: number;
  name: string;
  muscle: string;
  category: string;
  equipment: string;
  difficulty: string;
  reason: string;
  goals: Goal[];
  sports: string[];
};

const exerciseDatabase: Exercise[] = [
  {
    id: 1,
    name: "Barbell Bench Press",
    muscle: "Chest",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Intermediate",
    reason:
      "Builds pressing strength and overall chest mass.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Powerlifting",
      "General",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscle: "Upper Chest",
    category: "Hypertrophy",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    reason:
      "Targets the upper chest while allowing a natural pressing path.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 3,
    name: "Push Ups",
    muscle: "Chest",
    category: "Bodyweight",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reason:
      "Develops chest, shoulders and triceps with bodyweight resistance.",
    goals: [
      "Fat Loss",
      "Athletic",
      "Competitive",
      "General",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 4,
    name: "Lat Pulldown",
    muscle: "Lats",
    category: "Pull",
    equipment: "Cable",
    difficulty: "Beginner",
    reason:
      "Develops vertical pulling strength and back width.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "General",
    ],
    sports: [],
  },

  {
    id: 5,
    name: "Barbell Row",
    muscle: "Mid Back",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Intermediate",
    reason:
      "Builds back thickness and pulling strength.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Powerlifting",
      "Athletic",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 6,
    name: "Seated Cable Row",
    muscle: "Upper Back",
    category: "Pull",
    equipment: "Cable",
    difficulty: "Beginner",
    reason:
      "Provides controlled horizontal pulling volume for back development.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "General",
    ],
    sports: [],
  },

  {
    id: 7,
    name: "Pull Ups",
    muscle: "Lats",
    category: "Bodyweight",
    equipment: "Pull Up Bar",
    difficulty: "Intermediate",
    reason:
      "Builds back width, grip strength and relative pulling strength.",
    goals: [
      "Athletic",
      "Competitive",
      "Hyrox",
      "Muscle Building",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 8,
    name: "Overhead Press",
    muscle: "Shoulders",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Intermediate",
    reason:
      "Develops shoulder pressing strength and upper-body stability.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Powerlifting",
      "Athletic",
    ],
    sports: [],
  },
  {
    id: 9,
    name: "Dumbbell Lateral Raise",
    muscle: "Side Delts",
    category: "Isolation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    reason:
      "Emphasizes the lateral deltoids to improve shoulder width.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 10,
    name: "Rear Delt Fly",
    muscle: "Rear Delts",
    category: "Isolation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    reason:
      "Strengthens the rear delts and supports balanced shoulder development.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 11,
    name: "Barbell Squat",
    muscle: "Quads",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Intermediate",
    reason:
      "Builds lower-body strength and overall leg development.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Powerlifting",
      "Athletic",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 12,
    name: "Leg Press",
    muscle: "Quads",
    category: "Machine",
    equipment: "Machine",
    difficulty: "Beginner",
    reason:
      "Allows high lower-body training volume with controlled resistance.",
    goals: [
      "Muscle Building",
      "Fat Loss",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 13,
    name: "Leg Extension",
    muscle: "Quads",
    category: "Isolation",
    equipment: "Machine",
    difficulty: "Beginner",
    reason:
      "Directly trains the quadriceps through knee extension.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 14,
    name: "Leg Curl",
    muscle: "Hamstrings",
    category: "Isolation",
    equipment: "Machine",
    difficulty: "Beginner",
    reason:
      "Directly trains the hamstrings through knee flexion.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 15,
    name: "Romanian Deadlift",
    muscle: "Posterior Chain",
    category: "Hinge",
    equipment: "Barbell",
    difficulty: "Intermediate",
    reason:
      "Builds hamstrings, glutes and hip-hinge strength.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Athletic",
      "Powerlifting",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 16,
    name: "Barbell Hip Thrust",
    muscle: "Glutes",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Beginner",
    reason:
      "Develops glute strength and hip extension power.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Athletic",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 17,
    name: "Standing Calf Raise",
    muscle: "Calves",
    category: "Isolation",
    equipment: "Machine",
    difficulty: "Beginner",
    reason:
      "Develops calf strength and lower-leg musculature.",
    goals: [
      "Muscle Building",
      "Recomposition",
      "Athletic",
    ],
    sports: ["Cricket", "Football"],
  },
  {
    id: 18,
    name: "Dumbbell Biceps Curl",
    muscle: "Biceps",
    category: "Isolation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    reason:
      "Direct biceps training for arm strength and hypertrophy.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 19,
    name: "Hammer Curl",
    muscle: "Brachialis",
    category: "Isolation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    reason:
      "Trains the brachialis and forearms while supporting arm thickness.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 20,
    name: "Cable Triceps Pushdown",
    muscle: "Triceps",
    category: "Isolation",
    equipment: "Cable",
    difficulty: "Beginner",
    reason:
      "Provides controlled triceps volume.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 21,
    name: "Overhead Triceps Extension",
    muscle: "Triceps",
    category: "Isolation",
    equipment: "Cable",
    difficulty: "Beginner",
    reason:
      "Emphasizes the long head of the triceps.",
    goals: [
      "Muscle Building",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 22,
    name: "Cable Crunch",
    muscle: "Core",
    category: "Core",
    equipment: "Cable",
    difficulty: "Beginner",
    reason:
      "Provides progressive resistance for abdominal flexion.",
    goals: [
      "Muscle Building",
      "Fat Loss",
      "Recomposition",
    ],
    sports: [],
  },

  {
    id: 23,
    name: "Plank",
    muscle: "Core",
    category: "Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reason:
      "Develops trunk stability and anti-extension strength.",
    goals: [
      "Fat Loss",
      "Athletic",
      "Competitive",
      "Hyrox",
      "General",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 24,
    name: "Russian Twist",
    muscle: "Obliques",
    category: "Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reason:
      "Trains rotational control and oblique strength.",
    goals: [
      "Fat Loss",
      "Athletic",
      "Competitive",
      "Hyrox",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 25,
    name: "Farmer's Walk",
    muscle: "Grip",
    category: "Conditioning",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    reason:
      "Develops grip, trunk stability and loaded-carry capacity.",
    goals: [
      "Athletic",
      "Competitive",
      "Hyrox",
      "General",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 26,
    name: "Burpees",
    muscle: "Full Body",
    category: "Conditioning",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    reason:
      "Combines strength and conditioning in a full-body movement.",
    goals: [
      "Fat Loss",
      "Athletic",
      "Competitive",
      "Hyrox",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 27,
    name: "Box Jump",
    muscle: "Legs",
    category: "Power",
    equipment: "Box",
    difficulty: "Intermediate",
    reason:
      "Develops explosive lower-body power.",
    goals: [
      "Athletic",
      "Competitive",
      "Hyrox",
    ],
    sports: ["Cricket", "Football"],
  },

  {
    id: 28,
    name: "Deadlift",
    muscle: "Posterior Chain",
    category: "Compound",
    equipment: "Barbell",
    difficulty: "Advanced",
    reason:
      "Develops total-body pulling strength and posterior-chain power.",
    goals: [
      "Powerlifting",
      "Athletic",
      "Muscle Building",
    ],
    sports: ["Cricket", "Football"],
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(
  seconds: number,
): string {
  const safe =
    Math.max(
      0,
      Math.floor(seconds),
    );

  const hours =
    Math.floor(
      safe / 3600,
    );

  const minutes =
    Math.floor(
      (safe % 3600) / 60,
    );

  const secondsLeft =
    safe % 60;

  if (hours > 0) {
    return `${String(
      hours,
    ).padStart(
      2,
      "0",
    )}:${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}:${String(
      secondsLeft,
    ).padStart(
      2,
      "0",
    )}`;
  }

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    secondsLeft,
  ).padStart(
    2,
    "0",
  )}`;
}

function createExercise(
  exercise: Exercise,
): WorkoutExercise {
  return {
    id: String(
      exercise.id,
    ),

    name:
      exercise.name,

    muscle:
      exercise.muscle,

    category:
      exercise.category,

    equipment:
      exercise.equipment,

    difficulty:
      exercise.difficulty,

    reason:
      exercise.reason,

    recommended:
      true,

    sets: 3,

    reps: 10,

    weight: 0,

    previousWeight: 0,

    rir: 2,

    completedSets:
      createSetLogs(
        3,
        10,
        0,
        2,
      ),

    startedAt:
      null,

    completedAt:
      null,
  };
}

function cloneExercise(
  exercise: WorkoutExercise,
): WorkoutExercise {
  return {
    ...exercise,

    completedSets:
      exercise.completedSets.map(
        (set) => ({
          ...set,
        }),
      ),
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function WorkoutPage() {
  const navigate =
    useNavigate();

  /* -------------------------------------------------------
     BUILDER
     ------------------------------------------------------- */

  const [workoutName, setWorkoutName] =
    useState(
      "My Workout",
    );

  const [goal, setGoal] =
    useState<Goal>(
      "Muscle Building",
    );

  const [sport, setSport] =
    useState("");

  const [selectedExercises, setSelectedExercises] =
    useState<
      WorkoutExercise[]
    >([]);

  const [templates, setTemplates] =
    useState<
      WorkoutTemplate[]
    >([]);

  const [editingTemplateId, setEditingTemplateId] =
    useState<
      string | null
    >(null);

  /* -------------------------------------------------------
     ACTIVE SESSION
     ------------------------------------------------------- */

  const [started, setStarted] =
    useState(false);

  const [sessionExercises, setSessionExercises] =
    useState<
      WorkoutExercise[]
    >([]);

  const [activeExerciseIndex, setActiveExerciseIndex] =
    useState(0);

  const [sessionStartTime, setSessionStartTime] =
    useState<
      number | null
    >(null);

  const [elapsed, setElapsed] =
    useState(0);

  /* -------------------------------------------------------
     REST TIMER
     ------------------------------------------------------- */

  const [restDuration] =
  useState(60);

  const [restRemaining, setRestRemaining] =
    useState(0);

  const [restRunning, setRestRunning] =
    useState(false);

  /* -------------------------------------------------------
     PHOTOS
     ------------------------------------------------------- */

  const [beforePhoto, setBeforePhoto] =
    useState<
      string | null
    >(null);

  const [afterPhoto, setAfterPhoto] =
    useState<
      string | null
    >(null);

  /* -------------------------------------------------------
     UI
     ------------------------------------------------------- */

  const [showSaved, setShowSaved] =
    useState(false);

  const [showFinish, setShowFinish] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =======================================================
     LOAD TEMPLATES
     ======================================================= */

  useEffect(() => {
    setTemplates(
      getWorkoutTemplates(),
    );

    // Dashboard -> Edit stores the workout in the active-workout
    // slot before navigating here. Load that workout into the
    // builder instead of starting with a blank/new workout.
    const activeWorkout = getActiveWorkout();

    if (activeWorkout) {
      setWorkoutName(
        activeWorkout.name,
      );
      setGoal(
        activeWorkout.goal,
      );
      setSport(
        activeWorkout.sport,
      );
      setSelectedExercises(
        activeWorkout.exercises.map(
          cloneExercise,
        ),
      );
      setEditingTemplateId(
        activeWorkout.id,
      );
      setMessage(
        "Editing saved workout.",
      );

      // This hand-off is only for opening the builder in edit mode.
      // Do not leave it behind as stale state for the next visit.
      clearActiveWorkout();
    }
  }, []);

  /* =======================================================
     WORKOUT STOPWATCH
     ======================================================= */
     useEffect(() => {
    if (
      !started ||
      sessionStartTime ===
        null
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setElapsed(
            Math.floor(
              (Date.now() -
                sessionStartTime) /
                1000,
            ),
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [
    started,
    sessionStartTime,
  ]);

  /* =======================================================
     REST TIMER
     ======================================================= */

  useEffect(() => {
    if (
      !restRunning ||
      restRemaining <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setRestRemaining(
            (current) => {
              if (
                current <= 1
              ) {
                setRestRunning(
                  false,
                );

                return 0;
              }

              return current - 1;
            },
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [
    restRunning,
    restRemaining,
  ]);

  /* =======================================================
     AI RECOMMENDATIONS
     ======================================================= */

  const recommendations =
    useMemo(() => {
      const selectedIds =
        selectedExercises.map(
          (exercise) =>
            Number(
              exercise.id,
            ),
        );

      let candidates =
        exerciseDatabase.filter(
          (exercise) =>
            exercise.goals.includes(
              goal,
            ) &&
            !selectedIds.includes(
              exercise.id,
            ),
        );

      if (sport) {
        const sportMatches =
          candidates.filter(
            (exercise) =>
              exercise.sports.includes(
                sport,
              ),
          );

        candidates = [
          ...sportMatches,
          ...candidates.filter(
            (exercise) =>
              !sportMatches.includes(
                exercise,
              ),
          ),
        ];
      }

      const muscleOrder = [
        "Chest",
        "Upper Chest",
        "Lats",
        "Upper Back",
        "Mid Back",
        "Shoulders",
        "Side Delts",
        "Rear Delts",
        "Quads",
        "Hamstrings",
        "Glutes",
        "Posterior Chain",
        "Calves",
        "Biceps",
        "Brachialis",
        "Triceps",
        "Core",
        "Obliques",
        "Full Body",
        "Legs",
        "Grip",
      ];

      const result: Exercise[] =
        [];

      for (
        const muscle of muscleOrder
      ) {
        const match =
          candidates.find(
            (exercise) =>
              exercise.muscle ===
              muscle,
          );

        if (match) {
          result.push(
            match,
          );
        }

        if (
          result.length >= 8
        ) {
          break;
        }
      }

      if (
        result.length < 8
      ) {
        for (
          const exercise of candidates
        ) {
          if (
            result.length >=
            8
          ) {
            break;
          }

          if (
            !result.some(
              (item) =>
                item.id ===
                exercise.id,
            )
          ) {
            result.push(
              exercise,
            );
          }
        }
      }

      return result;
    }, [
      goal,
      sport,
      selectedExercises,
    ]);

  /* =======================================================
     ADD RECOMMENDATION
     ======================================================= */

  function addExercise(
    exercise: Exercise,
  ) {
    setSelectedExercises(
      (current) => [
        ...current,
        createExercise(
          exercise,
        ),
      ],
    );

    setMessage(
      `${exercise.name} added.`,
    );
  }

  /* =======================================================
     REMOVE EXERCISE
     ======================================================= */

  function removeExercise(
    id: string,
  ) {
    setSelectedExercises(
      (current) =>
        current.filter(
          (exercise) =>
            exercise.id !== id,
        ),
    );
  }

  /* =======================================================
     UPDATE BUILDER EXERCISE
     ======================================================= */

  function updateExercise(
    id: string,
    field:
      | "sets"
      | "reps"
      | "weight"
      | "rir",
    value: number,
  ) {
    setSelectedExercises(
      (current) =>
        current.map(
          (exercise) => {
            if (
              exercise.id !==
              id
            ) {
              return exercise;
            }

            const updated = {
              ...exercise,
              [field]: value,
            };

            if (
              field ===
                "sets" ||
              field ===
                "reps"
            ) {
              updated.completedSets =
                createSetLogs(
                  updated.sets,
                  updated.reps,
                  updated.weight,
                  updated.rir,
                );
            }

            return updated;
          },
        ),
    );
  }

  /* =======================================================
     SAVE / UPDATE TEMPLATE
     ======================================================= */

  function saveTemplate() {
    if (
      selectedExercises.length ===
      0
    ) {
      setMessage(
        "Add at least one exercise first.",
      );

      return;
    }

    const now =
      new Date().toISOString();

    const existing =
      templates.find(
        (template) =>
          template.id ===
          editingTemplateId,
      );

    const template: WorkoutTemplate =
      {
        id:
          editingTemplateId ||
          createWorkoutId(),

        name:
          workoutName.trim() ||
          "My Workout",

        workoutName:
          workoutName.trim() ||
          "My Workout",

        goal,

        sport,

        createdAt:
          existing?.createdAt ||
          now,

        updatedAt:
          now,

        exercises:
          selectedExercises.map(
            cloneExercise,
          ),
      };

    saveWorkoutTemplate(
      template,
    );

    setTemplates(
      getWorkoutTemplates(),
    );

    setEditingTemplateId(
      null,
    );

    setMessage(
      editingTemplateId
        ? "Workout updated successfully."
        : "Workout saved successfully.",
    );
  }

  /* =======================================================
     EDIT TEMPLATE
     ======================================================= */

  function editTemplate(
    template: WorkoutTemplate,
  ) {
    setWorkoutName(
      template.name,
    );

    setGoal(
      template.goal,
    );

    setSport(
      template.sport,
    );

    setSelectedExercises(
      template.exercises.map(
        cloneExercise,
      ),
    );

    setEditingTemplateId(
      template.id,
    );

    setShowSaved(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     DELETE TEMPLATE
     ======================================================= */

  function deleteTemplate(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Delete this saved workout?",
      );

    if (!confirmed) {
      return;
    }

    deleteWorkoutTemplate(
      id,
    );

    setTemplates(
      getWorkoutTemplates(),
    );

    if (
      editingTemplateId ===
      id
    ) {
      setEditingTemplateId(
        null,
      );

      setSelectedExercises(
        [],
      );

      setWorkoutName(
        "My Workout",
      );
    }

    setMessage(
      "Saved workout deleted.",
    );
  }

  /* =======================================================
     START SESSION
     ======================================================= */

  function startWorkout(
    sourceExercises =
      selectedExercises,
    sourceName =
      workoutName,
    sourceGoal =
      goal,
    sourceSport =
      sport,
  ) {
    if (
      sourceExercises.length ===
      0
    ) {
      setMessage(
        "Add at least one exercise before starting.",
      );

      return;
    }

    const now =
      Date.now();

    const exercises =
      sourceExercises.map(
        (exercise) => ({
          ...cloneExercise(
            exercise,
          ),

          startedAt:
            now,
        }),
      );

    setSessionExercises(
      exercises,
    );

    setWorkoutName(
      sourceName ||
        "My Workout",
    );

    setGoal(
      sourceGoal,
    );

    setSport(
      sourceSport,
    );

    setActiveExerciseIndex(
      0,
    );

    setSessionStartTime(
      now,
    );

    setElapsed(0);

    setRestRemaining(0);

    setRestRunning(false);

    setBeforePhoto(null);

    setAfterPhoto(null);

    setStarted(true);

    setMessage("");

    /*
     * Store the active session so refreshing the page
     * doesn't silently create a new workout.
     */
    const activeTemplate: WorkoutTemplate =
      {
        id:
          editingTemplateId ||
          createWorkoutId(),

        name:
          sourceName ||
          "My Workout",

        workoutName:
          sourceName ||
          "My Workout",

        goal:
          sourceGoal,

        sport:
          sourceSport,

        createdAt:
          new Date(
            now,
          ).toISOString(),

        updatedAt:
          new Date(
            now,
          ).toISOString(),

        exercises,
      };

    setActiveWorkout(
      activeTemplate,
    );
  }

  /* =======================================================
     COMPLETE SET
     ======================================================= */

  function completeSet(
    exerciseId: string,
    setNumber: number,
  ) {
    setSessionExercises(
      (current) =>
        current.map(
          (exercise) => {
            if (
              exercise.id !==
              exerciseId
            ) {
              return exercise;
            }

            const sets =
              exercise.completedSets.map(
                (set) => {
                  if (
                    set.setNumber !==
                    setNumber
                  ) {
                    return set;
                  }

                  const isCompleted =
                    Boolean(
                      set.completedAt,
                    );

                  return {
                    ...set,

                    completed:
                      !isCompleted,

                    completedAt:
                      !isCompleted
                        ? new Date().toISOString()
                        : "",
                  };
                },
              );

            const allDone =
              sets.length > 0 &&
              sets.every(
                (set) =>
                  Boolean(
                    set.completedAt,
                  ),
              );

            return {
              ...exercise,

              completedSets:
                sets,

              completedAt:
                allDone
                  ? Date.now()
                  : null,
            };
          },
        ),
    );

    /*
     * Starting the rest timer after every completed set
     * gives the workout page proper gym-session behavior.
     */
    setRestRemaining(
      restDuration,
    );

    setRestRunning(
      true,
    );
  }

  /* =======================================================
     UPDATE SESSION SET
     ======================================================= */

  function updateSessionSet(
    exerciseId: string,
    setNumber: number,
    field:
      | "reps"
      | "weight"
      | "rir",
    value: number,
  ) {
    setSessionExercises(
      (current) =>
        current.map(
          (exercise) => {
            if (
              exercise.id !==
              exerciseId
            ) {
              return exercise;
            }

            return {
              ...exercise,

              [field]:
                value,

              completedSets:
                exercise.completedSets.map(
                  (set) =>
                    set.setNumber ===
                    setNumber
                      ? {
                          ...set,
                          [field]:
                            value,
                        }
                      : set,
                ),
            };
          },
        ),
    );
  }

  /* =======================================================
     ADD SET DURING SESSION
     ======================================================= */

  function addSessionSet(
    exerciseId: string,
  ) {
    setSessionExercises(
      (current) =>
        current.map(
          (exercise) => {
            if (
              exercise.id !==
              exerciseId
            ) {
              return exercise;
            }

            const nextNumber =
              exercise
                .completedSets
                .length + 1;

            return {
              ...exercise,

              sets:
                nextNumber,

              completedSets: [
                ...exercise.completedSets,

                {
                  setNumber:
                    nextNumber,

                  reps:
                    exercise.reps,

                  weight:
                    exercise.weight,

                  rir:
                    exercise.rir,

                  completed:
                    false,

                  completedAt:
                    "",
                },
              ],
            };
          },
        ),
    );
  }

  /* =======================================================
     REMOVE SET
     ======================================================= */
function removeSessionSet(
    exerciseId: string,
  ) {
    setSessionExercises(
      (current) =>
        current.map(
          (exercise) => {
            if (
              exercise.id !==
              exerciseId
            ) {
              return exercise;
            }

            if (
              exercise
                .completedSets
                .length <= 1
            ) {
              return exercise;
            }

            const sets =
              exercise.completedSets
                .slice(0, -1)
                .map(
                  (
                    set,
                    index,
                  ) => ({
                    ...set,
                    setNumber:
                      index + 1,
                  }),
                );

            return {
              ...exercise,

              sets:
                sets.length,

              completedSets:
                sets,
            };
          },
        ),
    );
  }

  /* =======================================================
     REST TIMER CONTROLS
     ======================================================= */

  function startRest(
    seconds = restDuration,
  ) {
    setRestRemaining(
      seconds,
    );

    setRestRunning(
      true,
    );
  }

  function pauseRest() {
    setRestRunning(
      false,
    );
  }

  function skipRest() {
    setRestRunning(
      false,
    );

    setRestRemaining(
      0,
    );
  }

  /* =======================================================
     PHOTO HANDLER
     ======================================================= */

  function handlePhoto(
    event: ChangeEvent<HTMLInputElement>,
    type: "before" | "after",
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      () => {
        const value =
          String(
            reader.result,
          );

        if (
          type ===
          "before"
        ) {
          setBeforePhoto(
            value,
          );
        } else {
          setAfterPhoto(
            value,
          );
        }
      };

    reader.readAsDataURL(
      file,
    );
  }

  /* =======================================================
     FINISH SESSION
     ======================================================= */

  function finishWorkout() {
    if (
      sessionStartTime ===
      null
    ) {
      return;
    }

    const completedAt =
      new Date().toISOString();

    const startedAt =
      new Date(
        sessionStartTime,
      ).toISOString();

    const result: WorkoutResult =
      {
        id:
          createWorkoutId(),

        name:
          workoutName.trim() ||
          "My Workout",

        workoutName:
          workoutName.trim() ||
          "My Workout",

        goal,

        sport,

        startedAt,

        completedAt,

        durationSeconds:
          elapsed,

        totalDurationSeconds:
          elapsed,

        exercises:
          sessionExercises,

        totalVolume:
          sessionExercises.reduce(
            (
              total,
              exercise,
            ) =>
              total +
              exercise.completedSets.reduce(
                (
                  setTotal,
                  set,
                ) =>
                  setTotal +
                  set.weight *
                    set.reps,
                0,
              ),
            0,
          ),

        totalSets:
          sessionExercises.reduce(
            (
              total,
              exercise,
            ) =>
              total +
              exercise.completedSets.filter(
                (set) =>
                  Boolean(
                    set.completedAt,
                  ),
              ).length,
            0,
          ),

        beforePhoto,

        afterPhoto,
      };

    /*
     * ONE canonical save operation.
     *
     * This updates:
     * - workout history
     * - latest workout
     * - compatibility storage
     * - dashboard event
     */
    saveWorkoutResult(
      result,
    );

    clearActiveWorkout();

    setStarted(false);

    setRestRunning(
      false,
    );

    setRestRemaining(
      0,
    );

    setShowFinish(false);

    /*
     * SummaryPage already reads the completed
     * workout from the canonical result storage.
     */
    navigate(
      "/workout-summary",
    );
  }

  /* =======================================================
     CURRENT EXERCISE
     ======================================================= */

  const currentExercise =
    sessionExercises[
      activeExerciseIndex
    ];

  /* =======================================================
     PROGRESS
     ======================================================= */

  const completedSets =
    sessionExercises.reduce(
      (
        total,
        exercise,
      ) =>
        total +
        exercise.completedSets.filter(
          (set) =>
            Boolean(
              set.completedAt,
            ),
        ).length,
      0,
    );

  const plannedSets =
    sessionExercises.reduce(
      (
        total,
        exercise,
      ) =>
        total +
        exercise.sets,
      0,
    );

  const progress =
    plannedSets > 0
      ? Math.round(
          (completedSets /
            plannedSets) *
            100,
        )
      : 0;

  /* =======================================================
     ACTIVE WORKOUT UI
     ======================================================= */

  if (started) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur">
          <div className="max-w-5xl mx-auto px-5 py-5">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
                  APEXFIT-AI
                </p>

                <h1 className="text-xl font-bold mt-1">
                  {workoutName}
                </h1>
              </div>

              <div className="text-right">
                <p className="font-mono text-2xl font-bold">
                  {formatTime(
                    elapsed,
                  )}
                </p>

                <p className="text-[10px] text-zinc-600 uppercase">
                  Workout Time
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-500">
                  Workout Progress
                </span>

                <span className="text-cyan-400 font-semibold">
                  {progress}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 py-7">
          {/* REST TIMER */}

          <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
                  REST TIMER
                </p>

                <p className="font-mono text-5xl font-bold mt-2">
                  {formatTime(
                    restRemaining,
                  )}
                </p>

                <p className="text-sm text-zinc-500 mt-2">
                  Rest between your working sets.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[60, 90, 120, 180].map(
                  (seconds) => (
                    <button
                      key={
                        seconds
                      }
                      type="button"
                      onClick={() =>
                        startRest(
                          seconds,
                        )
                      }
                      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                        restDuration ===
                        seconds
                          ? "bg-cyan-500 text-black"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      {seconds}s
                    </button>
                  ),
                )}

                {restRunning ? (
                  <button
                    type="button"
                    onClick={
                      pauseRest
                    }
                    className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      startRest(
                        restRemaining ||
                          restDuration,
                      )
                    }
                    className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold"
                  >
                    Start
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    skipRest
                  }
                  className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold"
                >
                  Skip
                </button>
              </div>
            </div>
          </section>

          {/* EXERCISE NAVIGATION */}

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {sessionExercises.map(
              (
                exercise,
                index,
              ) => {
                const done =
                  exercise.completedSets.length >
                    0 &&
                  exercise.completedSets.every(
                    (set) =>
                      Boolean(
                        set.completedAt,
                      ),
                  );

                return (
                  <button
                    key={
                      exercise.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveExerciseIndex(
                        index,
                      )
                    }
                    className={`min-w-[160px] rounded-xl border px-4 py-3 text-left ${
                      activeExerciseIndex ===
                      index
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-zinc-800 bg-[#111111]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600 uppercase">
                        Exercise{" "}
                        {index +
                          1}
                      </span>

                      {done && (
                        <span className="text-cyan-400 text-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold mt-1 truncate">
                      {
                        exercise.name
                      }
                    </p>
                  </button>
                );
              },
            )}
          </div>

          {/* CURRENT EXERCISE */}

          {currentExercise && (
            <section className="rounded-3xl border border-zinc-800 bg-[#111111] overflow-hidden">
              <div className="p-6 md:p-8 border-b border-zinc-800">
                <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
                  EXERCISE{" "}
                  {activeExerciseIndex +
                    1}{" "}
                  /{" "}
                  {
                    sessionExercises.length
                  }
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {
                    currentExercise.name
                  }
                </h2>

                <p className="text-zinc-500 mt-2">
                  {
                    currentExercise.muscle
                  }
                  {" • "}
                  {
                    currentExercise.category
                  }
                  {" • "}
                  {
                    currentExercise.equipment
                  }
                </p>
<div className="mt-5 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase">
                    ApexFit Recommendation
                  </p>

                  <p className="text-sm text-zinc-400 mt-2 leading-6">
                    {
                      currentExercise.reason
                    }
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-widest text-zinc-600 text-left">
                        <th className="px-3 py-3">
                          Set
                        </th>

                        <th className="px-3 py-3">
                          Reps
                        </th>

                        <th className="px-3 py-3">
                          Weight
                        </th>

                        <th className="px-3 py-3">
                          RIR
                        </th>

                        <th className="px-3 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentExercise.completedSets.map(
                        (set) => (
                          <tr
                            key={
                              set.setNumber
                            }
                            className="border-t border-zinc-900"
                          >
                            <td className="px-3 py-4 font-bold">
                              {
                                set.setNumber
                              }
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="1"
                                value={
                                  set.reps
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateSessionSet(
                                    currentExercise.id,
                                    set.setNumber,
                                    "reps",
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ) ||
                                      1,
                                  )
                                }
                                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-500"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={
                                  set.weight
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateSessionSet(
                                    currentExercise.id,
                                    set.setNumber,
                                    "weight",
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ) ||
                                      0,
                                  )
                                }
                                className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-500"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="0"
                                max="5"
                                value={
                                  set.rir
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateSessionSet(
                                    currentExercise.id,
                                    set.setNumber,
                                    "rir",
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ) ||
                                      0,
                                  )
                                }
                                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-500"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  completeSet(
                                    currentExercise.id,
                                    set.setNumber,
                                  )
                                }
                                className={`rounded-xl px-5 py-3 text-sm font-bold ${
                                  set.completedAt
                                    ? "bg-cyan-500 text-black"
                                    : "border border-zinc-700 bg-zinc-900 text-zinc-300"
                                }`}
                              >
                                {set.completedAt
                                  ? "✓ Completed"
                                  : "Complete Set"}
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      addSessionSet(
                        currentExercise.id,
                      )
                    }
                    className="rounded-xl border border-zinc-800 px-4 py-3 text-sm"
                  >
                    + Add Set
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeSessionSet(
                        currentExercise.id,
                      )
                    }
                    className="rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-500"
                  >
                    Remove Set
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* EXERCISE NAVIGATION */}

          <div className="flex justify-between gap-3 mt-6">
            <button
              type="button"
              disabled={
                activeExerciseIndex ===
                0
              }
              onClick={() =>
                setActiveExerciseIndex(
                  (
                    index,
                  ) =>
                    Math.max(
                      0,
                      index -
                        1,
                    ),
                )
              }
              className="rounded-xl border border-zinc-800 px-6 py-4 font-semibold disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              type="button"
              disabled={
                activeExerciseIndex >=
                sessionExercises.length -
                  1
              }
              onClick={() =>
                setActiveExerciseIndex(
                  (
                    index,
                  ) =>
                    Math.min(
                      sessionExercises.length -
                        1,
                      index +
                        1,
                    ),
                )
              }
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-4 font-semibold disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          {/* PHOTOS */}

          <section className="grid md:grid-cols-2 gap-5 mt-8">
            <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
              <p className="font-semibold">
                Before Workout
              </p>

              <p className="text-xs text-zinc-600 mt-1">
                Optional progress photo
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(
                  event,
                ) =>
                  handlePhoto(
                    event,
                    "before",
                  )
                }
                className="mt-4 block w-full text-sm text-zinc-500"
              />

              {beforePhoto && (
                <img
                  src={
                    beforePhoto
                  }
                  alt="Before workout"
                  className="mt-4 w-full h-64 object-cover rounded-2xl"
                />
              )}
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
              <p className="font-semibold">
                After Workout
              </p>

              <p className="text-xs text-zinc-600 mt-1">
                Optional progress photo
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(
                  event,
                ) =>
                  handlePhoto(
                    event,
                    "after",
                  )
                }
                className="mt-4 block w-full text-sm text-zinc-500"
              />

              {afterPhoto && (
                <img
                  src={
                    afterPhoto
                  }
                  alt="After workout"
                  className="mt-4 w-full h-64 object-cover rounded-2xl"
                />
              )}
            </div>
          </section>

          {/* FINISH */}

          <section className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-widest">
                  SESSION
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  {completedSets} /{" "}
                  {plannedSets} sets
                  completed
                </h2>

                <p className="text-sm text-zinc-500 mt-2">
                  Review your recorded sets before finishing.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFinish(
                    true,
                  )
                }
                className="rounded-xl bg-cyan-500 px-7 py-4 font-bold text-black"
              >
                Finish Workout
              </button>
            </div>
          </section>
        </main>

        {/* FINISH MODAL */}

        {showFinish && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-5">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111111] p-7">
              <div className="text-center">
                <div className="text-5xl">
                  ✓
                </div>

                <h2 className="text-2xl font-bold mt-4">
                  Finish Workout?
                </h2>

                <p className="text-sm text-zinc-500 mt-3 leading-6">
                  Your workout time, exercises, sets, weight, RIR and photos will be saved.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-7">
                  <button
                    type="button"
                    onClick={() =>
                      setShowFinish(
                        false,
                      )
                    }
                    className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold"
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={
                      finishWorkout
                    }
                    className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     BUILDER PAGE
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <header className="border-b border-zinc-800 bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold">
              ApexFit
              <span className="text-cyan-400">
                -AI
              </span>
            </p>

            <p className="text-xs text-zinc-600 mt-1">
              Intelligent Workout Planner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard",
                )
              }
              className="rounded-xl border border-zinc-800 px-4 py-3 text-sm"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                setShowSaved(
                  (value) =>
                    !value,
                )
              }
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm font-semibold"
            >
              Saved (
              {
                templates.length
              }
              )
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {message && (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] px-5 py-4 text-sm text-cyan-400">
            {message}
          </div>
        )}

        {/* SAVED WORKOUTS */}

        {showSaved && (
          <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-7 mb-7">
            <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
              WORKOUT LIBRARY
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Saved Workouts
            </h2>

            {templates.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                <p className="text-zinc-500">
                  No saved workouts yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {templates.map(
                  (
                    template,
                  ) => (
                    <div
                      key={
                        template.id
                      }
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <h3 className="font-bold">
                        {
                          template.name
                        }
                      </h3>

                      <p className="text-xs text-cyan-400 mt-1">
                        {
                          template.goal
                        }
                      </p>

                      <p className="text-xs text-zinc-600 mt-3">
                        {
                          template
                            .exercises
                            .length
                        }{" "}
                        exercises
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-5">
                        <button
                          type="button"
                          onClick={() =>
                            startWorkout(
                              template.exercises,
                              template.name,
                              template.goal,
                              template.sport,
                            )
                          }
                          className="rounded-xl bg-cyan-500 px-3 py-3 text-sm font-bold text-black"
                        >
                          Start
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            editTemplate(
                              template,
                            )
                          }
                          className="rounded-xl border border-zinc-700 px-3 py-3 text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteTemplate(
                            template.id,
                          )
                        }
                        className="w-full mt-2 rounded-xl border border-red-900/50 px-3 py-2 text-xs text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        )}

        {/* WORKOUT SETTINGS */}

        <section className="rounded-3xl border border-zinc-800 bg-[#111111] p-7">
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Workout Name
              </label>

              <input
                value={
                  workoutName
                }
                onChange={(
                  event,
                ) =>
                  setWorkoutName(
                    event.target
                      .value,
                  )
                }
                className="w-full mt-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Goal
              </label>

              <select
                value={goal}
                onChange={(
                  event,
                ) =>
                  setGoal(
                    event.target
                      .value as Goal,
                  )
                }
                className="w-full mt-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-cyan-500"
              >
                <option value="Muscle Building">
                  Muscle Building
                </option>

                <option value="Fat Loss">
                  Fat Loss
                </option>

                <option value="Recomposition">
                  Recomposition
                </option>

                <option value="Athletic">
                  Athletic
                </option>

                <option value="Competitive">
                  Competitive
                </option>

                <option value="Hyrox">
                  Hyrox
                </option>

                <option value="Powerlifting">
                  Powerlifting
                </option>

                <option value="General">
                  General
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Sport
              </label>

              <select
                value={sport}
                onChange={(
                  event,
                ) =>
                  setSport(
                    event.target
                      .value,
                  )
                }
                className="w-full mt-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-cyan-500"
              >
                <option value="">
                  General
                </option>

                <option value="Cricket">
                  Cricket
                </option>

                <option value="Football">
                  Football
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* AI RECOMMENDATIONS */}

        <section className="mt-7 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.02] p-7">
          <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
            APEXFIT AI
          </p>

          <h2 className="text-2xl font-bold mt-2">
            Recommended Exercises
          </h2>

          <p className="text-sm text-zinc-500 mt-2">
            Recommendations are based on your selected goal and sport.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {recommendations.map(
              (exercise) => (
                <button
                  key={
                    exercise.id
                  }
                  type="button"
                  onClick={() =>
                    addExercise(
                      exercise,
                    )
                  }
                  className="text-left rounded-2xl border border-zinc-800 bg-[#111111] p-5 hover:border-cyan-500/40 transition"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {
                          exercise.name
                        }
                      </h3>

                      <p className="text-xs text-cyan-400 mt-1">
                        {
                          exercise.muscle
                        }
                      </p>
                    </div>

                    <span className="text-cyan-400 text-xl">
                      +
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 mt-4 leading-5">
                    {
                      exercise.reason
                    }
                  </p>

                  <p className="text-[10px] text-zinc-700 uppercase mt-3">
                    {
                      exercise.equipment
                    }
                    {" • "}
                    {
                      exercise.difficulty
                    }
                  </p>
                </button>
              ),
            )}
          </div>
        </section>

        {/* SELECTED EXERCISES */}

        <section className="mt-7 rounded-3xl border border-zinc-800 bg-[#111111] p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400 text-xs uppercase tracking-widest">
                WORKOUT STRUCTURE
              </p>

              <h2 className="text-2xl font-bold mt-2">
                Your Exercises
              </h2>
            </div>

            <span className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-zinc-500">
              {
                selectedExercises.length
              }
            </span>
          </div>

          {selectedExercises.length ===
          0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
              <p className="text-4xl">
                🏋️
              </p>

              <h3 className="font-semibold mt-4">
                No exercises selected
              </h3>

              <p className="text-sm text-zinc-600 mt-2">
                Choose exercises from the ApexFit recommendations above.
              </p>
            </div>
            ) : (
            <div className="space-y-3 mt-6">
              {selectedExercises.map(
                (
                  exercise,
                  index,
                ) => (
                  <div
                    key={
                      exercise.id
                    }
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                            {index +
                              1}
                          </span>

                          <div>
                            <h3 className="font-semibold">
                              {
                                exercise.name
                              }
                            </h3>

                            <p className="text-xs text-zinc-500 mt-1">
                              {
                                exercise.muscle
                              }
                              {" • "}
                              {
                                exercise.category
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 xl:w-[430px]">
                        <div>
                          <p className="text-[10px] text-zinc-600 mb-1">
                            SETS
                          </p>

                          <input
                            type="number"
                            min="1"
                            value={
                              exercise.sets
                            }
                            onChange={(
                              event,
                            ) =>
                              updateExercise(
                                exercise.id,
                                "sets",
                                Math.max(
                                  1,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ) ||
                                    1,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] text-zinc-600 mb-1">
                            REPS
                          </p>

                          <input
                            type="number"
                            min="1"
                            value={
                              exercise.reps
                            }
                            onChange={(
                              event,
                            ) =>
                              updateExercise(
                                exercise.id,
                                "reps",
                                Math.max(
                                  1,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ) ||
                                    1,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] text-zinc-600 mb-1">
                            KG
                          </p>

                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={
                              exercise.weight
                            }
                            onChange={(
                              event,
                            ) =>
                              updateExercise(
                                exercise.id,
                                "weight",
                                Math.max(
                                  0,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ) ||
                                    0,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] text-zinc-600 mb-1">
                            RIR
                          </p>

                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={
                              exercise.rir
                            }
                            onChange={(
                              event,
                            ) =>
                              updateExercise(
                                exercise.id,
                                "rir",
                                Math.max(
                                  0,
                                  Math.min(
                                    5,
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ) ||
                                      0,
                                  ),
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeExercise(
                            exercise.id,
                          )
                        }
                        className="rounded-xl border border-red-900/50 px-5 py-3 text-sm text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* FINAL ACTIONS */}

        <section className="mt-7 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={
              saveTemplate
            }
            className="rounded-xl border border-zinc-700 px-7 py-4 font-semibold"
          >
            {editingTemplateId
              ? "Update Workout"
              : "Save Workout"}
          </button>

          <button
            type="button"
            onClick={() =>
              startWorkout()
            }
            className="rounded-xl bg-cyan-500 px-8 py-4 font-bold text-black hover:bg-cyan-400"
          >
            Start Workout →
          </button>
        </section>

        <footer className="py-12 text-center">
          <p className="text-xs text-zinc-700">
            ApexFit AI • Intelligent Fitness Management
          </p>
        </footer>
      </main>
    </div>
  );
}