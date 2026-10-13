import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  verifyOTP,
  resendOTP,
} from "../services/api";

type RegistrationStep = "register" | "otp";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] =
    useState<RegistrationStep>("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  /*
   * Creates a Django-compatible username from
   * the user's full name.
   */
  function generateUsername(fullName: string) {
    const base = fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 30);

    const suffix = Math.floor(
      1000 + Math.random() * 9000,
    );

    return `${base || "apexfituser"}${suffix}`;
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all required fields.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError(
        "Please accept the terms and conditions.",
      );
      return;
    }

    setLoading(true);

    try {
      const username = generateUsername(name);

      const response = await registerUser(
        username,
        email.trim().toLowerCase(),
        password,
      );

      setMessage(
        response.message ||
          "Verification OTP has been sent to your email.",
      );

      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must contain 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(
        email.trim().toLowerCase(),
        otp.trim(),
      );

      setMessage(
        response.message ||
          "Email verified successfully.",
      );

      /*
       * Give the user a moment to see the success
       * message before moving to login.
       */
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError("");
    setMessage("");

    setResending(true);

    try {
      const response = await resendOTP(
        email.trim().toLowerCase(),
      );

      setMessage(
        response.message ||
          "A new OTP has been sent to your email.",
      );

      setOtp("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  }

  function goBackToRegistration() {
    setStep("register");
    setOtp("");
    setError("");
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Brand */}

        <div className="text-center mb-10">

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            ApexFit
            <span className="text-cyan-400">
              -AI
            </span>
          </Link>

          {step === "register" ? (
            <>
              <h1 className="text-3xl font-bold mt-8">
                Create your account
              </h1>

              <p className="text-zinc-400 mt-3">
                Start building your personalized
                fitness plan.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mt-8">
                Verify your email
              </h1>

              <p className="text-zinc-400 mt-3">
                Enter the 6-digit OTP sent to
              </p>

              <p className="text-cyan-400 mt-1 break-all">
                {email}
              </p>
            </>
          )}

        </div>

        {/* Registration */}

        {step === "register" && (
          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl">

            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* Full Name */}

              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

              </div>

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

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>

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
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 pr-20 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword,
                      )
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

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

              </div>

              {/* Terms */}

              <label className="flex items-start gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) =>
                    setAgree(
                      event.target.checked,
                    )
                  }
                  disabled={loading}
                  className="mt-1 accent-cyan-500"
                />

                <span className="text-sm text-zinc-500 leading-6">
                  I agree to the terms and
                  conditions of ApexFit-AI.
                </span>

              </label>

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
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

            </form>

            {/* Login */}

            <p className="text-center text-zinc-500 text-sm mt-8">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                Sign in
              </Link>

            </p>

          </div>
        )}

        {/* OTP Verification */}

        {step === "otp" && (
          <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl">

            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >

              <div>

                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Verification code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="000000"
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white placeholder-zinc-700 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

                <p className="text-xs text-zinc-500 mt-3 text-center">
                  Your OTP is valid for 10 minutes.
                </p>

              </div>

              {/* Success message */}

              {message && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400">
                  {message}
                </div>
              )}

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Verify */}

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6
                }
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Verifying..."
                  : "Verify Email"}
              </button>

            </form>

            {/* Resend */}

            <div className="text-center mt-6">

              <p className="text-sm text-zinc-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={
                  resending || loading
                }
                className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50"
              >
                {resending
                  ? "Sending..."
                  : "Resend OTP"}
              </button>

            </div>

            {/* Back */}

            <button
              type="button"
              onClick={goBackToRegistration}
              disabled={loading || resending}
              className="w-full mt-6 text-sm text-zinc-500 hover:text-zinc-300 transition disabled:opacity-50"
            >
              ← Back to registration
            </button>

          </div>
        )}

        {/* Back to Home */}

        <div className="text-center mt-6">

          <Link
            to="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Back to ApexFit-AI
          </Link>

        </div>

      </div>

    </div>
  );
}