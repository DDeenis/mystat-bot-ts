import mongoose from 'mongoose';
import {IUser, UserModel} from './entity/User.js';

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
      (err) => console.log(err ? err : 'Mongoose is connected'),
    );
  } catch (error) {
    console.log('Failed to connect mongoose', error);
  }
};

export const createUser = async (user: IUser): Promise<void> => {
  try {
    await UserModel.findOneAndUpdate({chatId: user.chatId}, user, {upsert: true}, (err) => {
      if (err) {
        console.log('Error while creating/updating user: ' + err);
      } else {
        console.log('User created/updated successfully');
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (chatId: number): Promise<void> => {
  try {
    await UserModel.deleteOne({chatId});
  } catch (error) {
    console.log(error);
  }
};

export const getUserByChatId = async (chatId: number): Promise<IUser | undefined> => {
  return (await UserModel.findOne({chatId}))?.toObject();
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
