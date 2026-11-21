export const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

export const formatDate = (value) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "—";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("pt-BR") : "—";
