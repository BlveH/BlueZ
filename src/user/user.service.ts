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
          _id: user._id,
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

  async sendOtpEmail(email: string) {
    try {
      const user = await this.userDB.findOne({
        email,
      });

      if (!user) {
        throw new Error("User is not found!");
      }

      if (user.isVerified) {
        throw new Error("Email is already verified!");
      }

      const otp = Math.floor(Math.random() * 900000) + 100000;
      const otpExpiredTime = new Date();
      otpExpiredTime.setMinutes(otpExpiredTime.getMinutes() + 10);
      await this.userDB.updateOne(
        {
          _id: user._id,
        },
        {
          otp,
          otpExpiredTime,
        },
      );

      sendEmail(
        user.email,
        config.get("emailService.emailTemplate.verifyEmail"),
        "Email verification - BlueZone",
        {
          customerName: user.name,
          customerEmail: user.email,
          otp,
        },
      );

      return {
        success: true,
        message: "OTP sent successfully",
        result: { email: user.email },
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

    const token = generateAuthToken(userExist._id);

    return {
      success: true,
      message: "Login successful",
      result: {
        user: {
          id: userExist._id,
          name: userExist.name,
          email: userExist.email,
        },
        token: token,
      },
    };
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userDB.findOne({
        email,
      });

      if (!user) {
        throw new Error("User is not found!");
      }

      let password = Math.random().toString(36).substring(2, 12);
      const tempPassword = password;
      password = await generateHashPassword(password);
      await this.userDB.updateOne(
        {
          _id: user._id,
        },
        {
          password,
        },
      );

      sendEmail(
        user.email,
        config.get("emailService.emailTemplate.verifyEmail"),
        "Email verification - BlueZone",
        {
          customerName: user.name,
          customerEmail: user.email,
          newPassword: password,
          loginLink: config.get("loginURL"),
        },
      );

      return {
        success: true,
        message: "Password sent to your email",
        result: { email: user.email, password: tempPassword },
      };
    } catch (error) {
      throw error;
    }
  }

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

      const user = await this.userDB.findOne({
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
        await this.userDB.updateOne(
          {
            _id: id,
          },
          {
            password,
          },
        );
      }

      if (name) {
        await this.userDB.updateOne(
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
      const users = await this.userDB.find({
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
