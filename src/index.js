import { resolve } from "node:path";

const dotenv = await import("dotenv");

dotenv.default.config({
  path: resolve(`config/.env.${process.env.NODE_ENV || "development"}`)
});

const { default: bootstrap } = await import("./app.controller.js");

bootstrap();

//dqybjvfii
//api key 929466659747168
//secret EaFI5zqbCeKBs41JSHb5HlNT2DE