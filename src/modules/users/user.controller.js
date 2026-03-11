import { Router } from "express";
import { authentication } from "../../common/middleware/authontication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import * as US from "./user.service.js";
import { authorization } from "../../common/middleware/authorization.js";
import { validation } from "../../common/middleware/validation.js";
import * as UV from "./user.validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
const userRouter = Router();

userRouter.post("/signup",multer_local({ custom_types: [...multer_enum.Image] }).fields([
  {name: "attachment",maxCount: 1},
  {name: "attachments",maxCount: 2 }]),US.signUp);
  userRouter.post("/signup/gmail", US.signUpWithGemail);
userRouter.post("/signin",validation(UV.signInSchema), US.signIn);
userRouter.post("/refresh-token", US.refresh_token);
userRouter.get("/profile", authentication, US.getProfile);
userRouter.get("/share-profile/:id",validation(UV.shareProfileSchema), US.shareProfile);
userRouter.patch("/update-profile",validation(UV.updateProfileSchema), authentication, US.updateProfile);
userRouter.patch("/update-password",authentication,validation(UV.updatePasswordSchema),  US.updatePassword);


// userRouter.post("/signup", multer_host(multer_enum.Image).single("attachment"),US.signUp);
// userRouter.post("/signup", multer_host([...multer_enum.Image]).single("attachment"),validation(UV.signUpSchema),US.signUp);
// userRouter.post("/signup",multer_local({custom_types:[...multer_enum.Image]}).array("attachments, 2"),US.signUp)

// userRouter.post("signup",upload.single(""),US.signUp)
// userRouter.post("/signup",validation(UV.signUpSchema),US.signUp)

// userRouter.get("/profile" ,authentication, authorization([roleEnum.user]) ,US.getProfile)
// userRouter.get("/profile-views/:id", US.getProfileViews);
 

export default userRouter;
