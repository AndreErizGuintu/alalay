import { index, pgEnum, pgTableCreator, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `alalay_${name}`);

export const userRoleEnum = pgEnum("alalay_user_role", ["ADMIN", "TEACHER", "COUNCILOR"]);
export const userStatusEnum = pgEnum("alalay_user_status", ["ACTIVE", "DISABLED", "DROPOUT"]);
export const roleShortcutEnum = pgEnum("alalay_role_shortcut", ["@admin", "@edu", "@conci"]);
export const guidanceActionTypeEnum = pgEnum("alalay_guidance_action_type", [
  "Solution",
  "Penalty",
]);
export const offenseTypeEnum = pgEnum("alalay_offense_type", ["Minor Offense", "Major Offense"]);

export const users = createTable(
  "user",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    fullName: d.varchar({ length: 160 }).notNull(),
    username: d.varchar({ length: 160 }).notNull(),
    password: d.varchar({ length: 255 }).notNull(),
    role: userRoleEnum().notNull(),
    shortcut: roleShortcutEnum().notNull(),
    status: userStatusEnum().notNull().default("ACTIVE"),
    assignedSubjectCodes: d.text().array().notNull().default([]),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [uniqueIndex("user_username_unique_idx").on(t.username), index("user_role_idx").on(t.role)],
);

export const sections = createTable(
  "section",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    name: d.varchar({ length: 160 }).notNull(),
    program: d.varchar({ length: 32 }).notNull(),
    yearLevel: d.varchar({ length: 32 }).notNull(),
    block: d.varchar({ length: 8 }),
    teacherId: d
      .varchar({ length: 64 })
      .references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [uniqueIndex("section_name_unique_idx").on(t.name), index("section_teacher_idx").on(t.teacherId)],
);

export const sectionSubjects = createTable(
  "section_subject",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    sectionId: d
      .varchar({ length: 64 })
      .notNull()
      .references(() => sections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    subjectCode: d.varchar({ length: 64 }).notNull(),
    subjectName: d.varchar({ length: 160 }).notNull(),
    sortOrder: d.integer().notNull().default(0),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    uniqueIndex("section_subject_unique_idx").on(t.sectionId, t.subjectCode),
    index("section_subject_section_idx").on(t.sectionId),
  ],
);

export const students = createTable(
  "student",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    studentNumber: d.varchar({ length: 64 }).notNull(),
    fullName: d.varchar({ length: 160 }).notNull(),
    imageUrl: d.text(),
    status: userStatusEnum().notNull().default("ACTIVE"),

    // Existing app-compatible fields
    age: d.integer(),
    guardian: d.varchar({ length: 160 }),
    contact: d.varchar({ length: 64 }),
    program: d.varchar({ length: 32 }).notNull(),
    yearLevel: d.varchar({ length: 32 }).notNull(),

    // Intake form fields
    birthDate: d.date(),
    birthPlace: d.varchar({ length: 160 }),
    address: d.text(),
    telCellNo: d.varchar({ length: 64 }),
    yearSectionText: d.varchar({ length: 64 }),
    sex: d.varchar({ length: 16 }),
    boardingHouse: d.text(),
    landlordOrLandlady: d.varchar({ length: 160 }),
    previousSchoolAttended: d.varchar({ length: 160 }),
    outstandingActivitiesHonorsAwards: d.text(),

    teacherId: d
      .varchar({ length: 64 })
      .references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    sectionId: d
      .varchar({ length: 64 })
      .references(() => sections.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("student_number_unique_idx").on(t.studentNumber),
    index("student_section_idx").on(t.sectionId),
    index("student_teacher_idx").on(t.teacherId),
    index("student_status_idx").on(t.status),
  ],
);

export const studentFamilyBackgrounds = createTable(
  "student_family_background",
  (d) => ({
    studentId: d
      .varchar({ length: 64 })
      .primaryKey()
      .references(() => students.id, { onDelete: "cascade", onUpdate: "cascade" }),
    motherName: d.varchar({ length: 160 }),
    motherAge: d.integer(),
    motherOccupation: d.varchar({ length: 160 }),
    fatherName: d.varchar({ length: 160 }),
    fatherAge: d.integer(),
    fatherOccupation: d.varchar({ length: 160 }),
    parentsMarried: d.boolean(),
    parentsSeparated: d.boolean(),
    parentsNotMarried: d.boolean(),
    motherFatherRemarried: d.varchar({ length: 160 }),
    stepParentOrGuardianName: d.varchar({ length: 160 }),
    stepParentOrGuardianAge: d.integer(),
    stepParentOrGuardianOccupation: d.varchar({ length: 160 }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("student_family_student_idx").on(t.studentId)],
);

export const studentSubjectGrades = createTable(
  "student_subject_grade",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    studentId: d
      .varchar({ length: 64 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sectionSubjectId: d
      .integer()
      .notNull()
      .references(() => sectionSubjects.id, { onDelete: "cascade", onUpdate: "cascade" }),
    prelim: d.numeric({ precision: 5, scale: 2 }),
    midterm: d.numeric({ precision: 5, scale: 2 }),
    finals: d.numeric({ precision: 5, scale: 2 }),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    uniqueIndex("student_subject_grade_unique_idx").on(t.studentId, t.sectionSubjectId),
    index("student_grade_student_idx").on(t.studentId),
  ],
);

export const studentGuidanceLogs = createTable(
  "student_guidance_log",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    studentId: d
      .varchar({ length: 64 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade", onUpdate: "cascade" }),
    guidanceTime: d.varchar({ length: 8 }),
    actionType: guidanceActionTypeEnum(),
    actionDetail: d.text(),
    offenseType: offenseTypeEnum(),
    entry: d.text().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("student_guidance_student_idx").on(t.studentId)],
);

export const systemLogs = createTable(
  "system_log",
  (d) => ({
    id: d.varchar({ length: 64 }).primaryKey(),
    actor: roleShortcutEnum().notNull(),
    action: d.text().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("system_log_created_idx").on(t.createdAt)],
);

export const teacherSectionSubjects = createTable(
  "teacher_section_subject",
  (d) => ({
    teacherId: d
      .varchar({ length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sectionSubjectId: d
      .integer()
      .notNull()
      .references(() => sectionSubjects.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.teacherId, t.sectionSubjectId], name: "teacher_section_subject_pk" }),
    index("teacher_section_subject_teacher_idx").on(t.teacherId),
  ],
);
