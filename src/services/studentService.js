import API from "./axios.config";

export const searchStudents = (name, year, province) => {
  return API.get("/student/search", {
    params: {
      name,
      year,
      province,
    },
  });
};
