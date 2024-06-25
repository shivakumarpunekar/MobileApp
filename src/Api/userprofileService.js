// api/userprofileService.js
import api from './api';

export const getUserProfiles = async () => {
    const response = await api.get('http://localhost:44341/api/userprofiles');
    return response.data;
};

export const getUserProfileById = async () => {
    try {
        debugger
        const response = await fetch('http://localhost:44341/api/userprofiles/1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const profiles = await response.json();
        return profiles;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error.message);
        throw error;
    }
};

export const createUserProfile = async (userprofile) => {
    const response = await api.post('/userprofiles', userprofile);
    return response.data;
};

export const updateUserProfile = async (id, userprofile) => {
    const response = await api.put(`/userprofiles/${id}`, userprofile);
    return response.data;
};

export const deleteUserProfile = async (id) => {
    const response = await api.delete(`/userprofiles/${id}`);
    return response.data;
};
