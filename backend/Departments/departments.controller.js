import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "./departments.sqlquery.js";

export const createDepartmentController = createDepartment;
export const getDepartmentsController = getDepartments;
export const getDepartmentByIdController = getDepartmentById;
export const updateDepartmentController = updateDepartment;
export const deleteDepartmentController = deleteDepartment;
