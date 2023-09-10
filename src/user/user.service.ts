import { Injectable } from "@nestjs/common";

import { UpdateUserDto } from "./dto/update-user.dto";

import {
  comparePassword,
  generateHashPassword,
} from "src/shared/utils/passwordManager.util";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Users } from "./model/user.model";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<Users>,
  ) {}

  async updateNameOrPassword(
    id: string,
    updateNameOrPasswordDto: UpdateUserDto,
  ) {
    try {
      const { oldPassword, newPassword, name } =
        updateNameOrPasswordDto;
      if (!name && !newPassword) {
        throw new Error("Please provide name or password");
      }

      const user = await this.userModel.findOne({
        _id: id,
      });

      if (!user) {
        throw new Error("User is not found!");
      }

      if (newPassword) {
        const isPasswordMatch = await comparePassword(
          oldPassword,
          user.password,
        );
        if (!isPasswordMatch) {
          throw new Error("Invalid old password!");
        }

        const password = await generateHashPassword(newPassword);
        await this.userModel.updateOne(
          {
            _id: id,
          },
          {
            password,
          },
        );
      }

      if (name) {
        await this.userModel.updateOne(
          {
            _id: id,
          },
          {
            name,
          },
        );
      }

      return {
        success: true,
        message: "Update user successful",
        result: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(role: string) {
    try {
      const users = await this.userModel.find({
        role,
      });

      return {
        success: true,
        message: "Users fetched successfully",
        result: users,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
