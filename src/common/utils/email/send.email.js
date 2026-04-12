import nodemailer from "nodemailer";
import { EmailUser, EmailPass } from "../../../../config/config.service.js";
import { resolve } from "node:path";

export const sendEmail = async ({ to, subject, text, html, attachments } ) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EmailUser,
            pass: EmailPass,
        },
    });

        const info = await transporter.sendMail({
            from: `"Yaryoura" <${EmailUser}>`,
            to: to || EmailUser,
            subject: subject || "Hii",
            text: text || "Hello There!!!",
            html: html || "<b>Hello There!!!</b>",
            // attachments: [
            //     {
            //         filename: "test.txt",
            //         content: "Hello World!!!"
            //     },
            //     {
            //         filename: "index.html",
            //         path: resolve("src/index.html")
            //     }
            // ]
        });
        console.log("Message sent: %s", info.messageId); 

        return info.accepted.length > 0 ? true : false ;
   
}
export const generateOTP = async() => {
    return Math.floor(Math.random()*900000+100000);
}