import axios from 'axios'
import { SERVER_URL } from '../constants/constants'

const BASE_URL = SERVER_URL

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

// Simple token refresh tracking
let isRefreshing = false;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds between refresh attempts

//If login credentials timeout while active, call new refresh_token
api.interceptors.response.use(
    (response) => response,
    async error => {
        const original_request = error.config

        // Only handle 401 unauthorized errors for refresh
        if (error.response?.status === 401 && !original_request._retry) {
            original_request._retry = true;

            // Check if we're within cooldown period
            const now = Date.now();
            if (now - lastRefreshTime < REFRESH_COOLDOWN) {
                console.log("Token refresh on cooldown, skipping");
                return Promise.reject(error);
            }

            // Check if already refreshing
            if (isRefreshing) {
                console.log("Already refreshing token, skipping duplicate attempt");
                return Promise.reject(error);
            }

            try {
                isRefreshing = true;
                lastRefreshTime = now;

                const response = await api.post('/token/refresh/');

                if (response.data.success) {
                    // Try original request again
                    isRefreshing = false;
                    return api(original_request);
                } else {
                    // Refresh failed
                    isRefreshing = false;
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                isRefreshing = false;

                // Check for rate limiting (429)
                if (refreshError.response?.status === 429) {
                    console.log("Rate limited on token refresh, will retry later");
                    return Promise.reject(error);
                }

                // Any other error during refresh should redirect to login
                console.log("Failed to refresh token:", refreshError);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)

export const get_user_profile_data = async (username) => {
    const response = await api.get(`/user_data/${username}/`);
    return response.data
}

export const refresh_token = async () => {
    const response = await api.post('/token/refresh/');
    return response.data
}

export const login = async (username, password) => {
    const response = await api.post('/token/', { username, password });
    return response.data
}

export const register = async (username, email, firstName, lastName, password) => {
    const response = await api.post('/register/', { username: username, email: email, first_name: firstName, last_name: lastName, password: password });
    return response.data
}

export const get_auth = async () => {
    const response = await api.get(`/authenticated/`);
    return response.data
}

export const toggleFollow = async (username) => {
    const response = await api.post('/toggle_follow/', { username: username });
    return response.data
}

export const get_users_posts = async (username) => {
    const response = await api.get(`/posts/${username}/`);
    return response.data
}

export const toggleLike = async (id) => {
    const response = await api.post('/toggleLike/', { id: id });
    return response.data
}

export const create_post = async (description) => {
    const response = await api.post('/create_post/', { description });
    return response.data;
};

export const get_posts = async (num) => {
    const response = await api.get(`/get_posts/?page=${num}`)
    return response.data
}

export const search_users = async (search) => {
    const response = await api.get(`/search/?query=${search}`, { timeout: 3000 })
    return response.data
}

export const logout = async () => {
    const response = await api.post('/logout/')
    return response.data
}

export const update_user = async (values) => {
    const response = await api.patch('/update_user/', values, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
}

// Organization API Calls

export const createOrganization = async (name, bio) => {
    const response = await api.post('/organization/create/', { name, bio });
    return response.data;
};

export const updateOrganization = async (orgId, formData) => {
    const response = await api.patch(`/organization/${orgId}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getOrganizations = async () => {
    const response = await api.get('/organization/all/');
    return response.data;
};

export const getOrganization = async (org_id) => {
    const response = await api.get(`/organization/${org_id}/`);
    return response.data;
};

export const joinOrganization = async (org_id) => {
    try {
        const response = await api.post(`/organization/join/${org_id}/`);
        return response.data;
    } catch (error) {
        // Properly handle errors and rethrow them for component handling
        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getOrganizationPosts = async (org_id) => {
    const response = await api.get(`/organization/posts/${org_id}/`);
    return response.data;
};

export const getUserOrganizations = async () => {
    const response = await api.get('/organization/user/');
    return response.data;
};

export const getOrganizationFeed = async () => {
    const response = await api.get("/organization/feed/");
    return response.data;
};

export const create_org_post = async ({ description, organization_id }) => {
    const response = await api.post("/create_org_post/", {
        description,
        organization_id,  // ✅ Make sure the organization ID is sent
    });
    return response.data;
};

export const createEvent = async ({ organization_id, title, description, starts_at, }) => {
    const response = await api.post(`/organization/${organization_id}/events/`, { organization_id, title, description, starts_at, });
    return response.data;
};

export const getOrganizationEvents = async (org_id) => {
    const response = await api.get(`/organization/${org_id}/events/`);
    return response.data;      // array of EventSerializer objects
};

export const updateRSVP = async (event_id, rsvp) => {
    const response = await api.patch(`/events/${event_id}/rsvp/`, { rsvp });
    return response.data;
};

export const search_organizations = async (search) => {
    const response = await api.get(`/search_organizations/?query=${search}`, { timeout: 3000 })
    return response.data
};

export const getJobs = async (page = 1) => {
    const response = await api.get(`/jobs/?page=${page}`);
    return response.data;
};

export const getJob = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/`);
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await api.post('/jobs/', jobData);
    return response.data;
};

export const deleteJob = async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}/`);
    return response.data;
};

export const getMyJobs = async () => {
    const response = await api.get('/my-jobs/');
    return response.data;
};

export const applyForJob = async (jobId, applicationData) => {
    console.log(`Applying for job ${jobId} with data:`, applicationData);

    try {
        const response = await api.post(`/jobs/${jobId}/apply/`, applicationData);
        console.log("Application response:", response.data);
        return response.data;
    } catch (error) {
        console.error("API error details:", error.response?.data);
        throw error;
    }
};

export const getJobApplications = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications/`);
    return response.data;
};