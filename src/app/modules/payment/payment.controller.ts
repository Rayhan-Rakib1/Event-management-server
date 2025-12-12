import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helper/stripe";
import { PaymentService } from "./payment.services";
import config from "../../../config";
import AppError from "../../error/appError";
import httpStatus from "http-status";


const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret: string | undefined =
      config.stripe.stripe_webhook_secret;

      if(!webhookSecret){
       throw new AppError(httpStatus.BAD_REQUEST, "web hook not found")
      }
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
