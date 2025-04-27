import API from "./axios.config";

export const login = (data) => {
	return API.post('/auth/login', data);
}