import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().email({tlds: {allow: false,deny:["org"]}, minDomainSegments : 2, maxDomainSegments:2  }).required(),
    password: Joi.string().min(6).required().messages({
          "any.required" : "body must not be empty",
          "string.min" : "password must be at least 6 characters"
    }),
    cPassword: Joi.string().required(),
    gender: Joi.string().valid(...Object.values(genderEnum)).required(),
    phone: Joi.string().required(),
  }).required()
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().required(), 
    password: Joi.string().required(),
  }).required(),

};  
 
  // bestSkills: Joi.array().items(Joi.object({
  //     name: Joi.string(),  
  //     level: Joi.string(),
  // }).required()).length(2).required(),
  // favSkill: Joi.object().valid(Joi.in("bestSkills")).required(),