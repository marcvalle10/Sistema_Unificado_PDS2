import { useState } from 'react';
import { HistoricalReportViewState, ViewMode } from '../types';

export function useHistoricalNavigation() {
	const [viewState, setViewState] = useState<HistoricalReportViewState>({
		showUploadModal: false,
		showHistoryTable: false,
		showCombinedView: false,
	});

	const [currentView, setCurrentView] = useState<ViewMode>('main');

	const showHistory = () => {
		setViewState({
			showUploadModal: false,
			showHistoryTable: true,
			showCombinedView: false,
		});
		setCurrentView('history');
	};

	const showCombinedView = () => {
		setViewState({
			showUploadModal: false,
			showHistoryTable: false,
			showCombinedView: true,
		});
		setCurrentView('combined');
	};

	const showMainView = () => {
		setViewState({
			showUploadModal: false,
			showHistoryTable: false,
			showCombinedView: false,
		});
		setCurrentView('main');
	};

	const showUploadModal = () => {
		setViewState((prev: HistoricalReportViewState) => ({
			...prev,
			showUploadModal: true,
		}));
	};

	const closeUploadModal = () => {
		setViewState((prev: HistoricalReportViewState) => ({
			...prev,
			showUploadModal: false,
		}));
	};

	return {
		viewState,
		currentView,
		showHistory,
		showCombinedView,
		showMainView,
		showUploadModal,
		closeUploadModal,
	};
}