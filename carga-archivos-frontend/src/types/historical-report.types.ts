export interface HistoricalReportViewState {
	showUploadModal: boolean;
	showHistoryTable: boolean;
	showCombinedView: boolean;
}

export interface UploadState {
	dragActive: boolean;
	uploadedFile: File | null;
	isUploading: boolean;
}

export interface FilterOptions {
	searchTerm: string;
	statusFilter: string;
	isStatusDropdownOpen: boolean;
}

export interface PaginationState {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
}

export interface PaginationState {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
}

export type ViewMode = 'main' | 'history' | 'combined';

export interface HistoricalReportProps {
	onUploadClick?: () => void;
}