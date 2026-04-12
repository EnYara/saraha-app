import mongoose from "mongoose";
import {DB_URL} from "../../config/config.service.js";

console.log("DB URL:", process.env.DB_URL);
const checkConnectionDB = async() => {
  await mongoose.connect(DB_URL,{serverSelectionTimeoutMS:5000})
  .then(()=> {
    console.log("DB connected sucessfully ");
  })
  .catch((error) => {
        console.log("DB connected failed", error);
  })
}

export default checkConnectionDB