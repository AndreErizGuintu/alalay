import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "~/server/db";
import { studentFamilyBackgrounds, students } from "~/server/db/schema";
import { updateStudentInputSchema } from "~/server/validation/student";

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body: unknown = await request.json();
  const parsed = updateStudentInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(students)
      .set({
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl ?? null } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.teacherId !== undefined ? { teacherId: data.teacherId } : {}),
        ...(data.sectionId !== undefined ? { sectionId: data.sectionId } : {}),
        ...(data.profile
          ? {
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
            }
          : {}),
      })
      .where(eq(students.id, id));

    if (data.profile) {
      await tx
        .insert(studentFamilyBackgrounds)
        .values({
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
        })
        .onConflictDoUpdate({
          target: studentFamilyBackgrounds.studentId,
          set: {
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
          },
        });
    }
  });

  return NextResponse.json({ ok: true });
}
