import mongoose from "mongoose";

export interface IUser {
  username: string;
  password: string;
  chatId: number;
  userId: number;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  chatId: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, unique: true },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
