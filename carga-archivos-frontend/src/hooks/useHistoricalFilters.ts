import { useState, useEffect, useRef } from 'react';
import { FilterOptions, PaginationState } from '../types';

export function useHistoricalFilters(totalItems: number, itemsPerPage: number = 10) {
	const [filters, setFilters] = useState<FilterOptions>({
		searchTerm: "",
		statusFilter: "Sin Especificar",
		isStatusDropdownOpen: false,
	});

	const [pagination, setPagination] = useState<PaginationState>({
		currentPage: 1,
		itemsPerPage,
		totalItems,
	});

	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cerrar dropdown cuando se hace clic fuera
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setFilters((prev: FilterOptions) => ({ ...prev, isStatusDropdownOpen: false }));
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const updateSearchTerm = (term: string) => {
		setFilters((prev: FilterOptions) => ({ ...prev, searchTerm: term }));
		setPagination((prev: PaginationState) => ({ ...prev, currentPage: 1 })); // Reset to first page
	};

	const updateStatusFilter = (status: string) => {
		setFilters((prev: FilterOptions) => ({ 
			...prev, 
			statusFilter: status, 
			isStatusDropdownOpen: false 
		}));
		setPagination((prev: PaginationState) => ({ ...prev, currentPage: 1 })); // Reset to first page
	};

	const toggleStatusDropdown = () => {
		setFilters((prev: FilterOptions) => ({ 
			...prev, 
			isStatusDropdownOpen: !prev.isStatusDropdownOpen 
		}));
	};

	const setCurrentPage = (page: number) => {
		setPagination((prev: PaginationState) => ({ ...prev, currentPage: page }));
	};

	const resetFilters = () => {
		setFilters({
			searchTerm: "",
			statusFilter: "Sin Especificar",
			isStatusDropdownOpen: false,
		});
		setPagination((prev: PaginationState) => ({ ...prev, currentPage: 1, totalItems }));
	};

	return {
		filters,
		pagination,
		dropdownRef,
		updateSearchTerm,
		updateStatusFilter,
		toggleStatusDropdown,
		setCurrentPage,
		resetFilters,
	};
}