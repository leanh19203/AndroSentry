import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodObject } from "zod";

// 1. Schema for /api/audit-manifest
export const auditManifestSchema = z.object({
  body: z.object({
    manifestContent: z
      .string()
      .min(10, "Nội dung Manifest quá ngắn")
      .max(5 * 1024 * 1024, "Nội dung Manifest không được vượt quá 5MB"), // 5MB limit
    language: z.enum(["vi", "en", "ja"]).optional().default("vi"),
  }),
});

// 2. Schema for /api/chat
export const chatSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "model"]),
          content: z.string().min(1, "Nội dung tin nhắn không được để trống").max(50000, "Tin nhắn quá dài"),
        })
      )
      .min(1, "Cần có ít nhất một tin nhắn"),
    language: z.enum(["vi", "en", "ja"]).optional().default("vi"),
  }),
});

// 3. Schema for /api/execute-command
export const executeCommandSchema = z.object({
  body: z.object({
    command: z
      .string()
      .min(1, "Câu lệnh không được trống")
      .max(2000, "Câu lệnh không được vượt quá 2000 ký tự"),
  }),
});

// 4. Schema for /api/get-decompiled-manifest
export const getDecompiledManifestSchema = z.object({
  query: z.object({
    outputDir: z
      .string()
      .regex(/^[a-zA-Z0-9_\-]+$/, "Tên thư mục đầu ra chỉ được chứa chữ cái, số, gạch dưới và gạch ngang")
      .optional()
      .default("decompiled_src"),
  }),
});

// 5. Schema for /api/scan (Static Security Scanner)
export const staticScanSchema = z.object({
  body: z.object({
    workspaceDir: z
      .string()
      .regex(/^[a-zA-Z0-9_\-]+$/, "Thư mục quy trình chỉ được chứa chữ cái, số, gạch dưới và gạch ngang")
      .optional(),
    simulation: z.boolean().optional(),
  }),
});

// Express validation helper middleware generator
export function validate(schema: z.ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      
      // Update request with parsed/validated data (this handles default values as well)
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Dữ liệu đầu vào không hợp lệ",
          details: error.issues.map((e) => ({
            field: e.path.slice(1).join("."),
            message: e.message,
          })),
        });
        return;
      }
      res.status(500).json({ error: "Lỗi kiểm tra dữ liệu đầu vào" });
    }
  };
}
