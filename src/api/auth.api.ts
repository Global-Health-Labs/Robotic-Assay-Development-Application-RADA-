import axios from './axios'

interface LoginResponse {
  access_token: string;
}

interface UserResponse {
  user: {
    confirmed: boolean;
    fullName: string;
    role: string;
  }
}

export const loginRequest = (data: { email: string; password: string }) => 
  axios.post<LoginResponse>('/auth/login', data)

export const registerRequest = (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
  return axios.post('/auth/register', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const forgotPasswordRequest = (email: string) => {
  return axios.post(
    '/auth/forgot-password',
    { email },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export const getProfileRequest = () => 
  axios.get<UserResponse>('/auth/profile')

export const confirmUserRequest = (token: string) => {
  return axios.get(`/auth/confirm/${token}`)
}

export const resendConfirmEmailRequest = (email: string) => {
  return axios.post(
    '/auth/resend-confirm-email',
    { email },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
