import dotenv from "dotenv";
dotenv.config(); // 1. Panggil dotenv.config() PALING ATAS agar process.env terbaca

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./utils/routes.js";
import path from "node:path";

const allowedOrigins = ["http://localhost:3000"];
const PORT = process.env.PORT || 8080; // Berikan fallback port jika .env tidak terbaca

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  }),
);

// Static files untuk folder uploads (posisi sejajar dengan src, jadi process.cwd() sudah benar)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());
app.use(cookieParser());

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
