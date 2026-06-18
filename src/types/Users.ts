type UUID = string;

export type Role = "USER" | "ADMIN";

export interface User {
    id: UUID,
    username: string,
    role: Role,
    email: string
};

export interface UserLoginResponse {
    id: UUID,
    username: string,
    role: Role,
    email: string,
    token: string
};

export interface UserLoginRequest {
    username: string,
    password: string
}

export interface UserRegister {
    username: string,
    password: string,
    email: string
};

export interface ChangeRole {
    role: Role
};

export interface UserUpdate {
    username: string,
    oldPassword: string,
    newPassword: string,
    email?: string
}

export function convertUserLoginToUser(ul: UserLoginResponse): User {
    return {
        id: ul.id,
        username: ul.username,
        role: ul.role,
        email: ul.email
    };
};