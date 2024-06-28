import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:2030/', // Replace with your Web API port
});

//Get Method of Userprofile
export const fetchaDataFromApi = async () => {
  try {
    const response = await apiClient.get('/api/userprofiles/1');
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Update Method of Userprofile
export const updateProfile = async (guId, data) => {
  try {
    const response = await apiClient.put(`/api/userprofiles/${guId}`, data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};


export default apiClient;