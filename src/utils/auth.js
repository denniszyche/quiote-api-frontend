import {jwtDecode} from "jwt-decode";

export const getUserRoles = () => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    try {
        const decodedToken = jwtDecode(token);
        return decodedToken?.roles || [];
    } catch (error) {
        console.error("Error decoding token:", error);
        return [];
    }
};