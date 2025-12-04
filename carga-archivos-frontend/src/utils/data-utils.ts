import { HistoricalRecord } from '@/types/historical';
import { FilterOptions } from '@/types/historical-report.types';

export function filterHistoricalData(
	data: HistoricalRecord[], 
	filters: FilterOptions
): HistoricalRecord[] {
	return data.filter((record) => {
		const matchesSearch =
			!filters.searchTerm ||
			record.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
			record.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
			record.matricula.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
			record.expediente.toLowerCase().includes(filters.searchTerm.toLowerCase());

		const matchesStatus = 
			filters.statusFilter === "Sin Especificar" || 
			record.estadoAcademico === filters.statusFilter;

		return matchesSearch && matchesStatus;
	});
}

export function calculatePagination<T>(
	data: T[], 
	currentPage: number, 
	itemsPerPage: number
): {
	paginatedData: T[];
	totalPages: number;
	startIndex: number;
	endIndex: number;
} {
	const totalPages = Math.ceil(data.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedData = data.slice(startIndex, endIndex);

	return {
		paginatedData,
		totalPages,
		startIndex,
		endIndex,
	};
}