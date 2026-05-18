
import "reflect-metadata";
import { DataSource } from "typeorm";
import { TaskItem } from "./TaskItem";
import { CategoryItem } from "./Category";
import { Author } from "./Author";
import * as dotenv from "dotenv";

dotenv.config();

const useSSL =
  process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [TaskItem, CategoryItem, Author],
  synchronize: true,
  logging: false,
  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) =>
    console.log("Error in data source initialization, ", error)
  );
