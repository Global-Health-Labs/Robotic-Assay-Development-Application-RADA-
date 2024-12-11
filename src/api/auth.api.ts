import axios from './axios';

type UserResponse = {
  user: {
    id: string;
    email: string;
    confirmed: boolean;
    fullName: string;
    role: string;
  };
};

type LoginResponse = {
  access_token: string;
  user: UserResponse['user'];
};

type ResetPasswordResponse = {
  access_token: string;
  message: string;
};

export const loginRequest = (data: { email: string; password: string }) =>
  axios.post<LoginResponse>('/auth/login', data);

export const registerRequest = (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
  return axios.post('/auth/register', userData);
};

export const forgotPasswordRequest = (email: string) => {
  return axios.post('/auth/forgot-password', { email });
};

export const getProfileRequest = () => axios.get<UserResponse>('/auth/profile');

export const confirmUserRequest = (token: string) => {
  return axios.get(`/auth/confirm/${token}`);
};

export const resendConfirmEmailRequest = (email: string) => {
  return axios.post('/auth/resend-confirm-email', { email });
};

export const resetPassword = (token: string, newPassword: string) =>
  axios.post<ResetPasswordResponse>('/auth/reset-password', {
    token,
    password: newPassword,
  });

export const resetPasswordRequest = (data: { token: string; password: string }) => {
  return axios.post('/auth/reset-password', data);
};
