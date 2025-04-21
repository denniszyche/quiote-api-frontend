const API_BASE_URL = "https://quiote-api.dztestserver.de";

export const fetchFromApi = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
};