import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./StudentDetail.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const StudentDetail = ({ visible, onHide, student }) => {
  if (!student) return null;

  // Campos concatenados
  const nombreCompleto = `${student.firstName} ${student.lastName}`;
  const direccionPrincipal = `${student.address?.street ?? ""} ${
    student.address?.number ?? ""
  }`.trim();

  return (
    <Dialog
      header="Detalles del Estudiante"
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
      <div className="student-detail-fields">
        <strong>Nombre Completo:</strong> {nombreCompleto}
        <br />
        <strong>Género:</strong>{" "}
        {student.gender === "M" ? "Masculino" : "Femenino"}
        <br />
        <strong>Fecha de Nacimiento:</strong> {formatDate(student.birthDate)}
        <br />
        <strong>Edad:</strong> {student.age}
        <br />
        <strong>Carrera:</strong> {student.major}
        <br />
        <strong>Año:</strong> {student.year}
        <br />
        <strong>Provincia:</strong> {student.address?.province}
        <br />
        <strong>Municipio:</strong> {student.address?.municipality}
        <br />
        <strong>Dirección Principal:</strong> {direccionPrincipal}
      </div>
    </Dialog>
  );
};

export default StudentDetail;
