// event.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status";

import { JwtPayload } from "jsonwebtoken";
import { IJwtPayload } from "../../commonType/userType";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventService } from "./event.services";
import pick from "../../helper/pick";

// ============================================
// Get All Events
// ============================================
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const filters = pick(req.query, [
    "search",
    "type",
    "location",
    "date",
    "minFee",
    "maxFee",
    "status",
  ]);
  const result = await EventService.getAllEvents(options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// ============================================
// Get Single Event
// ============================================
const getEventById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.getEventById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event retrieved successfully",
    data: result,
  });
});

// ============================================
// Get Events by Host
// ============================================
const getEventsByHostId = catchAsync(async (req: Request, res: Response) => {
  const { hostId } = req.params;
  const result = await EventService.getEventsByHostId(hostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host events retrieved successfully",
    data: result,
  });
});
// ============================================
// Create Event
// ============================================
const createEvent = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const host = req.user; // from auth middleware
    const result = await EventService.createEvent(host, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Event created successfully",
      data: result,
    });
  }
);

// ============================================
// Get My Hosted Events
// ============================================
const getMyEventsByHost = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await EventService.getEventsByHost(user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your hosted events retrieved successfully",
      data: result,
    });
  }
);

// ============================================
// Update Event
// ============================================
const updateEvent = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await EventService.updateEvent(
      id,
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event updated successfully",
      data: result,
    });
  }
);
// ============================================
// Update Event Status
// ============================================
const updateEventStatus = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user as JwtPayload;
    const { status } = req.body;

    const result = await EventService.updateEventStatus(
      id,
      user as IJwtPayload,
      status
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event status updated successfully",
      data: result,
    });
  }
);

// ============================================
// Delete Event
// ============================================
const deleteEvent = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    await EventService.deleteEvent(id, user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event deleted successfully",
      data: null,
    });
  }
);

export const EventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventsByHostId,
  getMyEventsByHost,
};
