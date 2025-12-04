export function validateFileUpload(file: File): {
	isValid: boolean;
	error?: string;
} {
	const maxSizeInMB = 10;
	const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
	
	const allowedTypes = [
		'text/csv',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'text/plain'
	];

	// Validar tamaño
	if (file.size > maxSizeInBytes) {
		return {
			isValid: false,
			error: `El archivo es demasiado grande. Máximo permitido: ${maxSizeInMB}MB`
		};
	}

	// Validar tipo de archivo
	if (!allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error: 'Tipo de archivo no permitido. Solo se permiten archivos CSV, Excel y de texto.'
		};
	}

	return { isValid: true };
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
	return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function isFileTypeSupported(filename: string): boolean {
	const supportedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
	const extension = getFileExtension(filename).toLowerCase();
	return supportedExtensions.includes(extension);
}