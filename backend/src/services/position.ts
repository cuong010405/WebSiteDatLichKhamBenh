import {
  getRoleList,
  getActiveRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "./role";

export async function getPositionList() {
  return getRoleList();
}

export async function getActivePositions() {
  return getActiveRoles();
}

export async function getPositionById(id: string) {
  return getRoleById(id);
}

export async function createPosition(data: {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
}) {
  return createRole(data);
}

export async function updatePosition(
  id: string,
  data: { Name?: string; Description?: string; Active?: boolean }
) {
  return updateRole(id, data);
}

export async function deletePosition(id: string) {
  return deleteRole(id);
}
