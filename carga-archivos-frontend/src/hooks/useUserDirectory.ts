import { useState, useMemo, useEffect } from "react";
import {
  User,
  UseUserDirectoryReturn,
  ProfesorFormValues,
} from "@/types";
import {
  getUsersWithRoles,
  updateUserRole,
  deleteUser,
  createProfesor,
  updateProfesor,
} from "@/services/userService";

// Helper para mapear id → nombre de rol (fallback visual)
function getRoleNameById(id: number): string {
  switch (id) {
    case 1:
      return "Administrador";
    case 2:
      return "Coordinador";
    case 3:
      return "Profesor";
    default:
      return "Sin rol";
  }
}

// Puedes poner mocks aquí si quieres probar
const INITIAL_USERS: User[] = []; // <<–– YA NO USAMOS MOCKS

export function useUserDirectory(): UseUserDirectoryReturn {
  // Lista que se muestra en la tabla
  const [displayUsers, setDisplayUsers] = useState<User[]>(INITIAL_USERS);

  // ==========================
  //   State tabla / filtros
  // ==========================
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Loading / error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================
  //   Cargar usuarios de Supabase
  // ==========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const users = await getUsersWithRoles();
        setDisplayUsers(users);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ==========================
  //   Filtros + paginación
  // ==========================

  const filteredUsers = useMemo(() => {
    let result = displayUsers;

    if (searchTerm) {
      result = result.filter((user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter && roleFilter !== "") {
      result = result.filter((user) => user.rol === roleFilter);
    }

    return result;
  }, [displayUsers, searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // ==========================
  //   Handlers tabla / filtros
  // ==========================

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setShowRoleDropdown(false);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================
  //   Modificar rol (BD + local)
  // ==========================

  const handleModifyUserRole = (user: User, roleId: number) => {
    // ejecutamos async sin cambiar la firma del tipo (que es () => void)
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Primero actualizamos en Supabase usando el id de usuario
        await updateUserRole(user.usuarioId, roleId);

        // Después actualizamos en el estado local
        setDisplayUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  rolId: roleId,
                  rol: getRoleNameById(roleId),
                }
              : u
          )
        );
      } catch (err) {
        console.error("Error al actualizar rol:", err);
        setError("No se pudo actualizar el rol del usuario.");
      } finally {
        setLoading(false);
      }
    })();
  };

  // ==========================
  //   Eliminar usuario (BD + local)
  // ==========================

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Eliminamos en BD usando el id de usuario
        await deleteUser(userToDelete.usuarioId);

        // Y luego lo quitamos del estado local
        setDisplayUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        setError("No se pudo eliminar el usuario.");
      } finally {
        setLoading(false);
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    })();
  };

  // ==========================
  //   Crear / Editar profesor (CON BD)
  // ==========================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formValues, setFormValues] = useState<ProfesorFormValues>({
    nombre: "",
    correo: "",
    numEmpleado: "",
    rolId: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormValues((prev) => {
      if (name === "rolId") {
        return {
          ...prev,
          rolId: value === "" ? "" : Number(value),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormValues({
      nombre: "",
      correo: "",
      numEmpleado: "",
      rolId: "",
    });
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormValues({
      nombre: user.nombre, // nombre completo
      correo: user.email,
      numEmpleado: String(user.numEmpleado ?? ""),
      rolId: user.rolId ?? "",
    });
    setShowEditModal(true);
  };

  // Crear profesor en BD
  const submitCreateProfesor = () => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const rolIdNumber =
          typeof formValues.rolId === "number" && formValues.rolId > 0
            ? formValues.rolId
            : 3; // default Profesor

        const nuevo = await createProfesor({
          nombreCompleto: formValues.nombre,
          correo: formValues.correo,
          numEmpleado: Number(formValues.numEmpleado),
          rolId: rolIdNumber,
        });

        // Agregar al estado local
        setDisplayUsers((prev) => [nuevo, ...prev]);

        setShowCreateModal(false);
        setFormValues({
          nombre: "",
          correo: "",
          numEmpleado: "",
          rolId: "",
        });
      } catch (err) {
        console.error("Error al crear profesor:", err);
        setError("No se pudo crear el profesor.");
      } finally {
        setLoading(false);
      }
    })();
  };

  // Editar profesor en BD
  const submitEditProfesor = () => {
    if (!editingUser) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const rolIdNumber =
          typeof formValues.rolId === "number" && formValues.rolId > 0
            ? formValues.rolId
            : 3;

        const actualizado = await updateProfesor({
          profesorId: editingUser.profesorId!,
          usuarioId: editingUser.usuarioId,
          nombreCompleto: formValues.nombre,
          correo: formValues.correo,
          numEmpleado: Number(formValues.numEmpleado),
          rolId: rolIdNumber,
        });

        setDisplayUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? actualizado : u))
        );

        setShowEditModal(false);
        setEditingUser(null);
      } catch (err) {
        console.error("Error al actualizar profesor:", err);
        setError("No se pudo actualizar el profesor.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return {
    // Tabla / filtros
    searchTerm,
    roleFilter,
    showRoleDropdown,
    userToDelete,
    showDeleteModal,
    currentPage,
    currentUsers,
    totalPages,
    loading,
    error,

    // Handlers tabla / filtros
    handleSearch,
    handleRoleFilter,
    handleDeleteUser,
    handleModifyUserRole,
    confirmDelete,
    paginate,
    setShowRoleDropdown,
    setShowDeleteModal,

    // Crear / Editar profesor
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    formValues,
    handleFormChange,
    openCreateModal,
    openEditModal,
    submitCreateProfesor,
    submitEditProfesor,
  };
}
