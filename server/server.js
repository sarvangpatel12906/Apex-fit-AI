 process.loadEnvFile();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 5002;

/* =====================================================
   GEMINI MODELS + SETTINGS
   ===================================================== */

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

const GEMINI_MODEL = GEMINI_MODELS[0];
const GEMINI_TIMEOUT_MS = 35000;
const GEMINI_MAX_ATTEMPTS = 2;

/* =====================================================
   GEMINI AI
   ===================================================== */

const geminiApiKey = process.env.GEMINI_API_KEY;

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
    })
  : null;

/* =====================================================
   MIDDLEWARE
   ===================================================== */

app.use(
  express.json({
    limit: "10mb",
  }),
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.header(
      "Access-Control-Allow-Origin",
      origin || "*",
    );
  }

  res.header("Vary", "Origin");

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =====================================================
   TEMPORARY DATA
   ===================================================== */

const users = [];
const workouts = [];

/* =====================================================
   HELPERS
   ===================================================== */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableGeminiError(error) {
  const code = String(
    error?.code ?? error?.statusCode ?? "",
  );

  const status = String(
    error?.status ?? error?.response?.status ?? "",
  ).toUpperCase();

  const message = String(
    error?.message ?? error ?? "",
  ).toUpperCase();

  return (
    code === "429" ||
    code === "500" ||
    code === "503" ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("HIGH DEMAND") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("RATE LIMIT") ||
    message.includes("429 TOO MANY REQUESTS")
  );
}

/* =====================================================
   GEMINI REQUEST
   ===================================================== */

async function generateGeminiResponse(
  systemInstruction,
  userPrompt,
  model,
) {
  if (!ai) {
    throw new Error(
      "Gemini API key is not configured.",
    );
  }

  return ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 5000,
    },
  });
}

/* =====================================================
   GEMINI WITH FALLBACK MODELS
   ===================================================== */

async function askGemini(
  systemInstruction,
  userPrompt,
) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    for (
      let attempt = 1;
      attempt <= GEMINI_MAX_ATTEMPTS;
      attempt += 1
    ) {
      try {
        console.log(
          `Gemini request: model=${model}, attempt=${attempt}/${GEMINI_MAX_ATTEMPTS}`,
        );

        const timeoutPromise = new Promise(
          (_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  `Gemini request timed out after ${
                    GEMINI_TIMEOUT_MS / 1000
                  } seconds.`,
                ),
              );
            }, GEMINI_TIMEOUT_MS);
          },
        );

        const response = await Promise.race([
          generateGeminiResponse(
            systemInstruction,
            userPrompt,
            model,
          ),
          timeoutPromise,
        ]);

        const text = response?.text;

        if (!text || typeof text !== "string") {
          throw new Error(
            "Gemini returned an empty response.",
          );
        }

        console.log(
          `Gemini request succeeded with ${model}.`,
        );

        return {
          text,
          model,
        };
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini failed with ${model}, attempt ${attempt}:`,
          error?.message || error,
        );

        if (isRetryableGeminiError(error)) {
          console.log(
            `Model ${model} is temporarily unavailable or rate-limited.`,
          );

          break;
        }

        if (attempt < GEMINI_MAX_ATTEMPTS) {
          const delay = attempt * 1500;

          console.log(
            `Retrying ${model} in ${
              delay / 1000
            } seconds...`,
          );

          await sleep(delay);
        }
      }
    }

    if (
      model !==
      GEMINI_MODELS[GEMINI_MODELS.length - 1]
    ) {
      console.log(
        `Trying the next Gemini model after ${model}...`,
      );
    }
  }

  throw (
    lastError ||
    new Error(
      "All configured Gemini models are temporarily unavailable.",
    )
  );
}

/* =====================================================
   HEALTH CHECK
   ===================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ApexFit AI Backend 🚀",
    status: "running",
    port: PORT,
    gemini: geminiApiKey
      ? "configured"
      : "not configured",
    model: GEMINI_MODEL,
    availableModels: GEMINI_MODELS,
  });
});

/* =====================================================
   API STATUS
   ===================================================== */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "ApexFit AI API is running",
    users: users.length,
    workouts: workouts.length,
    gemini: geminiApiKey
      ? "configured"
      : "not configured",
    model: GEMINI_MODEL,
    availableModels: GEMINI_MODELS,
    timeoutSeconds:
      GEMINI_TIMEOUT_MS / 1000,
    retries: GEMINI_MAX_ATTEMPTS,
  });
});

/* =====================================================
   GEMINI STATUS
   ===================================================== */

app.get("/api/ai/status", (req, res) => {
  res.json({
    success: true,
    geminiConfigured: Boolean(geminiApiKey),
    model: GEMINI_MODEL,
    availableModels: GEMINI_MODELS,
    timeoutSeconds:
      GEMINI_TIMEOUT_MS / 1000,
    retries: GEMINI_MAX_ATTEMPTS,
  });
});

/* =====================================================
   GEMINI TEST
   ===================================================== */

app.post("/api/ai/test", async (req, res) => {
  try {
    const result = await askGemini(
      `
