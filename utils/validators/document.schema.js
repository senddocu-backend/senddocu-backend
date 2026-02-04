const { z } = require("zod");

/**
 * Single document schema
 */
const documentSchema = z.object({
  original_name: z.string().min(1, "original_name required"),
  mime_type: z.string().min(1, "mime_type required"),
  storage_path: z.string().min(1, "storage_path required"),
  file_size: z.number().int().positive("file_size must be positive")
});

/**
 * Request payload schema
 */
const documentsPayload = z.object({
  documents: z.array(documentSchema).min(1, "At least one document required")
});

module.exports = {
  documentSchema,
  documentsPayload
};
