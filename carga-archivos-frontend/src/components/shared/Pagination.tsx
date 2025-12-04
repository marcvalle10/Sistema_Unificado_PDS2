import React from "react";
import { PaginationProps } from "@/types";

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	// Función para generar números de página visibles
	const getVisiblePages = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			// Si hay 5 páginas o menos, mostrar todas
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Si hay más de 5 páginas, mostrar con lógica inteligente
			if (currentPage <= 3) {
				// Mostrar las primeras páginas
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Mostrar las últimas páginas
				pages.push(1);
				pages.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// Mostrar páginas alrededor de la actual
				pages.push(1);
				pages.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="px-3 sm:px-6 pt-3 sm:pt-4 bg-white pb-16">
			<div className="flex items-center justify-center space-x-1">
				{/* Primera página */}
				<button
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
					className="px-2 py-1 text-xs sm:text-[10px] font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full min-w-[30px] sm:min-w-[30px] min-h-[30px] sm:min-h-[30px] border border-gray-300"
					title="Primera página"
				>
					«
				</button>

				{/* Página anterior */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-2 py-1 text-xs sm:text-[10px] font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full min-w-[30px] sm:min-w-[30px] min-h-[30px] sm:min-h-[30px] border border-gray-300"
					title="Página anterior"
				>
					‹
				</button>

				{/* Números de página dinámicos */}
				{getVisiblePages().map((page, index) => (
					<React.Fragment key={index}>
						{page === "..." ? (
							<span className="px-2 py-1 text-xs sm:text-sm text-gray-500">...</span>
						) : (
							<button
								onClick={() => onPageChange(page as number)}
								className={`px-1 sm:px-3 py-1 text-xs sm:text-[10px] rounded-full min-w-[30px] sm:min-w-[30px] min-h-[30px] sm:min-h-[30px] border border-gray-300 font-bold ${
									page === currentPage
										? "bg-[#2E4258] text-white font-medium"
										: "bg-white hover:bg-gray-100"
								}`}
							>
								{page}
							</button>
						)}
					</React.Fragment>
				))}

				{/* Página siguiente */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-2 py-1 text-xs sm:text-[10px] font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full min-w-[30px] sm:min-w-[30px] min-h-[30px] sm:min-h-[30px] border border-gray-300"
					title="Página siguiente"
				>
					›
				</button>

				{/* Última página */}
				<button
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
					className="px-2 py-1 text-xs sm:text-[10px] font-bold bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full min-w-[30px] sm:min-w-[30px] min-h-[30px] sm:min-h-[30px] border border-gray-300"
					title="Última página"
				>
					»
				</button>
			</div>
		</div>
	);
}