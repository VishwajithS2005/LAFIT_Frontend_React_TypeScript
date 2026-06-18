import { create } from 'zustand';
import { api } from '../config/axiosConfig';
import { useToastStore } from './ToastStore';

export interface UserResponse {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN';
    email: string;
}

export interface UserUpdateRequest {
    username?: string;
    oldPassword?: string;
    newPassword?: string;
    email?: string;
}

interface UserState {
    users: UserResponse[];
    isLoading: boolean;
    fetchAllUsers: () => Promise<void>;
    changeRole: (id: string, role: 'USER' | 'ADMIN') => Promise<void>;
    updateProfile: (id: string, data: UserUpdateRequest) => Promise<boolean>;
    deleteUser: (id: string) => Promise<void>;
    deleteSelf: () => Promise<boolean>;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    isLoading: false,

    fetchAllUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get<UserResponse[]>('/user');
            set({ users: response.data, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            useToastStore.getState().addToast(error.message, "error");
        }
    },

    changeRole: async (id: string, role: 'USER' | 'ADMIN') => {
        try {
            await api.patch(`/user/${id}`, { role });
            useUserStore.getState().fetchAllUsers();
            useToastStore.getState().addToast(`User role updated to ${role}.`, "success");
        } catch (error: any) {
            useToastStore.getState().addToast("Failed to change user role.", "error");
        }
    },

    updateProfile: async (id: string, data: UserUpdateRequest) => {
        try {
            await api.put(`/user/${id}`, data);
            useToastStore.getState().addToast("Profile updated successfully!", "success");
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to update profile.";
            useToastStore.getState().addToast(msg, "error");
            return false;
        }
    },

    deleteUser: async (id: string) => {
        try {
            await api.delete(`/user/${id}`);
            useUserStore.getState().fetchAllUsers();
            useToastStore.getState().addToast("User deleted successfully.", "success");
        } catch (error: any) {
            useToastStore.getState().addToast(error.message, "error");
        }
    },

    deleteSelf: async () => {
        try {
            await api.delete('/user');
            useToastStore.getState().addToast("Account deleted successfully.", "success");
            return true;
        } catch (error: any) {
            useToastStore.getState().addToast(error.message, "error");
            return false;
        }
    }
}));