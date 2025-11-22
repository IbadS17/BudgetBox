import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import authRoutes from "./authRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", router);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
  console.log("ENV:", process.env.DATABASE_URL);
});
