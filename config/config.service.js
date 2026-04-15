import dotenv from "dotenv";
import {resolve} from "node:path";


const NODE_ENV = process.env.NODE_ENV ;

let envPaths={
  development: ".env.development",
  production: ".env.production",
}


dotenv.config({ path:resolve(`config/${envPaths[NODE_ENV]}`)});

export const Port = process.env.PORT ;
export const SaltRounds = process.env.SALT_ROUNDS ;
export const DB_URL = process.env.DB_URL ;
export const DB_URL_ONLINE = process.env.DB_URL_ONLINE ;
export const AccessSecretKey = process.env.ACCESS_SECRET_KEY ;
export const RefreshSecretKey = process.env.REFRESH_SECRET_KEY ;
export const Prefix = process.env.PREFIX ;
export const RedisURL = process.env.REDIS_URL ;
export const EmailUser = process.env.EMAIL_USER ;
export const EmailPass = process.env.EMAIL_PASS ;
export const WhiteList = process.env.WHITE_LIST.split(",") || [] ;