import express, { Request, Response, Router } from "express";
import { User } from "../entities/User";
import { AppDataSource } from "../entities/dataSource";
import { hashPassword, verifyPassword } from "../util/auth";
import { returnFailure, returnSuccess } from "../util/util";

const router: Router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  const { userName, fullName, password } = req.body;

  if (!userName || !fullName || !password) {
    return returnFailure(
      res,
      400,
      "userName, fullName, and password are required"
    );
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { userName },
    });

    if (existingUser) {
      return returnFailure(res, 400, "Such a user already exists");
    }

    const newUser = new User();
    newUser.userName = userName;
    newUser.fullName = fullName;
    newUser.hashedPassword = hashPassword(password);
    newUser.registerDate = Date.now();
    newUser.lastLoginDate = null;
    newUser.isActive = true;

    userRepository.create(newUser);
    const result = await userRepository.save(newUser);

    return returnSuccess(
      res,
      {
        id: result.id,
        userName: result.userName,
        fullName: result.fullName,
        registerDate: result.registerDate,
        lastLoginDate: result.lastLoginDate,
        isActive: result.isActive,
      },
      "User registered successfully"
    );
  } catch (error) {
    return returnFailure(res, 500, "Error saving user " + error);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return returnFailure(res, 400, "userName and password are required");
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userName },
    });

    if (!user || !verifyPassword(password, user.hashedPassword)) {
      return returnFailure(res, 401, "Invalid username or password");
    }

    user.lastLoginDate = Date.now();
    await userRepository.save(user);

    return returnSuccess(
      res,
      {
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        registerDate: user.registerDate,
        lastLoginDate: user.lastLoginDate,
        isActive: user.isActive,
      },
      "Login successful"
    );
  } catch (error) {
    return returnFailure(res, 500, "Error during login " + error);
  }
});

export default router;
