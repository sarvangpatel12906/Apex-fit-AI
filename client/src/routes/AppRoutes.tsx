import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import WelcomePage from "../pages/WelcomePage";
import OnboardingPage from "../pages/OnboardingPage";
import BodyMetricsPage from "../pages/BodyMetricsPage";
import DashboardPage from "../pages/DashboardPage";
import WorkoutPage from "../pages/WorkoutPage.fixed";
import WorkoutSummaryPage from "../pages/WorkoutSummaryPage.fixed";
import ProfilePage from "../pages/ProfilePage";
import CalculatorPage from "../pages/CalculatorPage";
import PrintSummaryPage from "../pages/PrintSummaryPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* Setup / onboarding */}
        <Route
          path="/welcome"
          element={<WelcomePage />}
        />

        <Route
          path="/setup"
          element={<OnboardingPage />}
        />

        <Route
          path="/onboarding"
          element={<OnboardingPage />}
        />

        <Route
          path="/body-metrics"
          element={<BodyMetricsPage />}
        />

        {/* Main ApexFit */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/calculator"
          element={<CalculatorPage />}
        />

        <Route
          path="/print-summary"
          element={<PrintSummaryPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        {/* Workout */}
        <Route
          path="/workout"
          element={<WorkoutPage />}
        />

        <Route
          path="/workout-summary"
          element={<WorkoutSummaryPage />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}