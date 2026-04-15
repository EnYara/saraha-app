import mongoose from "mongoose";
import {DB_URL} from "../../config/config.service.js";
import {DB_URL_ONLINE} from "../../config/config.service.js";


const checkConnectionDB = async() => {
  await mongoose.connect(DB_URL_ONLINE,{serverSelectionTimeoutMS:5000})
  .then(()=> {
    console.log("DB connected sucessfully ");
  })
  .catch((error) => {
        console.log("DB connected failed", error);
  })
}

export default checkConnectionDB