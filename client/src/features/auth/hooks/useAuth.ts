import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, setAccessToken } from '../../../config/api.client';
import { useAuthStore } from '../../../stores/auth.store';
import {
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AuthApiResponse,
  User,
} from '../../../types/auth';

export interface ApiCustomError {
  message?: string;
  statusCode?: number;
  errors?: Array<{ field: string; message: string }> | string;
}

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.logout);

  // Initialize current user session query
  const useInitUser = () =>
    useQuery<AuthApiResponse<{ user: User }>>({
      queryKey: ['current-user'],
      queryFn: async () => {
        const response = await apiClient.get<unknown, AuthApiResponse<{ user: User }>>('/auth/me');
        if (response?.data?.user) {
          setUser(response.data.user);
        }
        return response;
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });

  // Registration Mutation
  const registerMutation = useMutation<AuthApiResponse<{ user: User; accessToken: string }>, ApiCustomError, RegisterPayload>({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await apiClient.post<unknown, AuthApiResponse<{ user: User; accessToken: string }>>('/auth/register', payload);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.accessToken && data?.data?.user) {
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
      }
    },
  });

  // Login Mutation
  const loginMutation = useMutation<AuthApiResponse<{ user: User; accessToken: string }>, ApiCustomError, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const response = await apiClient.post<unknown, AuthApiResponse<{ user: User; accessToken: string }>>('/auth/login', payload);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.accessToken && data?.data?.user) {
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
      }
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation<AuthApiResponse<void>, ApiCustomError, void>({
    mutationFn: async () => {
      return apiClient.post<unknown, AuthApiResponse<void>>('/auth/logout');
    },
    onSettled: () => {
      setAccessToken(null);
      clearAuth();
    },
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation<AuthApiResponse<{ user: User }>, ApiCustomError, UpdateProfilePayload>({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.username) formData.append('username', payload.username);
      if (payload.avatarFile) formData.append('avatar', payload.avatarFile);

      const response = await apiClient.patch<unknown, AuthApiResponse<{ user: User }>>('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.user) {
        setUser(data.data.user);
      }
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation<AuthApiResponse<void>, ApiCustomError, ChangePasswordPayload>({
    mutationFn: async (payload: ChangePasswordPayload) => {
      return apiClient.patch<unknown, AuthApiResponse<void>>('/auth/change-password', payload);
    },
  });

  return {
    useInitUser,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
  };
};
