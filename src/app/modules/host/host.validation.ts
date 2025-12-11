import { Gender } from "@prisma/client";
import z from "zod";

// Update Host Validation
const updateHostSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    profileImage: z.string().url().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    gender: z.nativeEnum(Gender).optional(),
    interests: z.array(z.string()).optional(),
  }),
});

export const HostValidation = {
  updateHostSchema,
};
