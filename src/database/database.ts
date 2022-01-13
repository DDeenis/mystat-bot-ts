import mongoose from "mongoose";
import { IUser, UserModel } from "./entity/User.js";
import dotenv from "dotenv";

dotenv.config();

export const connectMongo = async (connectionString: string): Promise<void> => {
  try {
    await mongoose.connect(
      connectionString,
      {
        useCreateIndex: true,
        keepAlive: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      },
      (err) => console.log(err ? err : "Mongoose is connected")
    );
  } catch (error) {
    console.log("Failed to connect mongoose", error);
  }
};

export const createUser = async (user: IUser): Promise<void> => {
  ensureConnection();

  try {
    await UserModel.findOneAndUpdate(
      { chatId: user.chatId },
      user,
      { upsert: true },
      (err) => {
        if (err) {
          console.log("Error while creating/updating user: " + err);
        } else {
          console.log("User created/updated successfully");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (chatId: number): Promise<void> => {
  ensureConnection();

  try {
    await UserModel.deleteOne({ chatId });
  } catch (error) {
    console.log(error);
  }
};

export const getUserByChatId = async (
  chatId: number
): Promise<IUser | undefined> => {
  ensureConnection();

  return (await UserModel.findOne({ chatId }))?.toObject();
};

export const isUserExist = async (chatId: number): Promise<boolean> => {
  try {
    const result = await getUserByChatId(chatId);

    return result !== undefined;
  } catch (error) {
    console.log(error);
  }

  return false;
};

const ensureConnection = async () => {
  const token = process.env?.BOT_TOKEN;

  if (!token) {
    throw new Error("Bot token is not provided");
  }
  console.log(mongoose.connections.length);

  if (mongoose.connections.length < 1) {
    await connectMongo(token);
  }
};
