// event.validation.ts

import { z } from 'zod';
import { EventStatus } from '@prisma/client';

// Create Event Validation
const createEventSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Event name is required',
    }).min(3, 'Name must be at least 3 characters'),

    type: z.string({
      message: 'Event type is required',
    }),

    description: z.string({
      message: 'Description is required',
    }).min(10, 'Description must be at least 10 characters'),

    date: z.string({
      message: 'Date is required',
    }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),

    time: z.string({
      message: 'Time is required',
    }),

    location: z.string({
      message: 'Location is required',
    }),

    image: z.string().url().optional(),

    joiningFee: z.number().min(0).default(0).optional(),

    minParticipants: z.number().min(1).default(2).optional(),

    maxParticipants: z.number({
      message: 'Max participants is required',
    }).min(1),
  }).refine(
    (data) => {
      const minP = data.minParticipants || 2;
      return data.maxParticipants >= minP;
    },
    {
      message: 'Max participants must be greater than or equal to min participants',
      path: ['maxParticipants'],
    }
  ),
});

// Update Event Validation
const updateEventSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    type: z.string().optional(),
    description: z.string().min(10).optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }).optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    image: z.string().url().optional(),
    joiningFee: z.number().min(0).optional(),
    minParticipants: z.number().min(1).optional(),
    maxParticipants: z.number().min(1).optional(),
    status: z.nativeEnum(EventStatus).optional(),
  }),
});

// Get Events Query Validation
const getEventsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),

  minFee: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  maxFee: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  status: z.nativeEnum(EventStatus).optional(),

  page: z.string().optional().transform((v) => Number(v) || 1),
  limit: z.string().optional().transform((v) => Number(v) || 10),

  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const EventValidation = {
  createEventSchema,
  updateEventSchema,
  getEventsQuerySchema,
};