import mongoose from 'mongoose';
import { IUser, UserModel } from './entity/User.js';

export const connectMongo = async (connectionString: string): Promise<void> => {
    try {
        await mongoose.connect(
            connectionString,
            {
                useCreateIndex: true,
                keepAlive: true,
                useUnifiedTopology: true,
                useNewUrlParser: true
            },
            () => console.log("Mongoose is connected")
        )
    } catch (error) {
        console.log('Failed to connect mongoose', error);
    }

    
}

export const createUser = async (user: IUser): Promise<void> => {
    try {
        const newUser = new UserModel(user);
        await newUser.save();
    } catch (error) {
        console.log(error);
    } finally {
        // ???
        // mongoose.connection.close();
    }
}

export const getUserByChatId = async (chatId: number): Promise<IUser | undefined> => {
    return (await UserModel.findOne({ chatId }))?.toObject();
}

export const isUserExist = async (chatId: number): Promise<boolean> => {
    try {
        const result = await getUserByChatId(chatId);

        return result !== undefined;
    } catch (error) {
        console.log(error);
    }

    return false;
}
