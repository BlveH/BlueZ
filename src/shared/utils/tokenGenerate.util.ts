import jwt from "jsonwebtoken";
import config from "config";

export const generateAuthToken = (id: string) => {
  return jwt.sign({ id }, config.get("jwtSecret"), {
    expiresIn: "30m",
  });
};

export const decodeAuthToken = (token: string) => {
  return jwt.verify(token, config.get("jwtSecret"));
};
