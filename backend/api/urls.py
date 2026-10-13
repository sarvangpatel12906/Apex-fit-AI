from django.urls import path

from .views import (
    AIPlanDataListView,
    AIPlanDetailView,
    AIPlanListCreateView,
    DashboardView,
    ForgotPasswordView,
    LoginView,
    ProfileView,
    RegisterView,
    ResendOTPView,
    ResetPasswordView,
    SavedWorkoutDetailView,
    SavedWorkoutListCreateView,
    VerifyOTPView,
    VerifyResetOTPView,
)


urlpatterns = [
    # Authentication

    path(
        "auth/register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "auth/verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp",
    ),

    path(
        "auth/resend-otp/",
        ResendOTPView.as_view(),
        name="resend-otp",
    ),

    path(
        "auth/login/",
        LoginView.as_view(),
        name="login",
    ),

    # Forgot Password

    path(
        "auth/forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    path(
        "auth/verify-reset-otp/",
        VerifyResetOTPView.as_view(),
        name="verify-reset-otp",
    ),

    path(
        "auth/reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),

    # Profile

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    # AI Plans

    path(
        "plans/",
        AIPlanListCreateView.as_view(),
        name="plans",
    ),

    path(
        "plans/<int:pk>/",
        AIPlanDetailView.as_view(),
        name="plan-detail",
    ),

    path(
        "plans/<int:pk>/data/",
        AIPlanDataListView.as_view(),
        name="plan-data",
    ),

    # Saved Workouts

    path(
        "workouts/",
        SavedWorkoutListCreateView.as_view(),
        name="saved-workouts",
    ),

    path(
        "workouts/<int:pk>/",
        SavedWorkoutDetailView.as_view(),
        name="saved-workout-detail",
    ),

    # Dashboard

    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard",
    ),
]