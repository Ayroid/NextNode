import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const {
  setupKinde,
  protectRoute,
  getUser,
  GrantType,
} = require("@kinde-oss/kinde-node-express");

import { Database } from "./controllers/connectDatabase";
import logger from "./logger";

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const MONGODB_URI = process.env.MONGODB_URI!;

const app = express();

const kindeConfig = {
  clientId: process.env.CLIENT_ID!,
  issuerBaseUrl: process.env.ISSUER_BASE_URL!,
  siteUrl: process.env.SITE_URL!,
  secret: process.env.SECRET!,
  redirectUrl: process.env.REDIRECT_URL!,
  scope: process.env.SCOPE!,
  grantType: GrantType.PKCE!,
  unAuthorisedUrl: process.env.UNAUTHORISED_URL!,
  postLogoutRedirectUrl: process.env.POST_LOGOUT_REDIRECT_URL!,
};

setupKinde(kindeConfig, app);

const database = new Database(MONGODB_URI);
database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static("public/images"));

app.get("/test", (req, res) => {
  res.send("Server is up and running");
});

process.on("SIGINT", () => {
  database
    .disconnect()
    .then(() => {
      logger.info("Database connection closed.");
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Error closing database connection", err);
      process.exit(1);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
