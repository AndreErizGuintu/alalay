import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "~/server/db";
import { studentFamilyBackgrounds, students } from "~/server/db/schema";
import { createStudentInputSchema } from "~/server/validation/student";

const toIntOrNull = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const toDateOrNull = (value: string | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
};

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = createStudentInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await db.query.students.findFirst({
    where: eq(students.studentNumber, data.studentNumber),
    columns: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Student number already exists." },
      { status: 409 },
    );
  }

  const id = `stud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await db.transaction(async (tx) => {
    await tx.insert(students).values({
      id,
      studentNumber: data.studentNumber,
      fullName: data.fullName,
      imageUrl: data.imageUrl,
      status: "ACTIVE",
      age: data.profile.age,
      guardian: data.profile.guardian,
      contact: data.profile.contact,
      program: data.profile.program,
      yearLevel: data.profile.yearLevel,
      birthDate: toDateOrNull(data.profile.birthDate),
      birthPlace: data.profile.birthPlace ?? null,
      address: data.profile.address ?? null,
      telCellNo: data.profile.telCellNo ?? null,
      sex: data.profile.sex ?? null,
      boardingHouse: data.profile.boardingHouse ?? null,
      landlordOrLandlady: data.profile.landlordOrLandlady ?? null,
      previousSchoolAttended: data.profile.previousSchoolAttended ?? null,
      outstandingActivitiesHonorsAwards:
        data.profile.outstandingActivitiesHonorsAwards ?? null,
    });

    await tx.insert(studentFamilyBackgrounds).values({
      studentId: id,
      motherName: data.profile.motherName ?? null,
      motherAge: toIntOrNull(data.profile.motherAge),
      motherOccupation: data.profile.motherOccupation ?? null,
      fatherName: data.profile.fatherName ?? null,
      fatherAge: toIntOrNull(data.profile.fatherAge),
      fatherOccupation: data.profile.fatherOccupation ?? null,
      parentsMarried: data.profile.parentsMarried,
      parentsSeparated: data.profile.parentsSeparated,
      parentsNotMarried: data.profile.parentsNotMarried,
      motherFatherRemarried: data.profile.motherFatherRemarried ?? null,
      stepParentOrGuardianName: data.profile.stepParentOrGuardianName ?? null,
      stepParentOrGuardianAge: toIntOrNull(data.profile.stepParentOrGuardianAge),
      stepParentOrGuardianOccupation:
        data.profile.stepParentOrGuardianOccupation ?? null,
    });
  });

  return NextResponse.json({ id }, { status: 201 });
}
