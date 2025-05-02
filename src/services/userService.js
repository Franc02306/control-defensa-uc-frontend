import API from "./axios.config";

export const registerUser = (data) => {
	return API.post('/user', data);
};