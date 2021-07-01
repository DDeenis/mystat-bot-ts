import pkg from 'mongoose';
const { model, Schema } = pkg;

export interface IUser {
    username: string;
    password: string;
    chatId: number;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    chatId: { type: Number, required: true, unique: true }
});

export const UserModel = model<IUser>('User', userSchema);
