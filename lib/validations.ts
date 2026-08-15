import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    university: z.string().optional(),
    department: z.string().optional(),
    semester: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const courseSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  courseCode: z.string().min(1, "Course code is required"),
  creditHours: z.coerce.number().min(1, "Credit hours must be greater than 0"),
  instructor: z.string().optional(),
  semester: z.string().optional(),
  currentGrade: z.string().optional(),
});

export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  courseId: z.string().min(1, "Course is required"),
  description: z.string().optional(),
  deadline: z.coerce.date({ required_error: "Deadline is required" }),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedHours: z.coerce.number().min(0.5, "Estimate at least 0.5 hours"),
  notes: z.string().optional(),
});

export const examSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  examType: z.string().min(1, "Exam type is required"),
  date: z.coerce.date({ required_error: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const timetableSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  date: z.coerce.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  sessionType: z.enum([
    "LECTURE",
    "REVISION",
    "PRACTICE",
    "ASSIGNMENT",
    "PRACTICAL",
    "PROJECT",
    "READING",
    "EXAM_PREPARATION",
    "MOCK_TEST",
    "BREAK",
  ]).default("LECTURE"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  totalLectures: z.coerce.number().min(1, "Total lectures must be at least 1"),
  completedLectures: z.coerce.number().min(0, "Completed lectures cannot be negative"),
  pendingWork: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"]).default("PENDING"),
  isBreak: z.boolean().default(false),
});

export const studyPlannerInputSchema = z.object({
  availableHours: z.coerce.number().min(1).max(24),
  preferredTime: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  weakSubjects: z.array(z.string()).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const studyMaterialSchema = z
  .object({
    materialName: z.string().min(1, "Material name is required"),
    subject: z.string().min(1, "Subject is required"),
    unit: z.string().min(1, "Unit is required"),
    type: z.enum(["NOTES", "PDF", "IMAGE", "DOCUMENT", "LINK"]),
    description: z.string().optional(),
    notesContent: z.string().optional(),
    fileUrl: z.string().optional(),
    resourceUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    tags: z.array(z.string()).optional(),
    isImportant: z.boolean().default(false),
    isFavorite: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (["PDF", "IMAGE", "DOCUMENT"].includes(data.type) && !data.fileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUrl"],
        message: "Please upload a file for this material type.",
      });
    }

    if (data.type === "LINK" && (!data.resourceUrl || !data.resourceUrl.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resourceUrl"],
        message: "Please enter a valid resource URL.",
      });
    }
  });

export const quickNoteSchema = z.object({
  materialName: z.string().min(1, "Note title is required"),
  subject: z.string().min(1, "Subject is required"),
  unit: z.string().min(1, "Unit is required"),
  type: z.literal("NOTES"),
  notesContent: z.string().min(1, "Note content is required"),
  tags: z.array(z.string()).optional(),
  isImportant: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
});
