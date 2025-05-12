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

export const getStudentById = (id) => {
  return API.get(`/student/${id}`);
};

// SERVICIO DELETE
export const deleteStudent = (id) => {
  return API.delete(`/student/${id}`);
};
