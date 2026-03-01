import mongoose from "mongoose";
import {Db_URI} from "../../config/config.service.js";

console.log("DB URI:", process.env.DB_URI);
const checkConnectionDB = async() => {
  await mongoose.connect(Db_URI,{serverSelectionTimeoutMS:5000})
  .then(()=> {
    console.log("DB connected sucessfully ");
  })
  .catch((error) => {
        console.log("DB connected failed", error);
  })
}

export default checkConnectionDB