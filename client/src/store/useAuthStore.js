import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      register: async (formData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post('/auth/register', formData);

          /*
            Important:
            New accounts are now pending admin approval.
            So we DO NOT save user, accessToken, or refreshToken after register.
            User must wait for admin approval, then login.
          */
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
          });

          return {
            success: true,
            message:
              response.data.message ||
              'Account created successfully. Please wait for admin approval before logging in.',
          };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Registration failed.';

          set({
            isLoading: false,
            error: message,
          });

          return {
            success: false,
            message,
          };
        }
      },

      login: async (formData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post('/auth/login', formData);

          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isLoading: false,
            error: null,
          });

          return {
            success: true,
            message: response.data.message || 'Login successful.',
          };
        } catch (error) {
          const message =
            error.response?.data?.message ||
            'Login failed. Please check your account status.';

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: message,
          });

          return {
            success: false,
            message,
          };
        }
      },

      logout: async () => {
        const currentState = useAuthStore.getState();

        try {
          if (currentState.refreshToken) {
            await api.post('/auth/logout', {
              refreshToken: currentState.refreshToken,
            });
          }
        } catch (error) {
          console.log('Logout API error:', error);
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'soundwave_auth',
    }
  )
);

export default useAuthStore;