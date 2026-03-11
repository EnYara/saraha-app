
import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
import {Port} from "../config/config.service.js";
const app = express();
const port = Port ;

const bootstrap = () => {
  
  
  app.use(cors(), express.json());
  app.get("/", (req, res) => res.status(200).json("Hello On Saraha App"));

  checkConnectionDB();
  app.use("/uploads", express.static("uploads")); 
  app.use("/users", userRouter);

  app.use("{/*demo}", (req, res, next) => {
       throw new Error(`usrl ${req.originalUrl} Not found...!!`,{cause:404});
  });

  app.use((err, req, res, next) => {
res.status(err.cause || 500).json({ message: err.message ,stack: err.stack,error: err});
  });
 
  app.listen(port, () => console.log(`Example app listening on port ${port}`));
};
export default bootstrap;
