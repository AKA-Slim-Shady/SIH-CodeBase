const BASE = "http://localhost:5000/api/departments";

export const createDepartment = async (data) => {
  const res = await fetch(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const updateDepartment = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const deleteDepartment = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
};

export const getDepartment = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
};

export const getAllDepartments = async () => {
  const res = await fetch(BASE);
  return res.json();
};
