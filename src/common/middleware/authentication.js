import userModel from "../../DB/models/user.model.js";
import { VerifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import { Prefix } from "../../../config/config.service.js";
import * as configService from "../../../config/config.service.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import { get, revoked_key } from "../../DB/redis/redis.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== Prefix) {
    throw new Error("invalid token prefix");
  }

  const decoded = VerifyToken({
    token,
    secret_key: configService.AccessSecretKey,
  });

  if (!decoded || !decoded.id) {
    throw new Error("invalid token payload");
  }
  const user = await db_service.findById({ model: userModel, id: decoded.id });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  if (user?.changeCredential?.getTime() > decoded.iat * 1000) {
    throw new Error("invalid token");
  }
  // const revokeToken = await db_service.findOne({model: revokeTokenModel, filter:{tokenId: decoded.jti}});

  const revokeToken = await get(
    revoked_key({ userId: user._id, jti: decoded.jti }),
  );
  if (revokeToken) {
    throw new Error("invalid token revoked");
  }

  req.user = user;
  req.decoded = decoded;
  next();
};
