import API from "./axios.config";

// SERVICIOS GET
export const getMajors = () => {
  return API.get("/complement/majors");
};

export const getAreas = () => {
  return API.get("/complement/areas");
};

export const getScientificCategories = () => {
  return API.get("/complement/scientific-categories");
};

export const getAcademicRanks = () => {
  return API.get("/complement/academic-ranks");
};
