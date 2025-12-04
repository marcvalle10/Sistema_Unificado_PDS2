import React from 'react';
import { HistoricalRecord } from '@/types/historical';
import { UploadState } from '@/types/historical-report.types';
import { FileUploadSection } from './FileUploadSection';

interface CombinedViewProps {
	records: HistoricalRecord[];
	uploadState: UploadState;
	onDrag: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
	onClear: () => void;
}

// Datos estáticos para la tabla combinada
const combinedData = [
	{ date: '2024-01-15', filename: 'estudiantes_enero.xlsx', status: 'Completado' },
	{ date: '2024-01-10', filename: 'registro_nuevo.csv', status: 'Procesando' },
	{ date: '2024-01-05', filename: 'actualizacion_datos.xlsx', status: 'Completado' },
	{ date: '2023-12-28', filename: 'backup_diciembre.csv', status: 'Error' },
	{ date: '2023-12-20', filename: 'estudiantes_activos.xlsx', status: 'Completado' },
];

export function CombinedView({
	uploadState,
	onDrag,
	onDrop,
	onFileSelect,
	onUpload,
	onClear
}: CombinedViewProps) {
	return (
		<div className="flex gap-6 min-h-[calc(100vh-300px)]">
			{/* Left side - File Upload */}
			<div className="w-1/3">
				<FileUploadSection
					uploadState={uploadState}
					onDrag={onDrag}
					onDrop={onDrop}
					onFileSelect={onFileSelect}
					onUpload={onUpload}
					onClear={onClear}
				/>
			</div>

			{/* Right side - Historical Table */}
			<div className="w-2/3 bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Cargas</h3>
					
					{/* Table */}
					<div className="overflow-hidden">
						<div className="grid grid-cols-4 gap-4 bg-[#4A5568] text-white text-sm font-medium p-3 rounded-t-lg">
							<div>Acciones</div>
							<div>Fecha</div>
							<div>Archivo</div>
							<div>Estado</div>
						</div>
						
						{combinedData.map((item, index) => (
							<div
								key={index}
								className={`grid grid-cols-4 gap-4 p-3 text-sm border-b border-gray-200 ${
									index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
								} hover:bg-gray-100`}
							>
								{/* Actions Column */}
								<div className="flex gap-2">
									<button className="text-[#3B5571] hover:text-blue-700 p-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
									<button className="text-red-600 hover:text-red-800 p-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>

								{/* Date Column */}
								<div className="text-[#3B5571]">{item.date}</div>

								{/* Filename Column */}
								<div className="text-[#3B5571] truncate">{item.filename}</div>

								{/* Status Column */}
								<div>
									<span className={`px-2 py-1 rounded text-xs font-medium ${
										item.status === 'Completado' 
											? 'bg-green-500 text-white' 
											: item.status === 'Procesando'
											? 'bg-yellow-500 text-white'
											: item.status === 'Error'
											? 'bg-red-500 text-white'
											: 'bg-gray-500 text-white'
									}`}>
										{item.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}