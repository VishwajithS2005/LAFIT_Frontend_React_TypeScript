import type { ItemType } from "./Items";

type UUID = string;

export type ActionType = "CLAIMING_FOUND_ITEM" | "RETURNING_LOST_ITEM";

export type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ResolutionClaim {
    id: UUID,
    actionType: ActionType,
    status: ResolutionStatus,
    itemType: ItemType,
    itemName: string,
    itemDescription?: string,
    imageLink?: string,
    itemLocation: string,
    reportedByUsername: string,
    reportedByEmail: string,
    claimantUsername: string,
    claimantEmail: string
};

export interface ClaimRequest {
    itemId: UUID,
    actionType: ActionType
};