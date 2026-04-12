import { providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import {
  encrypt,
  decrypt,
} from "../../common/utils/security/encrypt.security.js";
import { Hash, Compare } from "../../common/utils/security/hash.security.js";
import {
  VerifyToken,
  GenerateToken,
} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { OAuth2Client } from "google-auth-library";
// import cloudinary from "../../common/utils/cloudinary.js";
// import fs from "fs";
import * as configService from "../../../config/config.service.js";
import { randomUUID } from "crypto";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import {
  set,
  get,
  keys,
  getKey,
  deleteKey,
  revoked_key,
  otpKey,
  max_otpKey,
  incr,
  ttl,
  block_otpKey,
} from "../../DB/redis/redis.service.js";
import { sendEmail, generateOTP } from "../../common/utils/email/send.email.js";
import { eventEmitter } from "../../common/utils/email/email.events.js";
import { emailTemplate } from "../../common/utils/email/email.template.js";
import { emailEnum } from "../../common/utils/email/email.enum.js";

 const sendEmailOtp = async ({ email, subject }) => {
  const isBlocked = await ttl(block_otpKey({ email }));
  if (isBlocked > 0) {
    throw new Error(
      `you are blocked, please try again after ${isBlocked} seconds`,
      { cause: 400 },
    );
  }

  const otpTTl = await ttl(otpKey({ email, subject }));
  if (otpTTl > 0) {
    throw new Error(
      `your otp still valid ,please try again after ${otpTTl} seconds`,
      { cause: 400 },
    );
  }
  if ((await get(max_otpKey({ email }))) >= 3) {
    await set({ key: block_otpKey({ email }), value: 1, ttl: 60 });
    throw new Error(
      "you exceeded the maximum attempts, please try again later",
      { cause: 400 },
    );
  }

  const otp = await generateOTP();

  eventEmitter.on(emailEnum.confirmEmail, async ({ email, otp, subject }) => {
    await sendEmail({
      to: email,
      subject: "Welcome to Saraha App",
      html: emailTemplate(otp),
    });

    await set({
      key: otpKey({ email, subject }),
      value: Hash({ plainText: `${otp}` }),
      ttl: 60 * 2,
    });

    await incr(max_otpKey({ email }));
    await expire(max_otpKey({ email }), 60 * 5); // 5 دقايق
  });
};

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, gender, phone } = req.body;

  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("Email already exists", { cause: 409 });
  }

  if (password !== cPassword) {
    throw new Error("password mismatch");
  }

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({ plainText: password }),
      gender,
      phone: encrypt(phone),
    },
  });

  const otp = await generateOTP();

  eventEmitter.emit(emailEnum.confirmEmail, async () => {
    await sendEmail({
      to: email,
      subject: "Welcome to Saraha App",
      text: `Hello ${user.userName}!!! Welcome to Saraha App!!!`,
      html: emailTemplate(otp),
    });
    await set({
      key: otpKey({ email, subject: emailEnum.confirmEmail }),
      value: Hash({ plainText: `${otp}` }),
      ttl: 60 * 2,
    });

    await incr(max_otpKey({ email }));
  });
  successResponse({
    res,
    status: 201,
    message: "User created successfully",
    data: user,
  });

  // successResponse({ res,status: 201,message: "User created successfully",data: data });
};

export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;

  const otpExist = await get(otpKey({ email }));

  if (!otpExist) {
    throw new Error("OTP expired");
  }

  if (!Compare({ plainText: code, cypherText: otpExist })) {
    throw new Error("Invalid OTP", { cause: 400 });
  }

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
    update: { confirmed: true },
  });

  if (!user) {
    throw new Error("user not exist");
  }
  await deleteKey(otpKey({ email, subject: emailEnum.confirmEmail }));

  successResponse({ res, message: "Email confirmed successfully" });
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    throw new Error("user not exist or already confirmed");
  }

  await sendEmailOtp({ email, subject: emailEnum.confirmEmail });
  await incr(max_otpKey({ email }));
  await expire(max_otpKey({ email }), 60 * 5); // 5 دقايق
  successResponse({ res, message: "OTP resent successfully" });
};

