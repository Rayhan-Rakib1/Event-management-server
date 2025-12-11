import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelper } from "../../helper/jwtHelper";
import { prisma } from "../../../shared/prisma";
import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import AppError from "../../error/appError";
import httpStatus from "http-status";
import emailSender from "./email.sender";

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedToken = jwtHelper.verifyToken(
    accessToken,
    config.jwt_secret as Secret
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: decodedToken.email, status: UserStatus.ACTIVE },
  });

  const { name, email, status, profileImage, role } = userData;

  return {
    name,
    email,
    status,
    profileImage,
    role,
  };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isCorrectPassword) {
    new AppError(httpStatus.BAD_REQUEST, "Password wrong");
  }
  const accessToken = jwtHelper.generateToken(
    { name: user.name, email: user.email, role: user.role },
    config.jwt_secret as string,
    config.expires_in as string
  );
  const refreshToken = jwtHelper.generateToken(
    { name: user.name, email: user.email, role: user.role },
    config.jwt_secret as string,
    config.refresh_token_expires_in as string
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    email: user.email,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelper.verifyToken(token, config.jwt_secret as Secret);
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
      name: userData.name,
    },
    config.jwt_secret as Secret,
    config.expires_in as string
  );

  return {
    accessToken,
    email: userData.email,
  };
};
const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_round)
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    email: user.email,
    password: hashedPassword,
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelper.generateToken(
    { email: userData.email, role: userData.role },
    config.reset_pass_secret as Secret,
    config.reset_pass_token_expires_in as string
  );

  const resetPassLink =
    config.emailSender.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender(
    userData.email,
    `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>

        </div>
        `
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelper.verifyToken(
    token,
    config.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(config.salt_round)
  );

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const AuthServices = { getMe, login, refreshToken, changePassword, forgotPassword, resetPassword };