You are ApexFit AI.

You are a professional fitness assistant.

Keep responses concise, practical and safe.

Do not diagnose medical conditions.
      `,
      `
Say hello to ApexFit AI in one short sentence.
      `,
    );

    return res.json({
      success: true,
      model: result.model,
      response: result.text,
    });
  } catch (error) {
    console.error("Gemini test error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Gemini request failed.",
    });
  }
});

/* =====================================================
   TEMPORARY REGISTER
   ===================================================== */

app.post("/api/register", (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Name, email and password are required.",
    });
  }

  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() ===
      email.toLowerCase(),
  );

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message:
        "An account with this email already exists.",
    });
  }

  const user = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

/* =====================================================
   TEMPORARY LOGIN
   ===================================================== */

app.post("/api/login", (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Email and password are required.",
    });
  }

  const user = users.find(
    (item) =>
      item.email.toLowerCase() ===
        email.toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  return res.json({
    success: true,
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

/* =====================================================
   SAVE WORKOUT
   ===================================================== */

app.post("/api/workouts", (req, res) => {
  const workout = req.body;

  if (
    !workout ||
    typeof workout !== "object"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid workout data.",
    });
  }

  const savedWorkout = {
    id: Date.now().toString(),
    ...workout,
    savedAt: new Date().toISOString(),
  };

  workouts.push(savedWorkout);

  return res.status(201).json({
    success: true,
    message: "Workout saved successfully.",
    workout: savedWorkout,
  });
});

/* =====================================================
   GET WORKOUT HISTORY
   ===================================================== */

app.get("/api/workouts", (req, res) => {
  res.json({
    success: true,
    workouts,
  });
});

/* =====================================================
   GET SINGLE WORKOUT
   ===================================================== */

app.get("/api/workouts/:id", (req, res) => {
  const workout = workouts.find(
    (item) =>
      item.id === req.params.id,
  );

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: "Workout not found.",
    });
  }

  return res.json({
    success: true,
    workout,
  });
});

/* =====================================================
   DELETE WORKOUT
   ===================================================== */

app.delete("/api/workouts/:id", (req, res) => {
  const index = workouts.findIndex(
    (item) =>
      item.id === req.params.id,
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Workout not found.",
    });
  }

  workouts.splice(index, 1);

  return res.json({
    success: true,
    message: "Workout deleted successfully.",
  });
});

/* =====================================================
   AI WORKOUT PLAN
   ===================================================== */

app.post(
  "/api/ai/workout-plan",
  async (req, res) => {
    try {
      const profile = req.body;

      if (
        !profile ||
        typeof profile !== "object"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Fitness profile is required.",
        });
      }

      const systemInstruction = `
You are ApexFit AI, an intelligent fitness planning assistant.

Create personalized workout plans using:

- fitness goal
- age
- gender
- height
- weight
- body fat when available
- training experience
- activity level
- available equipment
- training days
- workout duration
- sport
- injuries or limitations
- sleep
- stress
- energy
- soreness
- recovery
- previous training performance

