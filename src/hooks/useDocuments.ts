import { useState, useCallback } from "react";
import { fetchDocuments, uploadFiles } from "../api/documents";
import type { DocumentSummary } from "../types";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    }
  }, []);

  const upload = useCallback(async (files: File[]) => {
    setUploading(true);
    setError(null);
    try {
      await uploadFiles(files);
      await loadDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [loadDocuments]);

  return { documents, uploading, error, upload, loadDocuments, clearError: () => setError(null) };
}
