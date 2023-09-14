import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  comparePassword,
  generateHashPassword,
} from "src/utils/passwordManager.util";
import { RegisterDto } from "./dto/register.dto";
import { sendEmail } from "src/utils/mailHandle";
import { Users } from "src/user/model/user.model";
import { Role } from "./role/role.enum";
import { ENV } from "src/constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Users.name)
    private readonly userModel: Model<Users>,
  ) {}

  async logout(user: Record<string, any>, refreshToken?: string) {
    if (!refreshToken) {
      await this.userModel.updateOne(
        { email: user.email },
        { refreshTokens: [] },
      );
      return;
    }
    await this.userModel.updateOne(
      {
        email: user.email,
      },
      {
        $pull: {
          refreshTokens: refreshToken,
        },
      },
    );
  }

  async register(registerDto: RegisterDto) {
    try {
      registerDto.password = await generateHashPassword(registerDto.password);

      //check is it for admin
      if (
        registerDto.role === Role.Admin &&
        registerDto.secretToken !== ENV.adminSecretToken
      ) {
        throw new Error("Not allowed to register admin");
      } else if (registerDto.role !== Role.Customer) {
        registerDto.isVerified = true;
      }

      //check exist user
      const user = await this.userModel.findOne({
        email: registerDto.email,
      });

      if (user) {
        throw new Error("User is already exist");
      }

      //generate otp
      const otp = Math.floor(Math.random() * 900000) + 100000;

      const otpExpiredTime = new Date();
      otpExpiredTime.setMinutes(otpExpiredTime.getMinutes() + 10);

      const newUser = await this.userModel.create({
        ...registerDto,
        otp,
        otpExpiredTime,
      });

      if (!newUser.role.includes(Role.Admin)) {
        sendEmail(
          newUser.email,
          ENV.verifyEmail,
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
        message: newUser.role.includes(Role.Admin)
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
      const user = await this.userModel.findOne({
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

      await this.userModel.updateOne(
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
      const user = await this.userModel.findOne({
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
      await this.userModel.updateOne(
        {
          _id: user._id,
        },
        {
          otp,
          otpExpiredTime,
        },
      );

      sendEmail(user.email, ENV.verifyEmail, "Email verification - BlueZone", {
        customerName: user.name,
        customerEmail: user.email,
        otp,
      });

      return {
        success: true,
        message: "OTP sent successfully",
        result: { email: user.email },
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userModel.findOne({
        email,
      });

      if (!user) {
        throw new Error("User is not found!");
      }

      let password = Math.random().toString(36).substring(2, 12);
      const tempPassword = password;
      password = await generateHashPassword(password);
      await this.userModel.updateOne(
        {
          _id: user._id,
        },
        {
          password,
        },
      );

      sendEmail(user.email, ENV.verifyEmail, "Email verification - BlueZone", {
        customerName: user.name,
        customerEmail: user.email,
        newPassword: password,
        loginLink: ENV.loginURL,
      });

      return {
        success: true,
        message: "Password sent to your email",
        result: { email: user.email, password: tempPassword },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    const userExist = await this.userModel.findOne({
      email,
    });

    if (!userExist) {
      throw new Error("Invalid email or password!");
    }

    if (userExist.isVerified === false) {
      throw new Error("Please verify your email!");
    }

    const isPasswordMatch = await comparePassword(password, userExist.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid email or password!");
    }

    const accessToken = this.jwtService.sign(
      {
        _id: userExist._id,
        email: userExist.email,
        role: userExist.role,
      },
      { secret: ENV.jwtSecret },
    );
    const refreshToken = this.jwtService.sign(
      {
        _id: userExist._id,
        email: userExist.email,
        role: userExist.role,
      },
      { secret: ENV.refreshSecret },
    );

    userExist.refreshTokens.push(refreshToken);
    await userExist.save();
    return {
      success: true,
      message: "Login successful",
      result: {
        user: {
          id: userExist._id,
          name: userExist.name,
          email: userExist.email,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }
}