IMPORTANT RULES:

1. NEVER change the user's primary goal.

2. ALWAYS preserve progressive overload.

3. Recovery can modify training volume and intensity
   but must not replace the user's fundamental goal.

4. Poor recovery may result in:
   - fewer sets
   - lower intensity
   - more recovery work
   - reduced training volume

5. Good recovery may allow:
   - progressive load
   - additional repetitions
   - appropriate volume progression

6. Do not prescribe exercises that conflict with
   a stated injury or limitation.

7. Recommend specific exercises, not generic muscle groups.

8. For exercises include:
   - exercise name
   - target muscle
   - sets
   - reps
   - RIR
   - rest period

9. Include progressive overload guidance.

10. The plan must be realistic for the user's
    experience level.

11. Do not diagnose medical conditions.
      `;

      const prompt = `
Create an ApexFit AI personalized workout plan.

USER PROFILE:

${JSON.stringify(profile, null, 2)}

Return a clear, detailed weekly plan.

Include:

1. Overview
2. Weekly schedule
3. Daily workouts
4. Specific exercises
5. Target muscles
6. Sets
7. Reps
8. RIR
9. Rest periods
10. Progressive overload strategy
11. Recovery strategy
12. Weekly progression rules

The user's primary goal is LOCKED.

Do not replace it with another goal.
      `;

      const result = await askGemini(
        systemInstruction,
        prompt,
      );

      return res.json({
        success: true,
        type: "workout-plan",
        model: result.model,
        response: result.text,
      });
    } catch (error) {
      console.error(
        "WORKOUT AI ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to generate workout plan.",
      });
    }
  },
);

/* =====================================================
   AI DIET PLAN
   ===================================================== */

app.post(
  "/api/ai/diet-plan",
  async (req, res) => {
    try {
      const profile = req.body;

      if (
        !profile ||
        typeof profile !== "object"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Nutrition profile is required.",
        });
      }

      const systemInstruction = `
You are ApexFit AI, a personalized nutrition planning assistant.

Create diet plans according to the user's calculated
nutrition targets and dietary preferences.

SUPPORTED DIET STYLES:

- Vegetarian
- Vegan
- Non-vegetarian
- Eggetarian
- Pescatarian
- Custom

The user's nutrition targets may include:

- calories
- protein
- carbohydrates
- fats
- fiber
- water

IMPORTANT:

1. Respect the selected dietary style.

2. Respect allergies and intolerances.

3. Respect disliked or avoided foods.

4. Build meals around provided nutrition targets.

5. Do not arbitrarily change the calorie target.

6. Clearly show approximate calories, protein,
   carbohydrates and fats for each meal.

7. Provide alternatives when practical.

8. Consider cuisine, budget and meal frequency.

9. Do not diagnose medical conditions.

10. ApexFit's calculated nutrition values should
    be treated as the target values.
      `;

      const prompt = `
Create an ApexFit AI personalized nutrition plan.

USER PROFILE:

${JSON.stringify(profile, null, 2)}

Create:

1. Daily calorie target
2. Protein target
3. Carbohydrate target
4. Fat target
5. Fiber target
6. Water target
7. Meal schedule
8. Meals with portions
9. Approximate calories per meal
10. Protein, carbs and fats for every meal
11. Daily totals
12. Food alternatives

Respect the user's selected diet style,
restrictions, allergies and preferences.
      `;

      const result = await askGemini(
        systemInstruction,
        prompt,
      );

      return res.json({
        success: true,
        type: "diet-plan",
        model: result.model,
        response: result.text,
      });
    } catch (error) {
      console.error(
        "DIET AI ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to generate diet plan.",
      });
    }
  },
);

/* =====================================================
   WEEKLY RECOVERY REVIEW
   ===================================================== */

app.post(
  "/api/ai/weekly-review",
  async (req, res) => {
    try {
      const weeklyData = req.body;

      if (
        !weeklyData ||
        typeof weeklyData !== "object"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Weekly recovery data is required.",
        });
      }

      const systemInstruction = `
