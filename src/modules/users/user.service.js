import { providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import {encrypt,decrypt,} from "../../common/utils/security/encrypt.security.js";
import { Hash, Compare } from "../../common/utils/security/hash.security.js";
import {GenerateToken,VerifyToken,} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import {  SaltRounds, SecretKey } from "../../../config/config.service.js";

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, gender, phone } = req.body;

  if (password !== cPassword) {
    throw new Error("Passwords do not match", { cause: 400 });
  }

  const emailExist = await db_service.findOne({
    model: userModel,
    filter: { email }
  });

  if (emailExist) {
    throw new Error("Email already exists", { cause: 409 });
  }

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({
        plainText: password,
        salt_rounds: SaltRounds
      }),
      gender,
      phone: encrypt(phone),
    },
  });

  successResponse({
    res,status: 201,message: "User created successfully",data: user,
  });
};

export const signUpWithGemail = async (req, res, next) => {
  const { idToken } = req.body;
  console.log(idToken);

  const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: "871787423840-dbr7qhmkre6hkd2785djudo8tec1k89b.apps.googleusercontent.com" ,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    const { email, email_verified, name, picture } = payload; 

    let user = await db_service.findOne({model: userModel,filter: { email }});

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


    if(user.provider == providerEnum.system){
        throw new Error("email already exist with different provider", { cause: 400 });
    }

      
    const accessToken = GenerateToken({
      payload: { id: user._id, email: user.email },
      secret_key: SECRET_KEY,
      options: {
        expiresIn: "1day",
      },
    });

    successResponse({res,message: "signed in successfully",data: {accessToken}});
   
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.system },
  });
  if (!user) {
    throw new Error("user not exist");
  }
  console.log("Password from body:", password);
  console.log("Password from DB:", user.password);

  if (!Compare({ 
    plainText: password, 
    cypherText: user.password 
})) {
    throw new Error("Invalid Password", { cause: 400 });
  }

  const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: SecretKey,
    options: {
      expiresIn: 120,
      audience: "http://localhost:3000",
      issuer: "http://localhost:3000",
      jwtid: uuidv4(),
      noTimestamp: true,
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: accessToken,
  });
};

export const getProfile = async (req, res, next) => {
  successResponse({ res, message: "done", data: req.user });
};

export const getUserProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.findByIdAndUpdate(
    id,
    { $inc: { profileViews: 1 } },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User profile",
    data: user
  });
};

export const getProfileViews = async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.findById(id).select("profileViews");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    profileViews: user.profileViews
  });
};