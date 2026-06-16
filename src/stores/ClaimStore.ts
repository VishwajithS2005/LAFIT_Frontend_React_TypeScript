import { create } from 'zustand';
import { api } from '../config/axiosConfig';
import type { ResolutionClaim, ClaimRequest } from '../types/Claims';

interface ClaimState {
    yourClaims: ResolutionClaim[];
    approvedClaims: ResolutionClaim[];
    isLoading: boolean;
    error: string | null;

    fetchYourClaims: () => Promise<void>;
    fetchApprovedClaims: () => Promise<void>;
    addClaim: (claim: ClaimRequest) => Promise<void>;
    deleteClaim: (claimId: string) => Promise<void>; // New method
}

export const useClaimStore = create<ClaimState>((set) => ({
    yourClaims: [],
    approvedClaims: [],
    isLoading: false,
    error: null,

    fetchYourClaims: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<ResolutionClaim[]>('/resolution');
            set({ yourClaims: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchApprovedClaims: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<ResolutionClaim[]>(`/resolution/status/APPROVED`);
            set({ approvedClaims: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addClaim: async (claim: ClaimRequest) => {
        try {
            await api.post('/resolution', claim);
            useClaimStore.getState().fetchYourClaims();
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    // New Delete Method
    deleteClaim: async (claimId: string) => {
        try {
            await api.delete(`/resolution/${claimId}`);
            useClaimStore.getState().fetchYourClaims();
        } catch (error: any) {
            set({ error: error.message });
        }
    }
}));