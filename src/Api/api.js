import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:2030/',
  headers: {
    'Content-Type': 'application/json',
  },
});

//Get Method of Userprofile
export const fetchaDataFromApi = async () => {
  try {
    const response = await apiClient.get('/api/userprofiles');
    // const data = await response.json();
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


//This is a get method by Id
debugger
export const fetchDataByIdFromApi = async (userProfileId) => {
  try {
    const response = await apiClient.get(`/api/userprofiles/${userProfileId}`);
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

//This is a LoginId To get a UserProfileId get Method
export const fetchUserProfileIdByLoginId = async (loginId) => {
  try {
    const response = await apiClient.get(`/api/login/${loginId}`);
    return response.data.userProfileId; 
  } catch (error) {
    // if (error.response) {
    //   console.error('Error response:', error.response.data);
    //   console.error('Error status:', error.response.status);
    //   console.error('Error headers:', error.response.headers);
    // } else if (error.request) {
    //   console.error('Error request:', error.request);
    // } else {
      console.error('Error message:', error.message);
    // }
    throw error;
  }
};

export default apiClient;