import API from "./axios.config";

// SERVICIO POST
export const createProfessor = (data) => {
  return API.post("/professor", data);
};

// SERVICIO PUT
export const updateProfessor = (id, data) => {
  return API.put(`/professor/${id}`, data);
};

// SERVICIO GET
export const searchProfessors = (
  province,
  municipality,
  wentAbroad,
  academicRank
) => {
  return API.get("/professor/search", {
    params: {
      province,
      municipality,
      wentAbroad,
      academicRank,
    },
  });
};

export const getProfessorById = (id) => {
  return API.get(`/professor/${id}`);
};

export const getAverageAgeProfessors = (area, province, wentAbroad) => {
  return API.get("/professor/average-age", {
    params: {
      area,
      province,
      wentAbroad,
    },
  });
};

export const getOldestProfessorAddress = (excludeMunicipality) => {
  return API.get("/professor/oldest-professor-address", {
    params: {
      excludeMunicipality,
    },
  });
};

// SERVICIO DELETE
export const deleteProfessor = (id) => {
  return API.delete(`/professor/${id}`);
};
