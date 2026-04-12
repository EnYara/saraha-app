import { emailEnum } from "../../common/utils/email/email.enum.js";
import { redisClient } from "./redis.connect.js";

export const revoked_key =({userId,jti})=>{
  return `revoke_token::${userId}::${jti}`;
}
export const getKey = ({userId}) => {
  return `revoke_token:${userId}`;
}
export const otpKey = ({email, subject = emailEnum.confirmEmail}) => {
  return `otp::${email}::${subject}`;  
}
export const max_otpKey = ({email}) => {
  return `${otpKey({ email })}::max_tries`;  
}
export const block_otpKey = ({email}) => {
  return `${otpKey({ email })}::block`;  
}
export const set = async ({ key, value , ttl}) => {
   try{
     const data = typeof value == "string" ? value : JSON.stringify(value);
    return ttl? await redisClient.set(key, data, { EX: ttl }): await redisClient.set(key, data);
   } catch (error) {
     console.log("Error setting Redis key:", error);
   }
};
export const update = async ({ key, value, ttl }) => {
  try {
    if (!redisClient.exists(key)) return 0;
    return await set({ key, value, ttl });
  } catch (error) {
    console.log("Error updating Redis key:", error);
  }
};
export const get = async (key) => {
  try {
    try{
        return JSON.parse(await redisClient.get(key));
    }
    catch(error){
        return await redisClient.get(key) ;
   } 
}catch (error) {
    console.log("Error getting Redis key:", error);
  }  
}
export const ttl = async (key) => {
    try{
        return await redisClient.ttl(key);
    }catch{
        console.log("Error getting Redis key TTL:", error);
    }
}
export const exists = async ({ key }) => {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    console.log("Error checking Redis key existence:", error);
  } 
};
export const expire = async ({ key, ttl }) => {
    try {
        return await redisClient.expire(key, ttl);
    }catch (error) {
        console.log("Error setting Redis key expiration:", error);
    }       
};
export const del = async (key) => {
  try {
    if (!key.length) return 0
    return await redisClient.del(key);
  } catch (error) {
    console.log("Error deleting Redis key:", error);
  } 
};
export const keys = async (pattern) => {
  try {
    return await redisClient.keys(`*${pattern}*`);     
    } catch (error) {
    console.log("Error getting Redis keys:", error);
  }
};
export const flushAll = async () => {
  try {
    return await redisClient.flushAll();     
    } catch (error) {
    console.error("Error flushing Redis:", error);
  }
};
export const deleteKey = async (key) => { 
  try {
    return await redisClient.del(key);     
    } catch (error) {
    console.error("Error deleting Redis key:", error);
  } 
};
export const incr = async (key) => {
  try {
    return await redisClient.incr(key);     
    } catch (error) {
    console.log("fail in increment operation", error);
  }
};

