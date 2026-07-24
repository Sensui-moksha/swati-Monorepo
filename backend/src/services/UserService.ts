import { Types } from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { IUser } from "../models/User";
import { ApiError } from "../middleware/errorHandler";
import {
  PaginationOptions,
  PaginatedResult,
} from "../repositories/BaseRepository";

export interface UserFilter {
  search?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role?: "user" | "editor" | "admin";
  avatar?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  role?: "user" | "editor" | "admin";
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  fullName?: string;
  avatar?: string;
  username?: string;
  email?: string;
}

export class UserService {
  async getUsers(
    filter: UserFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUser>> {
    return userRepository.findWithPagination(filter, options);
  }

  async getUserById(id: string | Types.ObjectId): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  async getUserByIdOrNull(id: string | Types.ObjectId): Promise<IUser | null> {
    return userRepository.findById(id);
  }

  async createUser(data: CreateUserData): Promise<IUser> {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw ApiError.conflict("Email already in use");
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw ApiError.conflict("Username already taken");
    }

    const user = await userRepository.create({
      ...data,
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      role: data.role || "user",
    });

    return user;
  }

  async updateUser(
    id: string | Types.ObjectId,
    data: UpdateUserData,
  ): Promise<IUser> {
    const user = await this.getUserById(id);

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw ApiError.conflict("Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw ApiError.conflict("Username already taken");
      }
    }

    const updatedUser = await userRepository.updateById(id, data);
    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

    return updatedUser;
  }

  async deleteUser(id: string | Types.ObjectId): Promise<void> {
    await this.getUserById(id);
    await userRepository.deleteById(id);
  }

  async hardDeleteUser(id: string | Types.ObjectId): Promise<void> {
    await this.getUserById(id);
    await userRepository.deleteById(id);
  }

  async changePassword(
    userId: string | Types.ObjectId,
    data: ChangePasswordData,
  ): Promise<void> {
    const user = await this.getUserById(userId);

    const isMatch = await user.comparePassword(data.currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    user.password = data.newPassword;
    await user.save();
  }

  async updateProfile(
    userId: string | Types.ObjectId,
    data: UpdateProfileData,
  ): Promise<IUser> {
    const user = await this.getUserById(userId);

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw ApiError.conflict("Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw ApiError.conflict("Username already taken");
      }
    }

    const updatedUser = await userRepository.updateById(userId, data);
    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

    return updatedUser;
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsers: number;
    recentUsers: IUser[];
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, verifiedUsers, newUsers, recentUsers] =
      await Promise.all([
        userRepository.count({}),
        userRepository.getActiveUsersCount(),
        userRepository.getVerifiedUsersCount(),
        userRepository.count({ createdAt: { $gte: thirtyDaysAgo } }),
        userRepository.getRecentUsers(5),
      ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsers,
      recentUsers,
    };
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return userRepository.getUsersByRole(role);
  }

  async activateUser(id: string | Types.ObjectId): Promise<IUser> {
    await this.getUserById(id);
    const updatedUser = await userRepository.updateById(id, { isActive: true });
    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }
    return updatedUser;
  }

  async deactivateUser(id: string | Types.ObjectId): Promise<IUser> {
    await this.getUserById(id);
    const updatedUser = await userRepository.updateById(id, {
      isActive: false,
    });
    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }
    return updatedUser;
  }

  async verifyUserEmail(id: string | Types.ObjectId): Promise<IUser> {
    const user = await this.getUserById(id);
    const updatedUser = await userRepository.verifyEmail(
      user._id as Types.ObjectId,
    );
    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }
    return updatedUser;
  }
}

export const userService = new UserService();
