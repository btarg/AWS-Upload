export const refreshToken = async () => {
    try {
        const response = await fetch("/auth/refresh");
        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }
        const data = await response.json();
        return data.accessToken;
    } catch (error) {
        console.error(error);
        throw error;
    }
};