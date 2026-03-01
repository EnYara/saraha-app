import  userModel from "../../DB/models/user.model.js";
import { VerifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/db.service.js";

export const authontication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" "); //["Bearer", "tokenValue"]
  if (prefix !== "Bearer" ) {
    throw new Error("invalid token prefix");
  }



  const decoded = VerifyToken({
    token,
    secret_key: "secretKey",
  });

  if (!decoded || !decoded.id) {
    throw new Error("invalid token");
  }
  const user = await db_service.findById({model: userModel, id: decoded.id, select: "-password" });
    if (!user) {
         throw new Error("user not exist",{cause:400});
    }

  req.user = user;
  next();
};
