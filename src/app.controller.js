import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import { Port, WhiteList } from "../config/config.service.js";
import { redisConnection } from "./DB/redis/redis.connect.js";
import messageRouter from "./modules/messages/message.controller.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const app = express();
const port = Port;

const bootstrap = async () => {


  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "game over",
    statusCode: 401,
    handler: (req, res, next) => {
      res.status(401).json({ message: "game over" });
    },
    // legacyHeaders: false,
    // skipSuccessfulRequests: true,
    // skipFailedRequests: false,
    // keyGenerator
  });
  

  const corsOptions = {
    origin: function (origin, callback) {
      if ([...WhiteList, undefined].indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };
  

  //middlewares
  app.use(
    cors(corsOptions),
    helmet(),
    // limiter, 
    express.json());

  //home route
  app.get("/", (req, res, next) => {res.status(200).json("Hello On Saraha App");})

  //db connection
  checkConnectionDB();
  redisConnection();

  //static files
  app.use("/uploads", express.static("uploads"));

  //routes
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  //unhandeled routes
  app.use("{/*demo}", (req, res, next) => {
    throw new Error(`usrl ${req.originalUrl} Not found...!!`, { cause: 404 });
  });

  //global error handler
  app.use((err, req, res, next) => {
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack, error: err });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}`));
};
export default bootstrap;
