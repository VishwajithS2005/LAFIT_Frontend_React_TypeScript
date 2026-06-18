export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) {
        console.warn("Invalid JWT structure detected.");
        return false;
    }
    try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);

        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();

        return currentTime < expirationTime;
    } catch (error) {
        console.error("Failed to decode token", error);
        return false;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
};