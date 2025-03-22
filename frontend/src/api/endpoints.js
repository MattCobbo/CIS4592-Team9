import axios from 'axios'
import { SERVER_URL } from '../constants/constants'

const BASE_URL = SERVER_URL

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

//If login credentials timeout while active, call new refresh_token
api.interceptors.response.use(
    (response) => response,
    async error => {
        const original_request = error.config

        if (error.response?.status === 401 && !original_request._retry) {
            original_request._retry = true;

            try {
                await refresh_token();
                return api(original_request);
            } catch (refreshError) {
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export const get_user_profile_data = async (username) => {
    const response = await api.get(`/user_data/${username}/`);
    return response.data
}

const refresh_token = async () => {
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

export const create_post = async ({ description, organization_id = null }) => {
    const response = await api.post("/create_post/", {
        description,
        organization_id,
    });
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
    const response = await api.patch('/update_user/', values, {headers: {'Content-Type': 'multipart/form-data'}})
    return response.data
}

// Organization API Calls

export const createOrganization = async (name, bio) => {
    const response = await api.post('/organization/create/', { name, bio });
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
    const response = await api.post(`/organization/join/${org_id}/`);
    return response.data;
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
