import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Users } from "src/user/model/user.model";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {}
  async findUserByRole(role: string) {
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
}
