import API from "./axios.config";

// SERIVCIO POST
export const registerUser = (data) => {
  return API.post("/user", data);
};
