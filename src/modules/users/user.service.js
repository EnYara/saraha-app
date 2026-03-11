import { providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import {encrypt,decrypt,} from "../../common/utils/security/encrypt.security.js";
import { Hash, Compare } from "../../common/utils/security/hash.security.js";
import {GenerateToken,VerifyToken,} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../common/utils/cloudinary.js";
import { config } from "dotenv";
import fs from "fs";
import * as configService from "../../../config/config.service.js";
import { model } from "mongoose";



export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, gender, phone } = req.body;

  console.log(req.file);

  // if(!req.file){
  //   throw new Error("attachment is required", { cause: 400 });
  // }

  if(password !== cPassword){
  throw new Error("password mismatch")
  }
  
  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("Email already exists", { cause: 409 });
  }

 const data = await cloudinary.uploader.upload(req.file.path , {
  folder :"Sarah_App",
  // public_id: "yara",
  // use_filename: true,
  // unique_filename: false,
  // resource_type: "video",
 }) 

 fs.unlinkSync(req.file.path)

// await cloudinary.uploader.destroy(req.file.path);
// await cloudinary.upl.delete_folder();
// await cloudinary.upl.delete_resources_by_prefix();

// let arr_paths = []
//   for (const file of req.files) {
//     arr_paths.push(file.path)
//   }

//   let arr_paths = []
//   for (const file of req.files.attachments) {
//     arr_paths.push(file.path)
//   }

  const user = await db_service.create({ 
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({ plainText: password}),
      gender,
      phone: encrypt(phone),
      profilePicture:  req.file.path ,
      // profilePicture: req.files.attachment[0].path,
      // coverPicture: arr_paths
    }, 
  });
  successResponse({ res,status: 201,message: "User created successfully",data: user });

  // successResponse({ res,status: 201,message: "User created successfully",data: data });
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

  const user = await db_service.findOne({model: userModel,filter: { email, provider: providerEnum.system }});
  if (!user) {
    throw new Error("user not exist");
  }

  if (!Compare({plainText: password,cypherText: user.password})) {
    throw new Error("Invalid Password", { cause: 400 });
  } 

  const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.AccessSecretKey,
    // secret_key: user.role==roleEnum.user? configService.AccessSecretKey : "userSecretKey",
    options: {
      expiresIn: "1d"
      
    },
  });

  const refreshToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.RefreshSecretKey,
    options: {
      expiresIn: "1d"
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: { accessToken, refreshToken }
  });
};

export const getProfile = async (req, res, next) => {
  successResponse({ res, message: "done", data: req.user });
};

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await db_service.findById(
    { model: userModel, id, select: "-password" }
  );

  if (!user) {
    throw new Error("user not exist");
  }
  user.phone = user.phone ? decrypt(user.phone) : null;

  successResponse({ res, message: "done", data: user });
};

export const updateProfile = async (req, res, next) => {
 const { firstName, lastName,gender, phone } = req.body;

//  if(phone){
//   phone = encrypt(phone);
//  }
  const user = await db_service.findOneAndUpdate({
       model: userModel,
filter: { _id: req.user._id },
      update: {firstName, lastName,gender,phone: phone ? encrypt(phone) : undefined}
});

  if (!user) {
    throw new Error("user not exist");
  }


  successResponse({ res, message: "done", data: user });

};

export const updatePassword = async (req, res, next) => {
 let { oldPassword , newPassword } = req.body;


 if(!Compare({plainText: oldPassword,cypherText: req.user.password})) {
  throw new Error("Invalid Old Password", { cause: 400 });
 }


 const hash = Hash({plainText: newPassword});
 req.user.password = hash;
 await req.user.save();


  

  successResponse({ res});

};

export const refresh_token= async (req,res,next)=>{
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
  const user = await db_service.findById({model: userModel, id: decoded.id});

    const accessToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.AccessSecretKey,
    options: {
      expiresIn: "1d"
      
    },
  });

  const refreshToken = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: configService.RefreshSecretKey,
    options: {
      expiresIn: "1d"
    },
  });

  successResponse({
    res,
    message: "signed in successfully",
    data: { accessToken, refreshToken },
  });



}

