import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // =====================================================
  // STEP 1 — SEND PASSWORD RESET OTP
  // =====================================================

  const handleSendOTP = async(
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/`,
        {
          email: cleanEmail,
        }
      );

      if (response.data.success) {
        setMessage(
          "A password reset OTP has been sent to your email."
        );

        setStep("otp");
      } else {
        setError(
          response.data.error ||
          "Unable to send OTP."
        );
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to send OTP."
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

  // =====================================================
  // STEP 2 — VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async(
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-reset-otp/`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }
      );

      if (response.data.success) {
        setMessage("OTP verified successfully.");

        setStep("password");
      } else {
        setError(
          response.data.error ||
          "Invalid OTP."
        );
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Invalid or expired OTP."
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

  // =====================================================
  // STEP 3 — RESET PASSWORD
  // =====================================================

  const handleResetPassword = async(
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password/`,
        {
          email: email.trim().toLowerCase(),

          // These exact names are required by Django
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      if (response.data.success) {
        setMessage(
          "Password changed successfully. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1500);

      } else {
        setError(
          response.data.error ||
          "Unable to reset password."
        );
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to reset password."
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

        {/* BRAND */}

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

            {step === "email" &&
              "Reset your password"}

            {step === "otp" &&
              "Verify your email"}

            {step === "password" &&
              "Create new password"}

          </h1>

          <p className="text-zinc-400 mt-3">

            {step === "email" &&
              "Enter your email and we'll send you a verification code."}

            {step === "otp" &&
              `Enter the OTP sent to ${email}`}

            {step === "password" &&
              "Choose a strong password for your account."}

          </p>

        </div>

        {/* CARD */}

        <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-8 shadow-2xl">

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* =========================================
              STEP 1 — EMAIL
              ========================================= */}

          {step === "email" && (

            <form
              onSubmit={handleSendOTP}
              className="space-y-6"
            >

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
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>

            </form>

          )}

          {/* =========================================
              STEP 2 — OTP
              ========================================= */}

          {step === "otp" && (

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
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center tracking-[0.4em] text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setOtp("");
                  setStep("email");
                }}
                disabled={loading}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition"
              >
                Use a different email
              </button>

            </form>

          )}

          {/* =========================================
              STEP 3 — NEW PASSWORD
              ========================================= */}

          {step === "password" && (

            <form
              onSubmit={handleResetPassword}
              className="space-y-6"
            >

              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  New password
                </label>

                <div className="relative">

                  <input
                    id="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
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

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-white hover:bg-cyan-400 active:bg-cyan-600 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Changing password..."
                  : "Change Password"}
              </button>

            </form>

          )}

          {/* BACK TO LOGIN */}

          <p className="text-center text-zinc-500 text-sm mt-8">

            Remember your password?{" "}

            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Back to login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}