export const signUpWithGemail = async (req, res, next) => {
  const { idToken } = req.body;
  console.log(idToken);

  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "871787423840-dbr7qhmkre6hkd2785djudo8tec1k89b.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  console.log(payload);
  const { email, email_verified, name, picture } = payload;

  let user = await db_service.findOne({ model: userModel, filter: { email } });

  if (!user) {
    user = await db_service.create({
      model: userModel,
      data: {
        email,
        cofirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: providerEnum.google,
      },
    });
  }

  if (user.provider == providerEnum.system) {
    throw new Error("email already exist with different provider", {
      cause: 400,
    });
  }

  const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: SECRET_KEY,
    options: {
      expiresIn: "1day",
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: { accessToken },
  });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmed: { $exists: true },
    },
  });
  if (!user) {
    throw new Error("user not exist");
  }

  if (!Compare({ plainText: password, cypherText: user.password })) {
    throw new Error("Invalid Password", { cause: 400 });
  }

  const jwtid = randomUUID();
  const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.AccessSecretKey,
    // secret_key: user.role==roleEnum.user? configService.AccessSecretKey : "userSecretKey",
    options: {
      expiresIn: 60 * 3,
      jwtid,
    },
  });

  const refreshToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.RefreshSecretKey,
    options: {
      expiresIn: 60,
      jwtid,
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: { accessToken, refreshToken },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmed: { $exists: true },
    },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  await sendEmailOtp({ email, subject: emailEnum.forgetPassword });

  successResponse({
    res,
    message: "success",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email , code ,password } = req.body;

  const otpValue = await get(otpKey({ email, subject: emailEnum.forgetPassword }));

  if (!otpValue) {
    throw new Error("OTP expired");
  }

  if (!Compare({ plainText: code, cypherText: otpValue })) {
    throw new Error("Invalid OTP", { cause: 400 });
  }

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmed: { $exists: true },
    },

    update : { password: Hash({ plainText: password }), changeCredential: new Date() }  
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  await deleteKey(otpKey({ email, subject: emailEnum.forgetPassword }));
  successResponse({
    res,
    message: "success",
  });
};

export const refresh_token = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== configService.Prefix) {
    throw new Error("invalid token prefix");
  }

  const decoded = VerifyToken({
    token,
    secret_key: configService.RefreshSecretKey,
  });

  if (!decoded || !decoded.id) {
    throw new Error("invalid token");
  }
  const user = await db_service.findOne({ model: userModel, id: decoded.id });

  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  const revokeToken = await db_service.findOne({
    model: revokeTokenModel,
    filter: { tokenId: decoded.jti },
  });
  if (revokeToken) {
    throw new Error("invalid token revoked");
  }

  const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.AccessSecretKey,
    options: {
      expiresIn: "1d",
    },
  });

  const refreshToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.RefreshSecretKey,
    options: {
      expiresIn: "1d",
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: { accessToken, refreshToken },
  });
};

export const getProfile = async (req, res, next) => {
  const key = `profile::${req.user._id}`;

  const userExist = await get(key);

  if (userExist) {
    console.log("from cach");

    return successResponse({ res, data: userExist });
  }
  console.log("out cach");

  await set({ key, value: req.user, ttl: 60 * 3 });
  successResponse({ res, data: req.user });
};

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await db_service.findById({
    model: userModel,
    id,
    select: "-password",
  });

  if (!user) {
    throw new Error("user not exist");
  }
  user.phone = user.phone ? decrypt(user.phone) : null;

  successResponse({ res, message: "done", data: user });
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender, phone } = req.body;

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    update: {
      firstName,
      lastName,
      gender,
      phone: phone ? encrypt(phone) : undefined,
    },
  });

  if (!user) {
    throw new Error("user not exist");
  }

  await deleteKey(`profile::${req.user._id}`);
  successResponse({ res, message: "done", data: user });
};

export const updatePassword = async (req, res, next) => {
  let { oldPassword, newPassword } = req.body;

  if (!Compare({ plainText: oldPassword, cypherText: req.user.password })) {
    throw new Error("Invalid Old Password", { cause: 400 });
  }

  const hash = Hash({ plainText: newPassword });
  req.user.password = hash;
  req.user.changeCredential = new Date();
  await req.user.save();

  successResponse({ res });
};

export const logout = async (req, res, next) => {
  const { flag } = req.query;

  if (flag == "all") {
    req.user.changeCredential = new Date();
    await req.user.save();
    await deleteKey(await keys(getKey({ userId: req.user._id })));
    // await db_service.deleteMany({
    //   model: revokeTokenModel,
    //   filter: { userId: req.user._id }
    // })
  } else {
    await set({
      key: revoked_key({ userId: req.user._id, jti: req.decoded.jti }),
      value: `${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });

    // await db_service.create({
    //   model: revokeTokenModel,
    //   data: {
    //     tokenId: req.decoded.jti,
    //     userId: req.user._id,
    //     expiredAt: new Date(req.decoded.exp * 1000)
    //   }
    //   ,
    //   filter: { _id: req.user._id },
    //   update: { changeCredential: new Date() }
    // });
  }

  successResponse({ res });
};
