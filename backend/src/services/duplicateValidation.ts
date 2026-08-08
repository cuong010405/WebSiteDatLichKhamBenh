import { db } from "../db";

/**
 * Tên hiển thị mặc định (tiếng Việt) cho các cột thường dùng.
 * Chuẩn hóa thuật ngữ nhất quán trên toàn hệ thống.
 */
const DEFAULT_FIELD_DISPLAY_NAMES: Record<string, string> = {
  Email: "Email",
  Phone: "Số điện thoại",
  Name: "Tên",
  LicenseNumber: "Mã số chứng chỉ hành nghề",
  Id: "Mã định danh",
};

export interface SingleFieldCheck {
  /** Tên cột trong Prisma Model (ví dụ: 'Email', 'Phone', 'Name', 'LicenseNumber', 'Id') */
  field: string;
  /** Giá trị cần kiểm tra trùng */
  value: any;
  /** Tên hiển thị tiếng Việt trong thông báo lỗi (optional, dùng DEFAULT_FIELD_DISPLAY_NAMES nếu bỏ trống) */
  fieldDisplayName?: string;
}

export interface DuplicateCheckOptions {
  /**
   * Tên model Prisma theo camelCase (ví dụ: 'user', 'staff', 'service', 'department', 'staffLicense', 'serviceType', ...).
   * Phải khớp với property của PrismaClient instance.
   */
  model: string;
  /** Danh sách các trường cần kiểm tra trùng (kiểm tra tuần tự, dừng khi tìm thấy trùng đầu tiên) */
  checks: SingleFieldCheck[];
  /**
   * Dùng khi Update: Loại trừ chính bản ghi đang chỉnh sửa khỏi kết quả tìm kiếm.
   * Ví dụ: { field: 'Id', value: 'abc-123' }
   */
  excludeId?: {
    field: string;
    value: string;
  };
}


export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field?: string;
  value?: any;
  message?: string;
}

/**
 * Kiểm tra trùng lặp dữ liệu linh hoạt, hỗ trợ cả Create và Update.
 *
 * - **Create**: Không truyền `excludeId` → kiểm tra toàn bộ table.
 * - **Update**: Truyền `excludeId` → bỏ qua bản ghi đang sửa, chỉ kiểm tra các bản ghi khác.
 *
 * @returns DuplicateCheckResult với `isDuplicate: true` khi tìm thấy bản ghi trùng.
 */
export async function validateDuplicate(
  options: DuplicateCheckOptions
): Promise<DuplicateCheckResult> {
  const { model, checks, excludeId } = options;
  const prismaModel = (db as any)[model];

  if (!prismaModel || typeof prismaModel.findFirst !== "function") {
    throw new Error(
      `[duplicateValidation] Model Prisma "${String(model)}" không hợp lệ hoặc không tồn tại.`
    );
  }

  for (const check of checks) {
    // Bỏ qua nếu giá trị rỗng/undefined (không kiểm tra field không bắt buộc)
    if (check.value === undefined || check.value === null || check.value === "") {
      continue;
    }

    const valueToCompare =
      typeof check.value === "string" ? check.value.trim() : check.value;

    const whereCondition: any = {
      [check.field]:
        typeof valueToCompare === "string"
          ? { equals: valueToCompare }
          : valueToCompare,
    };

    // Loại trừ chính record đang sửa khi là thao tác Update
    if (excludeId && excludeId.value) {
      whereCondition[excludeId.field] = { not: excludeId.value };
    }

    const existingRecord = await prismaModel.findFirst({
      where: whereCondition,
    });

    if (existingRecord) {
      const displayName =
        check.fieldDisplayName ||
        DEFAULT_FIELD_DISPLAY_NAMES[check.field] ||
        check.field;

      let message = `${displayName} đã được sử dụng`;
      if (displayName === "Gmail" || check.field === "Email") {
        message = "Gmail này đã được sử dụng";
      } else if (displayName === "Số điện thoại" || check.field === "Phone") {
        message = "Số điện thoại này đã được sử dụng";
      } else {
        message = `${displayName} "${check.value}" đã được sử dụng`;
      }

      return {
        isDuplicate: true,
        field: check.field,
        value: check.value,
        message,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Kiểm tra trùng lặp và **ném ra Error** ngay khi phát hiện trùng.
 * Sử dụng trong Service layer để dừng luồng xử lý và trả lỗi về Controller.
 *
 * @throws {Error} Nếu có bản ghi trùng.
 */
export async function assertNoDuplicate(
  options: DuplicateCheckOptions
): Promise<void> {
  const result = await validateDuplicate(options);
  if (result.isDuplicate) {
    throw new Error(result.message);
  }
}
