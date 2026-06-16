type UUID = string;

export type ItemType = "LOST" | "FOUND";

export type ItemStatus = "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";

export interface Item {
    id: UUID,
    type: ItemType,
    status: ItemStatus,
    itemName: string,
    itemDescription?: string,
    imageLink?: string,
    itemLocation: string,
    username: string,
    email: string
};

export interface ItemRequest {
    type: ItemType,
    itemName: string,
    itemDescription?: string,
    imageLink?: string,
    itemLocation: string,
};

export interface ChangeItemStatus {
    status: ItemStatus
};