import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    AIPlan,
    EmailOTP,
    SavedWorkout,
    UserProfile,
)

from .serializers import (
    AIPlanSerializer,
    SavedWorkoutSerializer,
    UserProfileSerializer,
)


# =========================================================
# REGISTER
# =========================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not username or not email or not password:
            return Response(
                {
                    "success": False,
                    "error": "Username, email and password are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "success": False,
                    "error": "Username already exists.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {
                    "success": False,
                    "error": "Email already exists.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=False,
        )

        otp = str(random.randint(100000, 999999))

        EmailOTP.objects.create(
            user=user,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        try:
            send_mail(
                subject="ApexFit Email Verification",
                message=(
                    f"Your ApexFit verification OTP is: {otp}\n\n"
                    "This OTP will expire in 10 minutes."
                ),
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            user.delete()

            return Response(
                {
                    "success": False,
                    "error": "Unable to send verification OTP.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": True,
                "message": "Registration successful. OTP sent to your email.",
                "email": email,
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# VERIFY REGISTRATION OTP
# =========================================================

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        otp = request.data.get("otp", "").strip()

        if not email or not otp:
            return Response(
                {
                    "success": False,
                    "error": "Email and OTP are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    "success": False,
                    "error": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            is_verified=False,
        ).order_by("-created_at").first()

        if not otp_record:
            return Response(
                {
                    "success": False,
                    "error": "OTP not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if timezone.now() > otp_record.expires_at:
            return Response(
                {
                    "success": False,
                    "error": "OTP has expired.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_record.attempts >= 5:
            return Response(
                {
                    "success": False,
                    "error": "Too many incorrect attempts.",
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if otp_record.otp != str(otp):
            otp_record.attempts += 1
            otp_record.save(update_fields=["attempts"])

            return Response(
                {
                    "success": False,
                    "error": "Invalid OTP.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_record.is_verified = True
        otp_record.save(update_fields=["is_verified"])

        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {
                "success": True,
                "message": "Email verified successfully. You can now log in.",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# RESEND REGISTRATION OTP
# =========================================================

class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {
                    "success": False,
                    "error": "Email is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    "success": False,
                    "error": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_active:
            return Response(
                {
                    "success": False,
                    "error": "Email is already verified.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = str(random.randint(100000, 999999))

        EmailOTP.objects.filter(
            user=user,
            is_verified=False,
        ).delete()

        EmailOTP.objects.create(
            user=user,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        try:
            send_mail(
                subject="ApexFit Email Verification - New OTP",
                message=(
                    f"Your new ApexFit verification OTP is: {otp}\n\n"
                    "This OTP will expire in 10 minutes."
                ),
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            return Response(
                {
                    "success": False,
                    "error": "Unable to send OTP.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": True,
                "message": "A new OTP has been sent to your email.",
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# LOGIN
# =========================================================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {
                    "success": False,
                    "error": "Email and password are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user or not user.check_password(password):
            return Response(
                {
                    "success": False,
                    "error": "Invalid email or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {
                    "success": False,
                    "error": "Please verify your email before logging in.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# FORGOT PASSWORD - SEND OTP
# =========================================================

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {
                    "success": False,
                    "error": "Email is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    "success": False,
                    "error": "No account found with this email.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        otp = str(random.randint(100000, 999999))

        # Remove old unverified OTPs
        EmailOTP.objects.filter(
            user=user,
            is_verified=False,
        ).delete()

        EmailOTP.objects.create(
            user=user,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        try:
            send_mail(
                subject="ApexFit-AI Password Reset",
                message=(
                    f"Hello {user.username},\n\n"
                    f"Your password reset OTP is: {otp}\n\n"
                    "This OTP will expire in 10 minutes.\n\n"
                    "If you did not request a password reset, "
                    "you can safely ignore this email."
                ),
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            return Response(
                {
                    "success": False,
                    "error": "Unable to send password reset OTP.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": True,
                "message": "Password reset OTP sent to your email.",
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# VERIFY PASSWORD RESET OTP
# =========================================================

class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        otp = request.data.get("otp", "").strip()

        if not email or not otp:
            return Response(
                {
                    "success": False,
                    "error": "Email and OTP are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    "success": False,
                    "error": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            is_verified=False,
        ).order_by("-created_at").first()

        if not otp_record:
            return Response(
                {
                    "success": False,
                    "error": "OTP not found. Please request a new OTP.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if timezone.now() > otp_record.expires_at:
            return Response(
                {
                    "success": False,
                    "error": "OTP has expired. Please request a new OTP.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_record.attempts >= 5:
            return Response(
                {
                    "success": False,
                    "error": "Too many incorrect attempts. Request a new OTP.",
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if otp_record.otp != str(otp):
            otp_record.attempts += 1
            otp_record.save(update_fields=["attempts"])

            return Response(
                {
                    "success": False,
                    "error": "Invalid OTP.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_record.is_verified = True
        otp_record.save(update_fields=["is_verified"])

        return Response(
            {
                "success": True,
                "message": "OTP verified successfully.",
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not email:
            return Response(
                {
                    "success": False,
                    "error": "Email is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password or not confirm_password:
            return Response(
                {
                    "success": False,
                    "error": "Both password fields are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {
                    "success": False,
                    "error": "Passwords do not match.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {
                    "success": False,
                    "error": "Password must be at least 8 characters long.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    "success": False,
                    "error": "User not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Make sure a reset OTP was successfully verified
        verified_otp = EmailOTP.objects.filter(
            user=user,
            is_verified=True,
        ).order_by("-created_at").first()

        if not verified_otp:
            return Response(
                {
                    "success": False,
                    "error": "Please verify your password reset OTP first.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if timezone.now() > verified_otp.expires_at:
            return Response(
                {
                    "success": False,
                    "error": "OTP verification has expired. Please request a new OTP.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        # Delete all OTPs after successful password reset
        EmailOTP.objects.filter(user=user).delete()

        return Response(
            {
                "success": True,
                "message": "Password changed successfully. You can now log in.",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# DASHBOARD
# =========================================================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        profile = UserProfile.objects.filter(
            user=user
        ).first()

        workout_plans = AIPlan.objects.filter(
            user=user,
            plan_type="workout",
            status="active",
        ).order_by("-updated_at")

        diet_plans = AIPlan.objects.filter(
            user=user,
            plan_type="diet",
            status="active",
        ).order_by("-updated_at")

        saved_workouts = SavedWorkout.objects.filter(
            user=user
        ).order_by("-updated_at")

        return Response(
            {
                "success": True,
                "profile": (
                    UserProfileSerializer(profile).data
                    if profile
                    else None
                ),
                "workout_plans": AIPlanSerializer(
                    workout_plans,
                    many=True,
                ).data,
                "diet_plans": AIPlanSerializer(
                    diet_plans,
                    many=True,
                ).data,
                "saved_workouts": SavedWorkoutSerializer(
                    saved_workouts,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# PROFILE
# =========================================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.filter(
            user=request.user
        ).first()

        return Response(
            {
                "success": True,
                "profile": (
                    UserProfileSerializer(profile).data
                    if profile
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        profile = UserProfile.objects.filter(
            user=request.user
        ).first()

        if profile:
            serializer = UserProfileSerializer(
                profile,
                data=request.data,
                partial=True,
            )
        else:
            serializer = UserProfileSerializer(
                data=request.data
            )

        if serializer.is_valid():
            profile = serializer.save(
                user=request.user
            )

            return Response(
                {
                    "success": True,
                    "profile": UserProfileSerializer(profile).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# AI PLANS
# =========================================================

class AIPlanListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plan_type = request.query_params.get("type")

        plans = AIPlan.objects.filter(
            user=request.user
        ).order_by("-updated_at")

        if plan_type in ["workout", "diet"]:
            plans = plans.filter(plan_type=plan_type)

        serializer = AIPlanSerializer(
            plans,
            many=True,
        )

        return Response(
            {
                "success": True,
                "plans": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = AIPlanSerializer(
            data=request.data
        )

        if serializer.is_valid():
            plan = serializer.save(
                user=request.user
            )

            return Response(
                {
                    "success": True,
                    "plan": AIPlanSerializer(plan).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class AIPlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_plan(self, request, pk):
        return AIPlan.objects.filter(
            pk=pk,
            user=request.user,
        ).first()

    def get(self, request, pk):
        plan = self.get_plan(request, pk)

        if not plan:
            return Response(
                {
                    "success": False,
                    "error": "Plan not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "plan": AIPlanSerializer(plan).data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self.update_plan(
            request,
            pk,
            partial=False,
        )

    def patch(self, request, pk):
        return self.update_plan(
            request,
            pk,
            partial=True,
        )

    def update_plan(self, request, pk, partial):
        plan = self.get_plan(request, pk)

        if not plan:
            return Response(
                {
                    "success": False,
                    "error": "Plan not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AIPlanSerializer(
            plan,
            data=request.data,
            partial=partial,
        )

        if serializer.is_valid():
            plan = serializer.save()

            return Response(
                {
                    "success": True,
                    "plan": AIPlanSerializer(plan).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        plan = self.get_plan(request, pk)

        if not plan:
            return Response(
                {
                    "success": False,
                    "error": "Plan not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        plan.delete()

        return Response(
            {
                "success": True,
                "message": "Plan deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


class AIPlanDataListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        plan = AIPlan.objects.filter(
            pk=pk,
            user=request.user,
        ).first()

        if not plan:
            return Response(
                {
                    "success": False,
                    "error": "Plan not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "plan": AIPlanSerializer(plan).data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# SAVED WORKOUTS
# =========================================================

class SavedWorkoutListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workouts = SavedWorkout.objects.filter(
            user=request.user
        ).order_by("-updated_at")

        return Response(
            {
                "success": True,
                "workouts": SavedWorkoutSerializer(
                    workouts,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = SavedWorkoutSerializer(
            data=request.data
        )

        if serializer.is_valid():
            workout = serializer.save(
                user=request.user
            )

            return Response(
                {
                    "success": True,
                    "workout": SavedWorkoutSerializer(
                        workout
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class SavedWorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_workout(self, request, pk):
        return SavedWorkout.objects.filter(
            pk=pk,
            user=request.user,
        ).first()

    def get(self, request, pk):
        workout = self.get_workout(request, pk)

        if not workout:
            return Response(
                {
                    "success": False,
                    "error": "Workout not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "workout": SavedWorkoutSerializer(workout).data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self.update_workout(
            request,
            pk,
            partial=False,
        )

    def patch(self, request, pk):
        return self.update_workout(
            request,
            pk,
            partial=True,
        )

    def update_workout(self, request, pk, partial):
        workout = self.get_workout(request, pk)

        if not workout:
            return Response(
                {
                    "success": False,
                    "error": "Workout not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SavedWorkoutSerializer(
            workout,
            data=request.data,
            partial=partial,
        )

        if serializer.is_valid():
            workout = serializer.save()

            return Response(
                {
                    "success": True,
                    "workout": SavedWorkoutSerializer(workout).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        workout = self.get_workout(request, pk)

        if not workout:
            return Response(
                {
                    "success": False,
                    "error": "Workout not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        workout.delete()

        return Response(
            {
                "success": True,
                "message": "Workout deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )