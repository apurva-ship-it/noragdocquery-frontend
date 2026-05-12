import type { DocumentSummary, UploadResponse, DocumentPreview, ContextResponse } from "../types";

export async function fetchDocuments(): Promise<DocumentSummary[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.status}`);
  return res.json() as Promise<DocumentSummary[]>;
}

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (res.status === 413) throw new Error("File exceeds 10 MB limit");
  if (res.status === 415) throw new Error("Unsupported file type");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<UploadResponse>;
}

export async function deleteDocument(documentName: string): Promise<void> {
  const res = await fetch(`/api/documents/${encodeURIComponent(documentName)}`, {
    method: "DELETE",
  });
  if (res.status === 404) throw new Error(`Document '${documentName}' not found`);
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function fetchDocumentPreview(documentName: string): Promise<DocumentPreview> {
  const res = await fetch(`/api/documents/${encodeURIComponent(documentName)}/preview`);
  if (res.status === 404) throw new Error(`Document '${documentName}' not found`);
  if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
  return res.json() as Promise<DocumentPreview>;
}

export async function fetchContext(): Promise<ContextResponse> {
  const res = await fetch("/api/context");
  if (!res.ok) throw new Error(`Failed to fetch context: ${res.status}`);
  return res.json() as Promise<ContextResponse>;
}
