import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import path from "node:path";
import { general_rules } from "../../common/utils/security/generalRules.js";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().trim().min(5).required(),
    email: general_rules.email.required(),
    password: general_rules.password.required(),
    cPassword: general_rules.cPassword.required(),
    gender: Joi.string()
      .valid(...Object.values(genderEnum))
      .required(),
    phone: Joi.string().required(),
  }).required(),

  // file: general_rules.file.required(),

  // file: Joi.object({
  //   fieldname:Joi.string().required(),
  //   originalname: Joi.string().required(),
  //   encoding: Joi.string().required(),
  //   mimetype: Joi.string().required(),
  //   destination: Joi.string().required(),
  //   filename: Joi.string().required(),
  //   path: Joi.string().required(),
  //   size: Joi.number().required(),
  // }).required().messages({"any.required": "file is required"}),

  //   files: Joi.array().items(general_rules.file.required()).required()

  //   files: Joi.array().items(
  //     Joi.object({
  //     fieldname:Joi.string().required(),
  //     originalname: Joi.string().required(),
  //     encoding: Joi.string().required(),
  //     mimetype: Joi.string().required(),
  //     destination: Joi.string().required(),
  //     filename: Joi.string().required(),
  //     path: Joi.string().required(),
  //     size: Joi.number().required(),
  //   }).required().messages({
  //     "any.required": "file is required",
  //   }),

  // ).required()

  files: Joi.object({
    attachment: Joi.array()
      .max(2)
      .items(general_rules.file.required())
      .required(),
    attachments: Joi.array()
      .max(2)
      .items(general_rules.file.required())
      .required(),
  }).required(),

  // files: Joi.object({
  //   attachment: Joi.array().max(2).items(Joi.object({
  //     fieldname:Joi.string().required(),
  //     originalname: Joi.string().required(),
  //     encoding: Joi.string().required(),
  //     mimetype: Joi.string().required(),
  //     destination: Joi.string().required(),
  //     filename: Joi.string().required(),
  //     path: Joi.string().required(),
  //     size: Joi.number().required(),
  //   }).required().messages({
  //     "any.required": "attachment is required",
  //   }),
  // ).required(),

  // attachments: Joi.array().max(3).items(Joi.object({
  //     fieldname:Joi.string().required(),
  //     originalname: Joi.string().required(),
  //     encoding: Joi.string().required(),
  //     mimetype: Joi.string().required(),
  //     destination: Joi.string().required(),
  //     filename: Joi.string().required(),
  //     path: Joi.string().required(),
  //     size: Joi.number().required(),
  //   }).required().messages({
  //     "any.required": "attachments is required",
  //   }),
  // ).required(),
  // }).required()
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({
        tlds: { allow: true },
        maxDomainSegments: 2,
        maxDomainSegments: 2,
      })
      .required(),
    password: Joi.string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .required(),
  }).required(),
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


// bestSkills: Joi.array().items(Joi.object({
//     name: Joi.string(),
//     level: Joi.string(),
// }).required()).length(2).required(),
// favSkill: Joi.object().valid(Joi.in("bestSkills")).required(),
