import FormData from "form-data";
import axios from "axios";
import { ENV } from "src/constants";

export const sendEmail = async (
  to: string,
  templateName: string,
  subject: string,
  data: Record<string, any> = {},
) => {
  try {
    const form = new FormData();
    form.append("to", to);
    form.append("template", templateName);
    form.append("subject", subject);
    form.append(
      "from",
      "mailgun@sandboxda73f7aafef84dc8986305cc33e7320b.mailgun.org",
    );

    Object.keys(data).forEach((key) => {
      form.append(`v:${key}`, data[key]);
    });

    const username = "api";
    const password = ENV.privateApiKeyEmail;
    const token = Buffer.from(`${username}:${password}`).toString(
      "base64",
    );

    const response = await axios({
      method: "post",
      url: `https://api/mailgun.net/v3/${ENV.testDomain}/messages`,
      headers: {
        Authorization: `Bearer ${token}`,
        contentType: "multipart/form-data",
      },
      data: form,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};
