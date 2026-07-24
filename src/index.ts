import express, { Request, Response } from "express";
import taskRoutes from "./routes/taskItem";
import categoryRoutes from "./routes/category";
import authorRoutes from "./routes/author";
import authRoutes from "./routes/auth";
import { requireAccessToken } from "./middlewares/auth";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3002;

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TodoList Apis!");
});

app.use("/api", requireAccessToken);
app.use("/api/", taskRoutes);
app.use("/api/", categoryRoutes);
app.use("/api/", authorRoutes);
app.use("/api/", authRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