You are ApexFit AI's weekly recovery and training-load evaluator.

Evaluate:

- average sleep
- sleep quality
- stress
- energy
- soreness
- recovery
- completed workouts
- missed workouts
- training volume
- sets
- reps
- weights
- performance
- previous week performance

IMPORTANT:

The user's primary goal is LOCKED.

Never change the goal.

Progressive overload remains enabled.

If recovery is good:
recommend appropriate progression.

If recovery is moderate:
recommend maintaining or using a smaller progression.

If recovery is poor:
temporarily reduce training volume or intensity
while preserving the same goal.

Do not diagnose medical conditions.
      `;

      const prompt = `
Analyze this user's weekly data:

${JSON.stringify(weeklyData, null, 2)}

Return:

1. Recovery rating
2. Training-load recommendation
3. What should increase
4. What should remain the same
5. What should temporarily decrease
6. Next week's recommendation
7. Progressive overload recommendation
8. Recovery recommendations
9. Short explanation
      `;

      const result = await askGemini(
        systemInstruction,
        prompt,
      );

      return res.json({
        success: true,
        type: "weekly-recovery",
        model: result.model,
        response: result.text,
      });
    } catch (error) {
      console.error(
        "WEEKLY AI ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to generate weekly review.",
      });
    }
  },
);

/* =====================================================
   AI FITNESS ASSISTANT CHAT
   ===================================================== */

app.post(
  "/api/ai/chat",
  async (req, res) => {
    try {
      const {
        message,
        profile,
        history,
      } = req.body;

      if (
        !message ||
        typeof message !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A question or message is required.",
        });
      }

      const systemInstruction = `
You are ApexFit AI, a helpful fitness and nutrition assistant.

Use the user's ApexFit profile when it is provided.

Respect:

- the user's fitness goal
- dietary style
- nutrition targets
- injuries
- limitations
- recovery status

You can explain:

- exercises
- training
- progressive overload
- recovery
- sleep
- nutrition
- calories
- protein
- carbohydrates
- fats
- meal planning
- substitutions
- workout modifications

Never diagnose medical conditions.

If the user reports serious pain, injury symptoms
or a medical concern, recommend speaking with a
qualified health professional.

Give practical and understandable answers.
      `;

      const prompt = `
APEXFIT USER PROFILE:

${JSON.stringify(profile ?? {}, null, 2)}

RECENT CONVERSATION:

${JSON.stringify(history ?? [], null, 2)}

USER QUESTION:

${message}
      `;

      const result = await askGemini(
        systemInstruction,
        prompt,
      );

      return res.json({
        success: true,
        type: "chat",
        model: result.model,
        response: result.text,
      });
    } catch (error) {
      console.error(
        "CHAT AI ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to answer with Gemini.",
      });
    }
  },
);

/* =====================================================
   404
   ===================================================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

/* =====================================================
   START SERVER
   ===================================================== */

app.listen(PORT, () => {
  console.log("");
  console.log(
    "==========================================",
  );
  console.log(
    "       APEXFIT-AI AI SERVER",
  );
  console.log(
    "==========================================",
  );
  console.log(
    `Server: http://localhost:${PORT}`,
  );
  console.log(
    `API:    http://localhost:${PORT}/api/status`,
  );
  console.log(
    `Gemini: ${
      geminiApiKey
        ? "CONFIGURED ✅"
        : "NOT CONFIGURED ❌"
    }`,
  );
  console.log(
    `Model:  ${GEMINI_MODEL}`,
  );
  console.log(
    `Timeout: ${
      GEMINI_TIMEOUT_MS / 1000
    }s per attempt`,
  );
  console.log(
    `Retries: ${GEMINI_MAX_ATTEMPTS}`,
  );
  console.log(
    "Fallback models: ENABLED ✅",
  );
  console.log(
    "Status: RUNNING ✅",
  );
  console.log(
    "==========================================",
  );
  console.log("");
});