import API from "./axios.config";

// SERVICIO POST
export const createStudent = (data) => {
  return API.post("/student", data);
};

// SERVICIO PUT
export const updateStudent = (id, data) => {
  return API.put(`/student/${id}`, data);
};

// SERVICIO GET
export const searchStudents = (name, year, province) => {
  return API.get("/student/search", {
    params: {
      name,
      year,
      province,
    },
  });
};

export const getAverageAge = (year, province) => {
  return API.get("/student/average-age", {
    params: {
      year,
      province,
    },
  });
};

export const getStudentById = (id) => {
  return API.get(`/student/${id}`);
};

export const suggestStudents = (query) => {
  return API.get("student/suggest", {
    params: { query },
  });
};

// SERVICIO DELETE
export const deleteStudent = (id) => {
  return API.delete(`/student/${id}`);
};
