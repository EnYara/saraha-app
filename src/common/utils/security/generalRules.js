import Joi from "joi";
import { Types } from "mongoose";

export const general_rules = {
  // userName: Joi.string().trim().min(5).required(),
  email: Joi.string().email({tlds: { allow: true },maxDomainSegments: 2,maxDomainSegments: 2}),
  password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  cPassword: Joi.string().valid(Joi.ref("password")),
  // gender: Joi.string().valid(...Object.values(genderEnum)).required(),
  // phone: Joi.string().required(),
  id: Joi.string().custom((value, helpers) => {
    const isValid = Types.ObjectId.isValid(value)
    return isValid ? value : helpers.message("Invalid ID");}),

  file: Joi.object({
    fieldname:Joi.string().required(), 
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  }).required().messages({
    "any.required": "file is required",
  }),
};
