import API from "./axios.config";

// SERIVCIO POST
export const registerUser = (data) => {
  return API.post("/user", data);
};

export const approveUser = (email) => {
  return API.post(`/user/approve?email=${encodeURIComponent(email)}`);
};

export const rejectUser = (email) => {
  return API.post(`/user/reject?email=${encodeURIComponent(email)}`);
};
