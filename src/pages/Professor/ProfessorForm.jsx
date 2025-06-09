import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createProfessor,
  updateProfessor,
  getProfessorById,
} from "../../services/professorService";
import {
  getProvinces,
  getMunicipalitiesByProvince,
} from "../../services/locationService";
import {
  getAreas,
  getAcademicRanks,
  getScientificCategories,
} from "../../services/complementService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const ProfessorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    age: 0,
    area: "",
    wentAbroad: false,
    academicRank: "",
    scientificCategory: "",
    address: {
      idProvince: null,
      idMunicipality: null,
      street: "",
      number: "",
    },
  });

  // Errores específicos de cada campo
  const [nameError, setNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [streetError, setStreetError] = useState("");

  // Opciones de dropdowns
  const [genders] = useState([
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
  ]);
  const [areas, setAreas] = useState([]);
  const [academicRanks, setAcademicRanks] = useState([]);
  const [scientificCategories, setScientificCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  // Cargar municipios según provincia seleccionada
  const handleProvinceChange = useCallback(
    async (e, keepMunicipality = false) => {
      const selectedProvince = e.value;
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          idProvince: selectedProvince,
          idMunicipality: keepMunicipality ? prev.address.idMunicipality : null,
        },
      }));

      if (!selectedProvince) {
        setMunicipalities([]);
        return;
      }

      try {
        const response = await getMunicipalitiesByProvince(selectedProvince);
        setMunicipalities(
          response.data.map((m) => ({ label: m.name, value: m.id }))
        );
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
    },
    [setFormData, setMunicipalities, toast]
  );

  // Cargar datos si está editando
  const fetchProfessor = useCallback(
    async (professorId) => {
      try {
        const response = await getProfessorById(professorId);
        setFormData((prev) => ({
          ...prev,
          ...response.data.result,
          birthDate: response.data.result.birthDate
            ? new Date(response.data.result.birthDate)
            : null,
        }));
        if (response.data.result.address.idProvince) {
          await handleProvinceChange(
            {
              value: response.data.result.address.idProvince,
            },
            true
          );
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "No se pudo cargar el profesor",
          life: 4000,
        });
      }
    },
    [handleProvinceChange, toast]
  );

  useEffect(() => {
    if (id) fetchProfessor(id);
  }, [id, fetchProfessor]);

  // Cargar listas para los dropdowns (áreas, categorías, provincias)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          areasRes,
          academicRanksRes,
          scientificCategoriesRes,
          provincesRes,
        ] = await Promise.all([
          getAreas(),
          getAcademicRanks(),
          getScientificCategories(),
          getProvinces(),
        ]);
        setAreas(
          (areasRes.data.result || []).map((a) => ({
            label: a.name,
            value: a.name,
          }))
        );
        setAcademicRanks(
          (academicRanksRes.data.result || []).map((r) => ({
            label: r.name,
            value: r.name,
          }))
        );
        setScientificCategories(
          (scientificCategoriesRes.data.result || []).map((r) => ({
            label: r.name,
            value: r.name,
          }))
        );
        setProvinces(
          (provincesRes.data || []).map((p) => ({
            label: p.name,
            value: p.id,
          }))
        );
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message ||
            "No se pudieron cargar los catálogos requeridos. Verifica tu conexión o consulta con soporte.",
          life: 6000,
        });
      }
    };
    loadData();
  }, []);

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

  // Manejador de cambios generales
  const handleChange = (e, field) => {
    let value = e.target ? e.target.value : e.value; // Para Dropdown/InputSwitch
    // Validaciones en tiempo real
    if (field === "firstName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setNameError("El nombre solo debe contener letras.");
      } else {
        setNameError("");
      }
      setFormData((prev) => ({ ...prev, firstName: value }));
    } else if (field === "lastName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setLastNameError("El apellido solo debe contener letras.");
      } else {
        setLastNameError("");
      }
      setFormData((prev) => ({ ...prev, lastName: value }));
    } else if (field === "address.street") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]/.test(value)) {
        setStreetError(
          "La calle solo permite letras, espacios, puntos y guiones."
        );
      } else if (value.length > 150)
        setStreetError("Máximo 150 caracteres permitidos.");
      else setStreetError("");
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, street: value },
      }));
    } else if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Valida todo el formulario
  const validateForm = () => {
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      area,
      academicRank,
      scientificCategory,
      address: { idProvince, idMunicipality, street, number },
    } = formData;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const streetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !birthDate ||
      !area ||
      academicRank === "" ||
      scientificCategory === "" ||
      !idProvince ||
      !idMunicipality ||
      !street ||
      !number
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Por favor completa todos los campos obligatorios.",
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

    if (street && !streetRegex.test(street)) {
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

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (id) {
        await updateProfessor(id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Actualización",
          detail: "Profesor actualizado(a) con éxito",
        });
      } else {
        await createProfessor(formData);
        toast.current?.show({
          severity: "success",
          summary: "Registro",
          detail: "Profesor registrado(a) con éxito",
        });
      }

      navigate("/profesores");
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo guardar el profesor",
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
          onClick={() => navigate("/profesores")}
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
        <h2>{id ? "Editar Profesor" : "Registrar Profesor"}</h2>
      </div>
      <div className="p-fluid professor-form-grid">
        <div className="form-row">
          {/* Nombres y Apellidos */}
          <div className="field">
            <label htmlFor="firstName">Nombres</label>
            <InputText
              value={formData.firstName}
              onChange={(e) => handleChange(e, "firstName")}
              maxLength={100}
              placeholder="Ingresar Nombres"
            />
            {(formData.firstName || "").length >= 100 && (
              <small className="p-error">
                Máximo 100 caracteres permitidos
              </small>
            )}
            {nameError && <small className="p-error">{nameError}</small>}
          </div>

          {/* Apellido */}
          <div className="field">
            <label htmlFor="lastName">Apellidos</label>
            <InputText
              value={formData.lastName}
              onChange={(e) => handleChange(e, "lastName")}
              maxLength={100}
              placeholder="Ingresar Apellidos"
            />
            {(formData.lastName || "").length >= 100 && (
              <small className="p-error">
                Máximo 100 caracteres permitidos
              </small>
            )}
            {lastNameError && (
              <small className="p-error">{lastNameError}</small>
            )}
          </div>
        </div>

        {/* Género, Fecha de Nacimiento y Edad */}
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
                placeholder="Ingresar Fecha de Nacimiento"
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

        {/* Área y Viaje Ext. */}
        <div className="form-row">
          <div className="field">
            <label htmlFor="area">Área</label>
            <Dropdown
              value={formData.area}
              options={areas}
              onChange={(e) => handleChange(e, "area")}
              placeholder="Seleccionar Área"
            />
          </div>

          {/* Salió al Extranjero */}
          <div className="field">
            <label htmlFor="wentAbroad">Viaje Ext.</label>
            <div>
              <InputSwitch
                checked={formData.wentAbroad}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    wentAbroad: e.value,
                  }))
                }
                id="wentAbroad"
              />
            </div>
          </div>
        </div>

        {/* Cat. Docente y Científica */}
        <div className="form-row">
          <div className="field">
            <label htmlFor="academicRank">Categoría Docente</label>
            <Dropdown
              value={formData.academicRank}
              options={academicRanks}
              onChange={(e) => handleChange(e, "academicRank")}
              placeholder="Seleccionar Cat. Docente"
            />
          </div>

          {/* Categoría Científica */}
          <div className="field">
            <label htmlFor="scientificCategory">Categoría Científica</label>
            <Dropdown
              value={formData.scientificCategory}
              options={scientificCategories}
              onChange={(e) => handleChange(e, "scientificCategory")}
              placeholder="Seleccionar Cat. Científica"
            />
          </div>
        </div>

        {/* Provincia y Municipio */}
        <div className="form-row">
          <div className="field">
            <label>Provincia</label>
            <Dropdown
              value={formData.address.idProvince}
              options={provinces}
              onChange={handleProvinceChange}
              placeholder="Seleccionar Provincia"
              style={{ flex: 1 }}
            />
          </div>
          <div className="field">
            <label>Municipio</label>
            <Dropdown
              value={formData.address.idMunicipality}
              options={municipalities}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, idMunicipality: e.value },
                }))
              }
              placeholder="Seleccionar Municipio"
              disabled={!formData.address.idProvince}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Calle y Número */}
        <div className="form-row">
          <div className="field">
            <label>Calle</label>
            <InputText
              value={formData.address.street}
              onChange={(e) => handleChange(e, "address.street")}
              maxLength={150}
              placeholder="Ingresar Calle"
            />
            {formData.address.street.length >= 150 && (
              <small className="p-error">
                Máximo 150 caracteres permitidos
              </small>
            )}
            {streetError && <small className="p-error">{streetError}</small>}
          </div>
          <div className="field">
            <label>Número</label>
            <InputText
              placeholder="Ingresar Número"
              value={formData.address.number}
              onChange={(e) => handleChange(e, "address.number")}
              onBeforeInput={(e) => {
                if (!/^[0-9]$/.test(e.data)) {
                  e.preventDefault();
                }
              }}
              maxLength={10}
            />
            {formData.address.number.length >= 10 && (
              <small className="p-error">Máximo 10 dígitos permitidos</small>
            )}
          </div>
        </div>

        {/* Botones */}
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
            onClick={() => navigate("/profesores")}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessorForm;
