import { z } from "zod";

export const serviceSchema = z.object({
  id: z.string().min(1, "ID dịch vụ là bắt buộc"),
  name: z.string().min(2, "Tên dịch vụ phải có ít nhất 2 ký tự"),
  description: z.string().optional().default(""),
  price: z.number().int().min(0, "Giá phải lớn hơn 0"),
  duration: z.string().optional().default(""),
  type: z.string().min(2, "Loại dịch vụ là bắt buộc"),
  active: z.boolean().default(true),
});
