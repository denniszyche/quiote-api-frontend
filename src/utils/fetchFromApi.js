const API_BASE_URL = "https://quiote-api.dztestserver.de";

export const fetchFromApi = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw errorData;
    }
    const data = await response.json();
    return data;
};