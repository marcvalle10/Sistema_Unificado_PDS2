import React from "react";
import { Modal } from "@/components/ui";
import { UploadState } from "@/types/historical-report.types";
import { FileUploadSection } from "./FileUploadSection";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadState: UploadState;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  uploadState,
  onDrag,
  onDrop,
  onFileSelect,
  onUpload,
}: UploadModalProps) {
  const handleUploadAndClose = async () => {
    await onUpload();
    onClose();
  };

  const handleClearAndClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Cargar Archivo de Estudiantes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <FileUploadSection
          uploadState={uploadState}
          onDrag={onDrag}
          onDrop={onDrop}
          onFileSelect={onFileSelect}
          onUpload={handleUploadAndClose}
          onClear={handleClearAndClose}
        />
      </div>
    </Modal>
  );
}
