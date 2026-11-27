import { validateStartDate } from "./date-engine";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface PlacementPayload {
  studentName: string;
  matricNo: string;
  department: string;
  companyName: string;
  industrySupervisorName: string;
  startDate: string;
  institutionName?: string;
  levelOrProgramme?: string;
  companyAddress?: string;
  companySector?: string;
  assignedUnit?: string;
  institutionSupervisorName?: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };

function cleanRequired(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptional(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateRegisterInput(
  input: Record<string, unknown>
): ValidationResult<RegisterPayload> {
  const name = cleanRequired(input.name);
  const email = cleanRequired(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";

  if (name.length < 2) {
    return { ok: false, field: "name", error: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      field: "email",
      error: "Please enter a valid email address.",
    };
  }
  if (password.length < 8) {
    return {
      ok: false,
      field: "password",
      error: "Password must be at least 8 characters.",
    };
  }

  return { ok: true, data: { name, email, password } };
}

export function validatePlacementInput(
  input: Record<string, unknown>
): ValidationResult<PlacementPayload> {
  const studentName = cleanRequired(input.studentName);
  const matricNo = cleanRequired(input.matricNo);
  const department = cleanRequired(input.department);
  const companyName = cleanRequired(input.companyName);
  const industrySupervisorName = cleanRequired(input.industrySupervisorName);
  const startDate = cleanRequired(input.startDate);

  if (studentName.length < 2) {
    return {
      ok: false,
      field: "studentName",
      error: "Student full name is required.",
    };
  }
  if (matricNo.length < 3) {
    return {
      ok: false,
      field: "matricNo",
      error: "Matriculation number is required.",
    };
  }
  if (department.length < 2) {
    return {
      ok: false,
      field: "department",
      error: "Department is required.",
    };
  }
  if (companyName.length < 2) {
    return {
      ok: false,
      field: "companyName",
      error: "Company or organization name is required.",
    };
  }
  if (industrySupervisorName.length < 2) {
    return {
      ok: false,
      field: "industrySupervisorName",
      error: "Industry supervisor name is required.",
    };
  }

  const dateCheck = validateStartDate(startDate);
  if (!dateCheck.ok) {
    return { ok: false, field: "startDate", error: dateCheck.error };
  }

  return {
    ok: true,
    data: {
      studentName,
      matricNo,
      department,
      companyName,
      industrySupervisorName,
      startDate: dateCheck.isoDate,
      institutionName: cleanOptional(input.institutionName),
      levelOrProgramme: cleanOptional(input.levelOrProgramme),
      companyAddress: cleanOptional(input.companyAddress),
      companySector: cleanOptional(input.companySector),
      assignedUnit: cleanOptional(input.assignedUnit),
      institutionSupervisorName: cleanOptional(input.institutionSupervisorName),
    },
  };
}
