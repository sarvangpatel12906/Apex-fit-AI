from django.contrib.auth.models import User
from rest_framework import serializers

from .models import AIPlan, SavedWorkout, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "age",
            "weight",
            "height",
            "gender",
            "goal",
            "activity_level",
            "bmi",
            "bmr",
            "tdee",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "bmi",
            "bmr",
            "tdee",
            "created_at",
            "updated_at",
        ]


class AIPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPlan
        fields = [
            "id",
            "plan_type",
            "title",
            "plan_data",
            "version",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "version",
            "created_at",
            "updated_at",
        ]


class SavedWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedWorkout
        fields = [
            "id",
            "name",
            "workout_data",
            "notes",
            "completed",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]