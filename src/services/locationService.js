import API from "./axios.config";

// SERVICIO GET
export const getProvinces = () => {
  return API.get("/location/provinces");
};

export const getMunicipalitiesByProvince = (provinceId) => {
  return API.get(`/location/municipality/by-province/${provinceId}`);
};
