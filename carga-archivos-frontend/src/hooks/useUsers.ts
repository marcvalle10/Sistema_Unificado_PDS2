import { useState, useEffect } from "react";
import { User, Role } from "@/types";
import {
  getUsersWithRoles,
  getRoles,
  updateUserRole,
  deleteUser,
} from "@/services/userService";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getUsersWithRoles(),
        getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modifyUserRole = async (user: User, roleId: number) => {
    try {
      await updateUserRole(user.id, roleId);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? {
                ...u,
                role_id: roleId,
                rol: roles.find((r) => r.id === roleId)?.nombre || u.rol,
              }
            : u
        )
      );
    } catch (err) {
      setError("Error al actualizar el rol");
      throw err;
    }
  };

  const removeUser = async (user: User) => {
    try {
      await deleteUser(user.id);

      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    } catch (err) {
      setError("Error al eliminar el usuario");
      throw err;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    roles,
    loading,
    error,
    refreshUsers: loadUsers,
    modifyUserRole,
    removeUser,
  };
}
