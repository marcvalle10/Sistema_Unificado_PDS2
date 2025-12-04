import React from 'react';
import { FilterOptions } from '@/types/historical-report.types';

interface HistoricalFiltersProps {
	filters: FilterOptions;
	onSearchChange: (term: string) => void;
	onStatusChange: (status: string) => void;
	onToggleDropdown: () => void;
	dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function HistoricalFilters({
	filters,
	onSearchChange,
	onStatusChange,
	onToggleDropdown,
	dropdownRef
}: HistoricalFiltersProps) {
	const statusOptions = [
		"Sin Especificar",
		"Activo",
		"Inactivo",
		"Suspendido",
		"Graduado"
	];

	return (
		<div className="flex justify-between items-center mb-6">
			{/* Search Input and Status Dropdown */}
			<div className="flex items-center gap-4">
				{/* Search Input */}
				<div className="relative">
					<input
						type="text"
						placeholder="Buscar..."
						value={filters.searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
					<svg
						className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				{/* Status Dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={onToggleDropdown}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					>
						<span className="text-sm text-gray-700">
							Estatus: {filters.statusFilter}
						</span>
						<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
						</svg>
					</button>

					{filters.isStatusDropdownOpen && (
						<div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
							{statusOptions.map((status) => (
								<button
									key={status}
									onClick={() => onStatusChange(status)}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
										filters.statusFilter === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
									}`}
								>
									{status}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}