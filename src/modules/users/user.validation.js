import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import path from "node:path";
import { general_rules } from "../../common/utils/security/generalRules.js";

export const signInSchema = {
  body: Joi.object({
    email: general_rules.email.required(),
    password: general_rules.password.required(),
  }).required(),
};

export const signUpSchema = {
  body: signInSchema.body.append({
    userName: Joi.string().trim().min(5).required(),
    email: general_rules.email.required(),
    cPassword: general_rules.cPassword.required(),
    gender: Joi.string().valid(...Object.values(genderEnum)).required(),
    phone: Joi.string().required(),
  }).required(),

  
  
};

export const resetPasswordSchema = {
  body: signInSchema.body.append({
    code: Joi.string().length(6).required(),
    cPassword: general_rules.cPassword.required(),
  }).required(),
};


export const resendOtpSchema = {
  body: Joi.object({
    email: general_rules.email.required(),
  }).required(),
};

export const confirmEmailSchema = {
  body: resendOtpSchema.body.append({
    code: Joi.string().length(6).required(),
  })
};

export const shareProfileSchema = {
  params: Joi.object({
    id: general_rules.id.required(),
  }).required(),
};

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(3),
    lastName: Joi.string().trim().min(5),
    gender: Joi.string().valid(...Object.values(genderEnum)).required(),
    phone: Joi.string(),
  }).required(),
};

export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: general_rules.password.required(),
    cPassword: Joi.string().valid(Joi.ref("newPassword")),
    newPassword: general_rules.password.required(),
  }).required(),
};
