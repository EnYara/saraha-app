import { createClient } from "redis"
import { RedisURL } from "../../../config/config.service.js";

export const redisClient = createClient({
  url: RedisURL
});

export const redisConnection = async () => {
    await redisClient.connect()
    .then(()=>console.log("connected to Redis successfully")) 
    .catch((error)=>console.error("Error connecting to Redis:", error)); 
};
