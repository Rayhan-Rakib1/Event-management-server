// participant.validation.ts

import { z } from 'zod';

// Join Event Validation
const joinEventSchema = z.object({
  body: z.object({
    eventId: z.string({
      message: 'Event ID is required',
    }),
  }),
});

// Confirm Payment Validation
const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string({
      message: 'Payment Intent ID is required',
    }),
    transactionId: z.string({
      message: 'Transaction ID is required',
    }),
  }),
});

export const ParticipantValidation = {
  joinEventSchema,
  confirmPaymentSchema,
};