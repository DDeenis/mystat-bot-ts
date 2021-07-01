import pkg from 'mongoose';
const { model, Schema } = pkg;

interface User {
    username: string;
    password: string;
    chatId: number;
}

const userSchema = new Schema<User>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    chatId: { type: Number, required: true, unique: true }
});

export const UserModel = model<User>('User', userSchema);
