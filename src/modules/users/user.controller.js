import { Router } from "express";
import { authontication } from "../../common/middleware/authontication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import * as US from "./user.service.js";
import { authorization } from "../../common/middleware/authorization.js";
import { validation } from "../../common/middleware/validation.js";
import * as UV from "./user.validation.js";

const userRouter = Router();


userRouter.post("/signup",validation(UV.signUpSchema),US.signUp)
userRouter.post("/signup/gmail",US.signUpWithGemail)
userRouter.post("/signin",validation(UV.signInSchema),US.signIn)
userRouter.get("/profile" ,authontication,US.getProfile)
// userRouter.get("/profile" ,authontication, authorization([roleEnum.user]) ,US.getProfile)
userRouter.get("/profile/:id", US.getUserProfile);
userRouter.get("/profile-views/:id", US.getProfileViews);

export default userRouter