import { useState, useCallback } from 'react';
import { UploadState } from '../types';

export function useFileUpload() {
	const [uploadState, setUploadState] = useState<UploadState>({
		dragActive: false,
		uploadedFile: null,
		isUploading: false,
	});

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setUploadState((prev: UploadState) => ({ ...prev, dragActive: true }));
		} else if (e.type === "dragleave") {
			setUploadState((prev: UploadState) => ({ ...prev, dragActive: false }));
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setUploadState((prev: UploadState) => ({ ...prev, dragActive: false }));

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setUploadState((prev: UploadState) => ({ 
				...prev, 
				uploadedFile: e.dataTransfer.files[0] 
			}));
		}
	}, []);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setUploadState((prev: UploadState) => ({ 
				...prev, 
				uploadedFile: e.target.files?.[0] ?? null 
			}));
		}
	}, []);

	const handleUpload = useCallback(async () => {
		if (uploadState.uploadedFile) {
			setUploadState((prev: UploadState) => ({ ...prev, isUploading: true }));
			
			try {
				// Aquí iría la lógica de upload
				console.log("Uploading file:", uploadState.uploadedFile.name);
				
				// Simular upload
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				setUploadState({
					dragActive: false,
					uploadedFile: null,
					isUploading: false,
				});
			} catch (error) {
				console.error("Upload failed:", error);
				setUploadState((prev: UploadState) => ({ ...prev, isUploading: false }));
			}
		}
	}, [uploadState.uploadedFile]);

	const clearFile = useCallback(() => {
		setUploadState((prev: UploadState) => ({ 
			...prev, 
			uploadedFile: null, 
			dragActive: false 
		}));
	}, []);

	return {
		uploadState,
		handleDrag,
		handleDrop,
		handleFileSelect,
		handleUpload,
		clearFile,
	};
}