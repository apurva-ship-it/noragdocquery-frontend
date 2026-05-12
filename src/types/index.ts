export interface DocumentSummary {
  document_name: string;
  total_characters: number;
  chunk_count: number;
}

export interface UploadResponse {
  documents: DocumentSummary[];
}

export interface QAPair {
  question: string;
  answer: string;
  streaming: boolean;
}

export interface DocumentPreview {
  document_name: string;
  content: string;
  chunk_count: number;
}

export interface ContextResponse {
  content: string;
  total_characters: number;
  document_count: number;
}

export interface KnowledgeBaseStatus {
  has_kb: boolean;
  is_stale: boolean;
  updated_at: string | null;
  total_characters: number;
  document_count: number;
  document_names: string[];
}
