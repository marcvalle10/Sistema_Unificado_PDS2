import React from 'react';
import { UploadState } from '@/types/historical-report.types';
import { formatFileSize } from '@/utils/file-utils';

interface FileUploadSectionProps {
	uploadState: UploadState;
	onDrag: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
	onClear: () => void;
}

export function FileUploadSection({
	uploadState,
	onDrag,
	onDrop,
	onFileSelect,
	onUpload,
	onClear
}: FileUploadSectionProps) {
	return (
		<div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
			<h2 className="text-xl font-semibold text-gray-800 mb-6">Cargar Archivo de Estudiantes</h2>
			
			<div
				className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
					uploadState.dragActive
						? 'border-blue-400 bg-blue-50'
						: 'border-gray-300 hover:border-gray-400'
				}`}
				onDragEnter={onDrag}
				onDragLeave={onDrag}
				onDragOver={onDrag}
				onDrop={onDrop}
			>
				{uploadState.uploadedFile ? (
					<div className="space-y-4">
						<div className="flex items-center justify-center">
							<svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div>
							<p className="text-lg font-medium text-gray-900">{uploadState.uploadedFile.name}</p>
							<p className="text-sm text-gray-500">
								{formatFileSize(uploadState.uploadedFile.size)}
							</p>
						</div>
						<div className="flex justify-center gap-4">
							<button
								onClick={onUpload}
								disabled={uploadState.isUploading}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{uploadState.isUploading ? 'Subiendo...' : 'Subir Archivo'}
							</button>
							<button
								onClick={onClear}
								disabled={uploadState.isUploading}
								className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancelar
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-center">
							<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
							</svg>
						</div>
						<div>
							<p className="text-lg font-medium text-gray-900">
								Arrastra y suelta tu archivo aquí
							</p>
							<p className="text-sm text-gray-500 mt-2">
								o{' '}
								<label className="text-blue-600 hover:text-blue-700 cursor-pointer">
									selecciona un archivo
									<input
										type="file"
										className="hidden"
										onChange={onFileSelect}
										accept=".csv,.xlsx,.xls,.txt"
									/>
								</label>
							</p>
							<p className="text-xs text-gray-400 mt-2">
								Formatos admitidos: CSV, Excel, TXT (máx. 10MB)
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}