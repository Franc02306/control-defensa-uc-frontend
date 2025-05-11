import API from "./axios.config";

export const getProvinces = () => {
  return API.get("/location/provinces");
};
