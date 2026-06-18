import { create } from 'zustand';
import { api } from '../config/axiosConfig';
import type { Item, ItemRequest } from '../types/Items';
import { useToastStore } from './ToastStore';

interface ItemState {
    yourItems: Item[];
    approvedItems: Item[];
    resolvedItems: Item[];
    isLoading: boolean;
    error: string | null;

    fetchYourItems: () => Promise<void>;
    fetchApprovedItems: () => Promise<void>;
    fetchResolvedItems: () => Promise<void>;
    addItem: (item: ItemRequest) => Promise<void>;
    editItem: (id: string, item: ItemRequest) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

export const useItemStore = create<ItemState>((set) => ({
    yourItems: [],
    approvedItems: [],
    resolvedItems: [],
    isLoading: false,
    error: null,

    fetchYourItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Item[]>('/item');
            set({ yourItems: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchApprovedItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Item[]>(`/item/status/APPROVED`);
            set({ approvedItems: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchResolvedItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Item[]>(`/item/status/RESOLVED`);
            set({ resolvedItems: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addItem: async (item: ItemRequest) => {
        try {
            await api.post('/item', item);
            useItemStore.getState().fetchYourItems();
            useToastStore.getState().addToast("Item created successfully!", "success");
        } catch (error: any) {
            set({ error: error.message });
            useToastStore.getState().addToast(error.message, "error");
        }
    },

    editItem: async (id: string, item: ItemRequest) => {
        try {
            await api.put(`/item/${id}`, item);
            useItemStore.getState().fetchYourItems();
            useToastStore.getState().addToast("Item updated successfully!", "success");
        } catch (error: any) {
            set({ error: error.message });
            useToastStore.getState().addToast(error.message, "error");
        }
    },

    deleteItem: async (id: string) => {
        try {
            await api.delete(`/item/${id}`);
            useItemStore.getState().fetchYourItems();
            useToastStore.getState().addToast("Item deleted successfully!", "success");
        } catch (error: any) {
            set({ error: error.message });
            useToastStore.getState().addToast(error.message, "error");
        }
    }
}));