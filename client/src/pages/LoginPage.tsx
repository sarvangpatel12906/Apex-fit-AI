import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await axios.post(
        `${API_BASE_URL}/auth/login/`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const data = loginResponse.data;

      if (!data.success) {
        setError(
          data.error || "Unable to sign in."
        );
        return;
      }

      /*
       * Clear any old authentication data first.
       * This prevents an old/expired token from being used.
       */
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      /*
       * Store fresh tokens from the new login.
       */
      if (data.access) {
        localStorage.setItem(
          "accessToken",
          data.access
        );
      }

      if (data.refresh) {
        localStorage.setItem(
          "refreshToken",
          data.refresh
        );
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      /*
       * If no access token was returned,
       * do not continue to protected routes.
       */
      if (!data.access) {
        setError(
          "Login succeeded but no access token was received."
        );
        return;
      }

      /*
       * Check whether this user already has
       * a completed fitness profile.
       */
      try {
        const profileResponse = await axios.get(
          `${API_BASE_URL}/profile/`,
          {
            headers: {
              Authorization: `Bearer ${data.access}`,
            },
          }
        );

        const profileData = profileResponse.data;

        if (
          profileData.success &&
          profileData.profile
        ) {
          /*
           * Existing user with a profile.
           */
          navigate("/dashboard", {
            replace: true,
          });
        } else {
          /*
           * User needs to complete setup.
           */
          navigate("/setup", {
            replace: true,
          });
        }
      } catch (profileError) {
        /*
         * If the profile doesn't exist yet,
         * send the user to setup.
         */
        if (axios.isAxiosError(profileError)) {
          const status =
            profileError.response?.status;

          /*
           * A missing profile commonly returns 404.
           */
          if (status === 404) {
            navigate("/setup", {
              replace: true,
            });
            return;
          }

          /*
           * Authentication problem.
           */
          if (status === 401) {
            setError(
              "Your login session could not be verified. Please try again."
            );
            return;
          }
        }

        /*
         * Default fallback for users who
         * need profile setup.
         */
        navigate("/setup", {
          replace: true,
        });
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Invalid email or password."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Brand */}

        <div className="text-center mb-10">

          <Link
            to="/"
            className="inline-flex flex-col items-center"
          >
            <span className="text-2xl font-bold tracking-tight">
              ApexFit
              <span className="text-cyan-400">
                -AI
              </span>
            </span>

            <span className="text-[10px] tracking-[0.35em] text-zinc-500 mt-1">
              FITNESS SYSTEM
            </span>
          </Link>

          <h1 className="text-3xl font-bold mt-8">
            Welcome back
          </h1>

          <p className="text-zinc-400 mt-3">
            Sign in to continue your transformation.
          </p>

        </div>

        {/* Login Card */}

        <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
              />

            </div>

            {/* Password */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </Link>

              </div>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 pr-20 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-cyan-400 transition disabled:opacity-50"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* Register */}

          <p className="text-center text-zinc-500 text-sm mt-8">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Create one
            </Link>

          </p>

          {/* Back Home */}

          <div className="mt-6 text-center">

            <Link
              to="/"
              className="text-sm text-zinc-500 hover:text-cyan-400 transition"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}