import { prisma } from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";

import { Role, UserStatus } from "@prisma/client";

const createUser = async (payload: any) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_round)
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
  });

  return user;
};

const createHost = async (payload: any) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_round)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: Role.HOST,
        status: UserStatus.ACTIVE,
        bio: payload.bio,
        gender: payload.gender,
        location: payload.location,
        interests: payload.interests,
      },
    });
    return await tnx.host.create({
      data: {
        name: payload.name,
        email: payload.email,
        profileImage: payload.profileImage,
        bio: payload.bio,
        gender: payload.gender,
        location: payload.location,
        interests: payload.interests,
      },
    });
  });

  return result;
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { role: Role.USER },
  });
};

const getAllHosts = async () => {
  return await prisma.user.findMany({
    where: { role: Role.HOST },
  });
};

const getSingleUser = async (id: string) => {
  return await prisma.user.findUniqueOrThrow({
    where: { id },
  });
};

const updateUser = async (id: string, payload: any) => {
  return await prisma.user.update({
    where: { id },
    data: payload,
  });
};

const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });
};

export const UserService = {
  createUser,
  createHost,
  getAllUsers,
  getAllHosts,
  getSingleUser,
  updateUser,
  deleteUser,
};
