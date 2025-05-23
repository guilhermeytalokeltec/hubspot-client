export const API_CONFIG = {
    baseUrl: 'http://localhost:3000',
    endpoints: {
        listContacts: '/list-contacts',
        contactInfo: (id: string) => `/contact-info/${id}`,
        updateZip: (id: string) => `/update-zip/${id}`,
        updateCity: (id: string) => `/update-city/${id}`,
        geocode: '/geocode'
    }
};

export class ApiError extends Error {
    public status?: number;
    public response?: any;

    constructor(
        message: string,
        status?: number,
        response?: any
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}

export const handleApiResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.error || `HTTP Error: ${response.status}`,
            response.status,
            errorData
        );
    }

    return response.json();
};

export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        return handleApiResponse<T>(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Network error occurred');
    }
};