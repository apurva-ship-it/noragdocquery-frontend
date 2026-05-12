import { useState, useCallback } from "react";
import {
  fetchDocuments,
  uploadFiles,
  deleteDocument,
  fetchDocumentPreview,
  fetchContext,
  fetchKbStatus,
  buildKnowledgeBase,
} from "../api/documents";
import type { DocumentSummary, DocumentPreview, ContextResponse, KnowledgeBaseStatus } from "../types";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [kbStatus, setKbStatus] = useState<KnowledgeBaseStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [buildingKb, setBuildingKb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const [docs, status] = await Promise.all([fetchDocuments(), fetchKbStatus()]);
      setDocuments(docs);
      setKbStatus(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    }
  }, []);

  const upload = useCallback(
    async (files: File[]) => {
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
    },
    [loadDocuments]
  );

  const removeDocuments = useCallback(
    async (names: string[]) => {
      setDeleting(true);
      setError(null);
      try {
        await Promise.all(names.map(deleteDocument));
        await loadDocuments();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setDeleting(false);
      }
    },
    [loadDocuments]
  );

  const updateKnowledgeBase = useCallback(async () => {
    setBuildingKb(true);
    setError(null);
    try {
      const status = await buildKnowledgeBase();
      setKbStatus(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build knowledge base");
    } finally {
      setBuildingKb(false);
    }
  }, []);

  const getPreview = useCallback(async (name: string): Promise<DocumentPreview | null> => {
    try {
      return await fetchDocumentPreview(name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      return null;
    }
  }, []);

  const getContext = useCallback(async (): Promise<ContextResponse | null> => {
    try {
      return await fetchContext();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch context");
      return null;
    }
  }, []);

  return {
    documents,
    kbStatus,
    uploading,
    deleting,
    buildingKb,
    error,
    upload,
    loadDocuments,
    removeDocuments,
    updateKnowledgeBase,
    getPreview,
    getContext,
    clearError: () => setError(null),
  };
}
