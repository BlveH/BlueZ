import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { userRole } from "src/shared/schema/user.schema";
import config from "config";
import { UserRepository } from "src/shared/repositories/user.repo";
import {
  comparePassword,
  generateHashPassword,
} from "src/shared/utils/passwordManager.util";
import { sendEmail } from "src/shared/utils/mailHandle";
import { generateAuthToken } from "src/shared/utils/tokenGenerate.util";

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly userDB: UserRepository,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await generateHashPassword(
        createUserDto.password,
      );

      //check is it for admin
      if (
        createUserDto.role === userRole.ADMIN &&
        createUserDto.secretToken !== config.get("adminSecretToken")
      ) {
        throw new Error("Not allowed to create admin");
      } else if (createUserDto.role !== userRole.CUSTOMER) {
        createUserDto.isVerified = true;
      }

      //check exist user
      const user = await this.userDB.findOne({
        email: createUserDto.email,
      });

      if (user) {
        throw new Error("User is already exist");
      }

      //generate otp
      const otp = Math.floor(Math.random() * 900000) + 100000;

      const otpExpiredTime = new Date();
      otpExpiredTime.setMinutes(otpExpiredTime.getMinutes() + 10);

      const newUser = await this.userDB.create({
        ...createUserDto,
        otp,
        otpExpiredTime,
      });

      if (newUser.role !== userRole.ADMIN) {
        sendEmail(
          newUser.email,
          config.get("emailService.emailTemplate.verifyEmail"),
          "Email verification - BlueZone",
          {
            customerName: newUser.name,
            customerEmail: newUser.email,
            otp,
          },
        );
      }

      return {
        success: true,
        message:
          newUser.role === userRole.ADMIN
            ? "Admin created successfully"
            : "Please activate your account by verifying your email. We have sent you a email with the OTP",
        result: { email: newUser.email },
      };
    } catch (err) {
      throw err;
    }
  }

  async verifyEmail(otp: string, email: string) {
    try {
      const user = await this.userDB.findOne({
        email,
      });

      if (!user) {
        throw new Error("User is not found!");
      }

      if (user.otp !== otp) {
        throw new Error("Invalid OTP!");
      }

      if (user.otpExpiredTime < new Date()) {
        throw new Error("OTP expired!");
      }

      await this.userDB.updateOne(
        {
          email,
        },
        {
          isVerified: true,
        },
      );
      return {
        success: true,
        message: "Email verify successful",
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    const userExist = await this.userDB.findOne({
      email,
    });

    if (!userExist) {
      throw new Error("Invalid email or password!");
    }

    if (userExist.isVerified === false) {
      throw new Error("Please verify your email!");
    }

    const isPasswordMatch = await comparePassword(
      password,
      userExist.password,
    );

    if (!isPasswordMatch) {
      throw new Error("Invalid email or password!");
    }

    const token = await generateAuthToken(userExist._id);

    return {
      success: true,
      message: "Login successful",
      result: {
        user: {
          id: userExist._id,
          name: userExist.name,
          email: userExist.email,
        },
        token,
      },
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
