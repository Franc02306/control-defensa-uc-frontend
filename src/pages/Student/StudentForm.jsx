import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createStudent,
  updateStudent,
  getStudentById,
} from "../../services/studentService";
import { getMajors } from "../../services/complementService";
import {
  getProvinces,
  getMunicipalitiesByProvince,
} from "../../services/locationService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useLoading } from "../../context/LoadingContext";
import "./StudentForm.css";

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    age: 0,
    major: "",
    year: 1,
    teacherAverage: 0,
    address: {
      street: "",
      number: "",
      idProvince: null,
      idMunicipality: null,
    },
  });

  // Errores específicos de cada campo
  const [nameError, setNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [streetError, setStreetError] = useState("");

  const [majors, setMajors] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(false); // Se usa al guardar o actualizar
  const toast = useRef(null);

  // Pantalla de carga para toda la vista
  const { showLoading, hideLoading } = useLoading();

  const genders = [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
  ];

  const yearOptions = [
    { label: "Año 1", value: 1 },
    { label: "Año 2", value: 2 },
    { label: "Año 3", value: 3 },
    { label: "Año 4", value: 4 },
    { label: "Año 5", value: 5 },
    { label: "Año 6", value: 6 },
  ];

  useEffect(() => {
    (async () => {
      showLoading(); // Muestra la pantalla de carga global

      try {
        // 1. Provincias
        const provincesResponse = await getProvinces();
        const mappedProvinces = provincesResponse.data.map((p) => ({
          label: p.name,
          value: p.id,
        }));
        setProvinces(mappedProvinces);

        // 2. Carreras
        const majorsResponse = await getMajors();
        const mappedMajors = majorsResponse.data.result.map((m) => ({
          label: m.name,
          value: m.name,
        }));
        setMajors(mappedMajors);

        // 3. Si es edición, cargar estudiante y municipios
        if (id) {
          const studentResponse = await getStudentById(id);
          const data = studentResponse.data.result;

          // Si tiene provincia cargada, traer municipios
          if (data.address && data.address.idProvince) {
            const muniResponse = await getMunicipalitiesByProvince(
              data.address.idProvince
            );
            const mappedMunis = muniResponse.data.map((m) => ({
              label: m.name,
              value: m.id,
            }));
            setMunicipalities(mappedMunis);
          }

          // Setear datos del estudiante en el form
          setFormData((prev) => ({
            ...prev,
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
          }));
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error.response?.data?.message || "Error al cargar datos del formulario.",
          life: 4000,
        });
      } finally {
        hideLoading(); // Siempre oculta la pantalla de carga
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (!formData.birthDate) return;
    const today = new Date();
    let age = today.getFullYear() - formData.birthDate.getFullYear();
    const m = today.getMonth() - formData.birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < formData.birthDate.getDate())) {
      age--;
    }
    setFormData((prev) => ({ ...prev, age: age >= 0 ? age : 0 }));
  }, [formData.birthDate]);

  const handleProvinceChange = async (e) => {
    const selectedProvince = e.value;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        idProvince: selectedProvince,
        idMunicipality: null,
      },
    });

    if (!selectedProvince) {
      setMunicipalities([]);
      return;
    }

    try {
      const response = await getMunicipalitiesByProvince(selectedProvince);
      const mapped = response.data.map((m) => ({ label: m.name, value: m.id }));
      setMunicipalities(mapped);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message ||
          "No se pudieron cargar los municipios",
        life: 4000,
      });
    }
  };

  const handleChange = (e, field) => {
    let value = e.target.value;

    if (field === "firstName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setNameError("El nombre solo debe contener letras.");
      } else {
        setNameError("");
      }
      setFormData({ ...formData, firstName: value });
    } else if (field === "lastName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setLastNameError("El apellido solo debe contener letras.");
      } else {
        setLastNameError("");
      }
      setFormData({ ...formData, lastName: value });
    } else if (field === "address.street") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]/.test(value)) {
        setStreetError(
          "La calle solo permite letras, espacios, puntos y guiones."
        );
      } else if (value.length > 150)
        setStreetError("Máximo 150 caracteres permitidos.");
      else setStreetError("");
      setFormData({
        ...formData,
        address: { ...formData.address, street: value },
      });
    } else if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      major,
      year,
      address: { street, number, idProvince, idMunicipality },
    } = formData;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const streetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !birthDate ||
      !major ||
      !year ||
      !street ||
      !number ||
      !idProvince ||
      !idMunicipality
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Por favor completa todos los campos.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(firstName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Nombres solo debe contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(lastName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Apellidos solo debe contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!streetRegex.test(street)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Calle solo debe contener letras, espacios, puntos y guiones.",
        life: 4000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const finalData = {
      ...formData,
      teacherAverage: 0,
    };

    try {
      if (id) {
        await updateStudent(id, finalData);
        toast.current?.show({
          severity: "success",
          summary: "Actualización",
          detail: "Estudiante actualizado(a) con éxito",
        });
      } else {
        await createStudent(finalData);
        toast.current?.show({
          severity: "success",
          summary: "Registro",
          detail: "Estudiante registrado(a) con éxito",
        });
      }

      navigate("/estudiantes");
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo guardar el estudiante",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-secondary"
          onClick={() => navigate("/estudiantes")}
          style={{
            borderRadius: "50%",
            width: "2.5rem",
            height: "2.5rem",
            fontSize: "1.3rem",
            color: "#495057",
            marginRight: "0.5rem",
          }}
          tooltip="Regresar"
          tooltipOptions={{ position: "bottom" }}
        />
        <h2 style={{ margin: 0 }}>
          {id ? "Editar Estudiante" : "Registrar Estudiante"}
        </h2>
      </div>
      <div className="p-fluid student-form-grid">
        <div className="form-row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="firstName">Nombres</label>
            <InputText
              value={formData.firstName}
              onChange={(e) => handleChange(e, "firstName")}
              maxLength={100}
              placeholder="Ingresar Nombres"
            />
            {formData.firstName.length >= 100 && (
              <small className="p-error">
                Máximo 100 carácteres permitidos
              </small>
            )}
            {nameError && <small className="p-error">{nameError}</small>}
          </div>

          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="lastName">Apellidos</label>
            <InputText
              value={formData.lastName}
              onChange={(e) => handleChange(e, "lastName")}
              maxLength={100}
              placeholder="Ingresar Apellidos"
            />
            {formData.lastName.length >= 100 && (
              <small className="p-error">
                Máximo 100 carácteres permitidos
              </small>
            )}
            {lastNameError && (
              <small className="p-error">{lastNameError}</small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="gender">Género</label>
            <Dropdown
              value={formData.gender}
              options={genders}
              onChange={(e) => handleChange(e, "gender")}
              placeholder="Seleccionar Género"
              disabled={!!id}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-end",
            }}
          >
            <div className="field" style={{ flex: 10 }}>
              <label htmlFor="birthDate">Fecha de Nacimiento</label>
              <Calendar
                value={formData.birthDate}
                onChange={(e) => handleChange(e, "birthDate")}
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha"
                disabled={!!id}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="age">Edad</label>
              <InputText
                value={formData.age}
                disabled
                style={{
                  background: "#f4f6f8",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "65px",
                }}
                tabIndex={-1}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="major">Carrera</label>
            <Dropdown
              value={formData.major}
              options={majors}
              onChange={(e) => handleChange(e, "major")}
              placeholder="Seleccionar Carrera"
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="year">Año</label>
            <Dropdown
              value={formData.year}
              onChange={(e) => handleChange(e, "year")}
              options={yearOptions}
              placeholder="Seleccionar Año"
            />
          </div>
        </div>

        {/* Dropdown Provincia y Municipio */}
        <div className="form-row">
          <div className="field" style={{ flex: 1 }}>
            <label>Provincia</label>
            <Dropdown
              value={formData.address.idProvince}
              options={provinces}
              onChange={handleProvinceChange}
              placeholder="Seleccionar Provincia"
              style={{ flex: 1 }}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Municipio</label>
            <Dropdown
              value={formData.address.idMunicipality}
              options={municipalities}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, idMunicipality: e.value },
                })
              }
              placeholder="Seleccionar Municipio"
              disabled={!formData.address.idProvince}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Dirección (Calle y Número) */}
        <div className="form-row">
          <div className="field" style={{ flex: 1 }}>
            <label>Calle</label>
            <InputText
              value={formData.address.street}
              onChange={(e) => handleChange(e, "address.street")}
              style={{ flex: 2 }}
              maxLength={150}
              placeholder="Ingresar Calle"
            />
            {formData.address.street.length >= 150 && (
              <small className="p-error">
                Máximo 150 carácteres permitidos
              </small>
            )}
            {streetError && <small className="p-error">{streetError}</small>}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Número</label>
            <InputText
              placeholder="Ingresar Número"
              value={formData.address.number}
              onChange={(e) => handleChange(e, "address.number")}
              onBeforeInput={(e) => {
                // Solo permite números (bloquea letras y otros símbolos)
                if (!/^[0-9]$/.test(e.data)) {
                  e.preventDefault();
                }
              }}
              style={{ flex: 1 }}
              maxLength={10}
            />
            {formData.address.number.length >= 10 && (
              <small className="p-error">Máximo 10 dígitos permitidos</small>
            )}
          </div>
        </div>

        {/* Botones alineados y centrados */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <Button
            label="Guardar"
            icon="pi pi-save"
            onClick={handleSubmit}
            loading={loading}
            className="p-button-primary"
          />
          <Button
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/estudiantes")}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
