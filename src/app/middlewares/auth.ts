import { Request, RequestHandler } from "express";
import AppError from "../error/appError";
import httpStatus from "http-status"
import { jwtHelper } from "../helper/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";


const auth = (...roles: string[]): RequestHandler => {
  return async (req: Request & {user?: any}, res, next) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!")
      };

      const verifyUser = jwtHelper.verifyToken(token, config.jwt_secret as Secret);
      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED,"You are not authorized!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
