import { InjectModel } from "@nestjs/mongoose";
import { Users } from "../schema/user.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<Users>,
  ) {}

  async find(query: any) {
    return await this.userModel.find(query);
  }

  async findOne(query: any) {
    return await this.userModel.findOne(query);
  }

  async create(data: Record<string, any>) {
    return await this.userModel.create(data);
  }

  async updateOne(query: any, data: Record<string, any>) {
    return await this.userModel.updateOne(query, data);
  }

  async findById(id: string) {
    return await this.userModel.findById(id);
  }
}
