from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    """
    Stores the fitness profile of an ApexFit user.
    BMI, BMR and TDEE are calculated automatically.
    """

    GOAL_CHOICES = [
        ("Fat Loss", "Fat Loss"),
        ("Muscle Building", "Muscle Building"),
        ("Body Recomposition", "Body Recomposition"),
        ("Athletic Performance", "Athletic Performance"),
        ("General Fitness", "General Fitness"),
    ]

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    ACTIVITY_CHOICES = [
        ("Sedentary", "Sedentary"),
        ("Lightly Active", "Lightly Active"),
        ("Moderately Active", "Moderately Active"),
        ("Very Active", "Very Active"),
        ("Extremely Active", "Extremely Active"),
    ]

    ACTIVITY_MULTIPLIERS = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725,
        "Extremely Active": 1.9,
    }

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="fitness_profile",
    )

    age = models.PositiveIntegerField()

    weight = models.FloatField(
        help_text="Weight in kilograms."
    )

    height = models.FloatField(
        help_text="Height in centimeters."
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
    )

    goal = models.CharField(
        max_length=50,
        choices=GOAL_CHOICES,
    )

    activity_level = models.CharField(
        max_length=30,
        choices=ACTIVITY_CHOICES,
        default="Moderately Active",
    )

    bmi = models.FloatField(default=0)
    bmr = models.FloatField(default=0)
    tdee = models.FloatField(default=0)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def calculate_metrics(self):
        """
        Calculate BMI, BMR and TDEE.
        """

        if self.age <= 0 or self.weight <= 0 or self.height <= 0:
            self.bmi = 0
            self.bmr = 0
            self.tdee = 0
            return

        height_meters = self.height / 100

        # BMI
        self.bmi = round(
            self.weight / (height_meters ** 2),
            2,
        )

        # Mifflin-St Jeor BMR
        if self.gender == "Male":
            self.bmr = round(
                (10 * self.weight)
                + (6.25 * self.height)
                - (5 * self.age)
                + 5,
                2,
            )

        elif self.gender == "Female":
            self.bmr = round(
                (10 * self.weight)
                + (6.25 * self.height)
                - (5 * self.age)
                - 161,
                2,
            )

        else:
            self.bmr = 0

        # TDEE
        multiplier = self.ACTIVITY_MULTIPLIERS.get(
            self.activity_level,
            1.55,
        )

        self.tdee = round(
            self.bmr * multiplier,
            2,
        )

    def save(self, *args, **kwargs):
        """
        Automatically calculate BMI, BMR and TDEE
        before saving the profile.
        """

        self.calculate_metrics()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.goal}"


class AIPlan(models.Model):
    """
    Stores structured AI-generated workout and diet plans.
    """

    PLAN_TYPE_CHOICES = [
        ("workout", "Workout"),
        ("diet", "Diet"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("archived", "Archived"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ai_plans",
    )

    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPE_CHOICES,
    )

    title = models.CharField(
        max_length=200,
        default="ApexFit AI Plan",
    )

    plan_data = models.JSONField(
        default=dict,
    )

    version = models.PositiveIntegerField(
        default=1,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.plan_type} - "
            f"v{self.version}"
        )


class SavedWorkout(models.Model):
    """
    Stores workouts completed or saved by the user.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="saved_workouts",
    )

    name = models.CharField(
        max_length=200,
    )

    workout_data = models.JSONField(
        default=dict,
    )

    notes = models.TextField(
        blank=True,
        default="",
    )

    completed = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.name}"
        )


class EmailOTP(models.Model):
    """
    Stores a temporary OTP for email verification.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_otps",
    )

    otp = models.CharField(
        max_length=6,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    expires_at = models.DateTimeField()

    is_verified = models.BooleanField(
        default=False,
    )

    attempts = models.PositiveIntegerField(
        default=0,
    )

    def __str__(self):
        return f"{self.user.username} - Email OTP"