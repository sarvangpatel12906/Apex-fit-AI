import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function WelcomePage() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("Athlete");

  const [hasProfile, setHasProfile] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser =
          localStorage.getItem("user");

        if (savedUser) {
          const user =
            JSON.parse(savedUser);

          setName(
            user.username ||
              user.email?.split("@")[0] ||
              "Athlete"
          );
        }

        const response =
          await api.get("/profile/");

        if (
          response.data.success &&
          response.data.profile
        ) {
          setHasProfile(true);

          const profile =
            response.data.profile;

          if (profile.name) {
            setName(profile.name);
          }
        }

      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        Loading your transformation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      <header className="border-b border-zinc-800">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <Link
            to="/"
            className="text-xl font-bold"
          >
            ApexFit
            <span className="text-cyan-400">
              AI
            </span>
          </Link>

        </div>

      </header>

      <main className="max-w-3xl mx-auto px-6 py-24 text-center">

        <div className="inline-flex px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm">
          YOUR PERSONAL FITNESS SYSTEM
        </div>

        <h1 className="text-5xl font-bold mt-8">

          {name},

          <span className="block text-cyan-400 mt-2">
            ready for your transformation?
          </span>

        </h1>

        <p className="text-zinc-400 text-lg mt-6 max-w-xl mx-auto">

          {hasProfile
            ? "Your fitness profile and personalized plans are ready."
            : "Answer a few questions so ApexFit AI can understand your body, goals and training lifestyle."}

        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

          {!hasProfile && (

            <button
              onClick={() =>
                navigate("/onboarding")
              }
              className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold hover:bg-cyan-400"
            >
              Start My Assessment →
            </button>

          )}

          {hasProfile && (

            <>
              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold hover:bg-cyan-400"
              >
                Go to Dashboard →
              </button>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="rounded-xl border border-zinc-700 px-8 py-4 font-semibold hover:bg-zinc-900"
              >
                Check Your Summary
              </button>
            </>

          )}

        </div>

      </main>

    </div>
  );
}