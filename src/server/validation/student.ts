import { z } from "zod";

export const intakeProgramSchema = z.string().min(2).max(32);

export const studentProfileSchema = z.object({
  age: z.number().int().min(1).max(120).default(18),
  guardian: z.string().max(160).default("To be updated"),
  contact: z.string().max(64).default("To be updated"),
  program: intakeProgramSchema,
  yearLevel: z.string().min(3).max(32),
  birthDate: z.string().max(32).default(""),
  birthPlace: z.string().max(160).default(""),
  address: z.string().max(1000).default(""),
  telCellNo: z.string().max(64).default(""),
  sex: z.string().max(16).default(""),
  boardingHouse: z.string().max(1000).default(""),
  landlordOrLandlady: z.string().max(160).default(""),
  previousSchoolAttended: z.string().max(160).default(""),
  outstandingActivitiesHonorsAwards: z.string().max(2000).default(""),
  motherName: z.string().max(160).default(""),
  motherAge: z.string().max(8).default(""),
  motherOccupation: z.string().max(160).default(""),
  fatherName: z.string().max(160).default(""),
  fatherAge: z.string().max(8).default(""),
  fatherOccupation: z.string().max(160).default(""),
  parentsMarried: z.boolean().default(false),
  parentsSeparated: z.boolean().default(false),
  parentsNotMarried: z.boolean().default(false),
  motherFatherRemarried: z.string().max(160).default(""),
  stepParentOrGuardianName: z.string().max(160).default(""),
  stepParentOrGuardianAge: z.string().max(8).default(""),
  stepParentOrGuardianOccupation: z.string().max(160).default(""),
});

export const createStudentInputSchema = z.object({
  studentNumber: z.string().min(1).max(64),
  fullName: z.string().min(2).max(160),
  imageUrl: z.string().max(2_000_000).optional(),
  profile: studentProfileSchema,
});

export const updateStudentInputSchema = z.object({
  fullName: z.string().min(2).max(160).optional(),
  imageUrl: z.string().max(2_000_000).optional().nullable(),
  status: z.enum(["ACTIVE", "DISABLED", "DROPOUT"]).optional(),
  profile: studentProfileSchema.partial().optional(),
  teacherId: z.string().max(64).nullable().optional(),
  sectionId: z.string().max(64).nullable().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentInputSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentInputSchema>;
