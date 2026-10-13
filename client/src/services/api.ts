import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
  Public authentication endpoints.
  These must NOT receive an old JWT token.
*/
const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/register/",
  "/auth/verify-otp/",
  "/auth/resend-otp/",
  "/auth/login/",
];

/*
  Automatically attach JWT access token
  only to authenticated requests.
*/
api.interceptors.request.use((config) => {
  const endpoint = config.url || "";

  const isPublicAuthEndpoint =
    PUBLIC_AUTH_ENDPOINTS.includes(endpoint);

  if (!isPublicAuthEndpoint) {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/*
  REGISTER USER
*/
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await api.post(
    "/auth/register/",
    {
      username: name,
      email,
      password,
    }
  );

  return response.data;
}

/*
  VERIFY OTP
*/
export async function verifyOTP(
  email: string,
  otp: string
) {
  const response = await api.post(
    "/auth/verify-otp/",
    {
      email,
      otp,
    }
  );

  return response.data;
}

/*
  RESEND OTP
*/
export async function resendOTP(
  email: string
) {
  const response = await api.post(
    "/auth/resend-otp/",
    {
      email,
    }
  );

  return response.data;
}

/*
  LOGIN USER
*/
export async function loginUser(
  email: string,
  password: string
) {
  const response = await api.post(
    "/auth/login/",
    {
      email,
      password,
    }
  );

  return response.data;
}

/*
  GET USER PROFILE
*/
export async function getProfile() {
  const response = await api.get(
    "/profile/"
  );

  return response.data;
}

/*
  CREATE OR UPDATE PROFILE
*/
export async function saveProfile(
  profileData: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    goal: string;
    activity_level: string;
  }
) {
  const response = await api.post(
    "/profile/",
    profileData
  );

  return response.data;
}

export default api;