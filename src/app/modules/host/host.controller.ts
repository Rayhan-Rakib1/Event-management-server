// host.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../shared/sendResponse";
import { HostService } from "./host.services";
import catchAsync from "../../shared/catchAsync";
import { IJwtPayload } from "../../commonType/userType";

// ============================================
// 1. Get Top Rated Hosts
// ============================================
const getTopRatedHosts = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const result = await HostService.getTopRatedHosts(limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top rated hosts retrieved successfully",
    data: result,
  });
});

// ============================================
// 2. Get Host by ID
// ============================================
const getHostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HostService.getHostById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host retrieved successfully",
    data: result,
  });
});

// ============================================
// 3. Get My Host Profile
// ============================================
const getMyHostProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await HostService.getMyHostProfile(user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your host profile retrieved successfully",
      data: result,
    });
  }
);

// ============================================
// 4. Get Host Dashboard
// ============================================
const getHostDashboard = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HostService.getHostDashboard(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host dashboard data retrieved successfully",
    data: result,
  });
});

// ============================================
// 5. Get Host Average Rating
// ============================================
const getHostAvgRating = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await HostService.getHostAvgRating(user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Host average rating retrieved successfully",
      data: result,
    });
  }
);

// ============================================
// 6. Update Host Profile
// ============================================
const updateHost = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await HostService.updateHost(
      id,
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Host profile updated successfully",
      data: result,
    });
  }
);

// ============================================
// 7. Delete Host Profile
// ============================================
const deleteHost = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    await HostService.deleteHost(id, user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Host profile deleted successfully",
      data: null,
    });
  }
);

// ============================================
// 8. Get Host Statistics
// ============================================
const getHostStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await HostService.getHostStats(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host statistics retrieved successfully",
    data: result,
  });
});

export const HostController = {
  getTopRatedHosts,
  getHostById,
  getMyHostProfile,
  getHostDashboard,
  getHostAvgRating,
  updateHost,
  deleteHost,
  getHostStats,
};