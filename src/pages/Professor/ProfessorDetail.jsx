import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./ProfessorDetail.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const ProfessorDetail = ({ visible, onHide, professor }) => {
  if (!professor) return null;

  // Campos concatenados
  const nombreCompleto = `${professor.firstName} ${professor.lastName}`;
  const direccionPrincipal = `${professor.address?.street ?? ""} ${professor.address?.number ?? ""
    }`.trim();

  return (
    <Dialog
      header="Detalles del Profesor"
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      modal
      footer={
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={onHide}
          className="p-button-outlined p-button-danger"
          style={{ minWidth: 120, fontWeight: "bold" }}
        />
      }
    >
      <div className="professor-detail-fields">
        <strong>Nombre Completo:</strong> {nombreCompleto}
        <br />
        <strong>Género:</strong>{" "}
        {professor.gender === "M" ? "Masculino" : "Femenino"}
        <br />
        <strong>Fecha de Nacimiento:</strong> {formatDate(professor.birthDate)}
        <br />
        <strong>Edad:</strong> {professor.age}
        <br />
        <strong>Departamento:</strong> {professor.area}
        <br />
        <strong>Categoría Docente:</strong> {professor.academicRank}
        <br />
        <strong>Categoría Científica:</strong> {professor.scientificCategory}
        <br />
        <strong>¿Salió al Extranjero?:</strong> {professor.wentAbroad ? "Sí" : "No"}
        <br />
        <strong>Provincia:</strong> {professor.address?.province}
        <br />
        <strong>Municipio:</strong> {professor.address?.municipality}
        <br />
        <strong>Dirección Principal:</strong> {direccionPrincipal}
      </div>
    </Dialog>
  );
};

export default ProfessorDetail;
