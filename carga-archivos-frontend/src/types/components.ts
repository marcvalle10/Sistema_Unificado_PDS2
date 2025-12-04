import React from "react";
import { User, ProfesorFormValues } from "./user";

/**
 * Props para el componente SearchFilters
 */
export interface SearchFiltersProps {
  searchTerm: string;
  roleFilter: string;
  showRoleDropdown: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleFilterChange: (role: string) => void;
  onToggleRoleDropdown: () => void;
}

/**
 * Props para el componente UserTable
 */
export interface UserTableProps {
  currentUsers: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  loading?: boolean;
  showActions?: boolean;
}

/**
 * Props para el componente UserAvatar
 */
export interface UserAvatarProps {
  user: User;
}

/**
 * Props para el componente Pagination
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}


/**
 * Valor de retorno del hook useUserDirectory
 */
export interface UseUserDirectoryReturn {
  // State tabla / filtros
  searchTerm: string;
  roleFilter: string;
  showRoleDropdown: boolean;
  userToDelete: User | null;
  showDeleteModal: boolean;
  currentPage: number;
  currentUsers: User[];
  totalPages: number;
  loading?: boolean;
  error?: string | null;

  // Handlers tabla / filtros
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleFilter: (role: string) => void;
  handleDeleteUser: (user: User) => void;
  handleModifyUserRole: (user: User, roleId: number) => void;
  confirmDelete: () => void;
  paginate: (pageNumber: number) => void;
  setShowRoleDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;

  // ===== Crear / Editar profesor =====
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  showEditModal: boolean;
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingUser: User | null;

  formValues: ProfesorFormValues;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;

  openCreateModal: () => void;
  openEditModal: (user: User) => void;

  submitCreateProfesor: () => Promise<void> | void;
  submitEditProfesor: () => Promise<void> | void;
}
