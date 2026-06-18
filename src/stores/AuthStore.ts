import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    type User,
    type UserLoginRequest,
    type UserRegister,
    type UserLoginResponse,
    convertUserLoginToUser
} from '../types/Users';
import { api } from '../config/axiosConfig';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (credentials: UserLoginRequest) => Promise<void>;
    register: (credentials: UserRegister) => Promise<void>;
    logout: () => void;
    verifyToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post<UserLoginResponse>('/user/login', credentials);

                    const loginData: UserLoginResponse = response.data;
                    const user: User = convertUserLoginToUser(loginData);

                    set({
                        user: user,
                        token: loginData.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to log in',
                        isLoading: false
                    });
                }
            },

            register: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post<User>('/user', credentials);
                    const user: User = response.data;
                    set({
                        user: user,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    window.location.href = "/login"
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to register',
                        isLoading: false
                    });
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false, error: null });
            },

            verifyToken: async () => {
                const { token } = get();
                if (!token) return false;

                try {
                    await api.get('/user/verify');
                    return true;
                } catch (error) {
                    set({ user: null, token: null, isAuthenticated: false, error: null });
                    return false;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);