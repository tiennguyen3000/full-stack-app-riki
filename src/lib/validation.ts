import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  level: z.string().optional(),
});

export const courseCreateSchema = z.object({
  title: z.string().min(2).max(500),
  slug: z.string().min(2).max(500).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  level: z.string().min(1),
  price: z.number().int().min(0),
  originalPrice: z.number().int().min(0).nullable().optional(),
  duration: z.string().min(1),
  sessions: z.number().int().min(1),
  thumbnail: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const enrollSchema = z.object({
  courseId: z.string().uuid(),
  paymentMethod: z.string().min(1).default("momo"),
  voucherCode: z.string().optional().nullable(),
});

export const folderCreateSchema = z.object({
  name: z.string().min(1).max(255),
  isPublic: z.boolean().optional().default(false),
});

export const flashcardCreateSchema = z.object({
  front: z.string().min(1).max(500),
  reading: z.string().max(500).nullable().optional(),
  back: z.string().min(1).max(500),
  example: z.string().nullable().optional(),
  exampleMeaning: z.string().nullable().optional(),
});

export const commentSchema = z.object({
  name: z.string().max(255).optional(),
  content: z.string().min(1).max(2000),
});

export const testSubmitSchema = z.object({
  answers: z.array(z.number().int().min(0)),
  durationSeconds: z.number().int().min(0).optional(),
});
