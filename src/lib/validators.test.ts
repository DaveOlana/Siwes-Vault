import { describe, expect, it } from "vitest";
import { validatePlacementInput, validateRegisterInput } from "./validators";

describe("M1 input validators", () => {
  it("validates and normalizes registration payloads", () => {
    const res = validateRegisterInput({
      name: "  Chukwudi Gospel  ",
      email: "  Student@Yabatech.Edu.Ng ",
      password: "securePassword123",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.name).toBe("Chukwudi Gospel");
      expect(res.data.email).toBe("student@yabatech.edu.ng");
    }
  });

  it("rejects invalid email and short password", () => {
    expect(
      validateRegisterInput({
        name: "Ada",
        email: "bad-email",
        password: "password123",
      }).ok
    ).toBe(false);

    expect(
      validateRegisterInput({
        name: "Ada",
        email: "ada@example.com",
        password: "short",
      }).ok
    ).toBe(false);
  });

  it("validates placement input including optional M3 fields and rejects Sunday start dates", () => {
    const valid = validatePlacementInput({
      studentName: "Adebayo Timileyin",
      matricNo: "F/ND/24/3210287",
      department: "Computer Science",
      companyName: "Paystack Labs",
      industrySupervisorName: "Engr. Tunde Bakare",
      startDate: "2026-12-02",
      companyAddress: "42 Montgomery Rd, Yaba",
      institutionSupervisorName: "Dr. K. Adeyemi",
    });
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.data.companyAddress).toBe("42 Montgomery Rd, Yaba");
      expect(valid.data.institutionSupervisorName).toBe("Dr. K. Adeyemi");
      expect(valid.data.companySector).toBeUndefined();
    }

    const sunday = validatePlacementInput({
      studentName: "Adebayo Timileyin",
      matricNo: "F/ND/24/3210287",
      department: "Computer Science",
      companyName: "Paystack Labs",
      industrySupervisorName: "Engr. Tunde Bakare",
      startDate: "2026-11-29",
    });
    expect(sunday.ok).toBe(false);
    if (!sunday.ok) {
      expect(sunday.field).toBe("startDate");
    }
  });
});
