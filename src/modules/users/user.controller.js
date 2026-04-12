import { Router } from "express";
import { authentication } from "../../common/middleware/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import * as US from "./user.service.js";
import { authorization } from "../../common/middleware/authorization.js";
import { validation } from "../../common/middleware/validation.js";
import * as UV from "./user.validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
const userRouter = Router();


userRouter.post("/signup/gmail", US.signUpWithGemail);
userRouter.patch("/confirm-email",validation(UV.confirmEmailSchema), US.confirmEmail);
userRouter.post("/resend-otp",validation(UV.resendOtpSchema), US.resendOTP);
userRouter.post("/signin",validation(UV.signInSchema), US.signIn);
userRouter.post("/refresh-token", US.refresh_token);
userRouter.get("/profile", authentication, US.getProfile);
userRouter.patch("/forget-password", validation(UV.resendOtpSchema), US.forgetPassword);
userRouter.patch("/reset-password", validation(UV.resetPasswordSchema), US.resetPassword);
userRouter.get("/share-profile/:id",validation(UV.shareProfileSchema), US.shareProfile);
userRouter.patch("/update-profile",validation(UV.updateProfileSchema), authentication, US.updateProfile);
userRouter.patch("/update-password",authentication,validation(UV.updatePasswordSchema),  US.updatePassword);
userRouter.post("/logout", authentication, US.logout);
userRouter.post("/signup", multer_host(multer_enum.Image).single("attachment"),US.signUp);


export default userRouter;
