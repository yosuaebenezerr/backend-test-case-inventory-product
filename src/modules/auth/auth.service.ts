import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { LoginSchema, RegisterSchema } from "./auth.schema.js";
import { authRepository } from "./auth.repository.js";

const authService = {
  signIn: async ({ payload }: { payload: LoginSchema["body"] }) => {
    const { username, password } = payload;
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Secret key not found");
    }

    const user = await authRepository.findUserByUsername({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const checkPassword = await argon2.verify(user.password, password);
    if (!checkPassword) {
      throw new Error("Invalid password");
    }

    const insertToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      secretKey!,
      {
        expiresIn: "1h",
      },
    );

    return {
      token: insertToken,
      data: {
        id: user.id,
        username: user.username,
      },
    };
  },

  signOut: async ({ username }: { username: string }) => {
    try {
      const decodedToken = jwt.verify(username, process.env.SECRET_KEY!);

      await authRepository.findUserByUsername({
        username: decodedToken as string,
      });
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  signUp: async ({ payload }: { payload: RegisterSchema["body"] }) => {
    const { password } = payload;
    const hashedPassword = await argon2.hash(password);
    const user = await authRepository.createUser({
      payload: {
        ...payload,
        password: hashedPassword,
      },
    });
    return user;
  },

  updatePasswordUser: async ({
    userId,
    oldPassword,
    newPassword,
    confirmPassword,
  }: {
    userId: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const oldPasswordCheck = await authRepository.findUserById({ userId });
    if (!oldPasswordCheck) {
      throw new Error("User tidak ditemukan!");
    }

    const checkOldPasswordValid = await argon2.verify(
      oldPasswordCheck.password,
      oldPassword,
    );

    if (!checkOldPasswordValid) {
      throw new Error("Password lama salah!");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Password baru dengan konfirmasi password tidak sama!");
    }

    const hashingPassword = await argon2.hash(newPassword);

    await authRepository.changePasswordUser({
      userId,
      newPassword: hashingPassword,
    });
  },
};

export default authService;
