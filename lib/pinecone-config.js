"use strict";

// Ingestion and retrieval must use the same model, dimension and namespace.
module.exports = {
  indexName: process.env.PINECONE_INDEX_NAME || "empress",
  namespace: process.env.PINECONE_NAMESPACE || "clinical-framework",
  askEmpressNamespace: process.env.ASK_EMPRESS_LIBRARY_NAMESPACE || "ask-empress-library",
  embedModel: process.env.PINECONE_EMBED_MODEL || "llama-text-embed-v2",
  embedDimension: Number(process.env.PINECONE_EMBED_DIM || 768),
};
