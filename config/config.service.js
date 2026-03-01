import dotenv from "dotenv";
import {resolve} from "node:path";

const NODE_ENV = process.env.NODE_ENV ;

let envPaths={
  development: "config/.env.development",
  production: "config/.env.production",
}


dotenv.config({path:resolve(`config/${envPaths[NODE_ENV]}`)});

export const Port = process.env.PORT ;
export const SecretKey = process.env.SECRET_KEY ;
export const SaltRounds = process.env.SALT_ROUNDS ;
export const Db_URI = process.env.DB_URI ;