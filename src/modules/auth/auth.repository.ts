import prisma from "../../db/index.js";
import { RegisterSchema } from "./auth.schema.js";

export const authRepository = {
  findUserByUsername: async ({ username }: { username: string }) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });
    return user;
  },

  findUserById: async ({ userId }: { userId: string }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        password: true,
        userType: {
          select: {
            name: true,
          },
        },
      },
    });
    return user;
  },

  createUser: async ({ payload }: { payload: RegisterSchema["body"] }) => {
    const { username, password } = payload;

    return await prisma.user.create({
      data: {
        username,
        password,
      },
    });
  },

  changePasswordUser: async ({
    userId,
    newPassword,
  }: {
    userId: string;
    newPassword: string;
  }) => {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
    return user;
  },
};
