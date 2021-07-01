import mongoose from 'mongodb';

export const connectMongo = async (connectionString: string): Promise<void> => {
    // try {
    //     await mongoose.connect(
    //         connectionString,
    //         {
    //             keepAlive: true,
    //             useUnifiedTopology: true,
    //             useNewUrlParser: true
    //         },
    //         () => console.log("Mongoose is connected")
    //     )
    // } catch (error) {
    //     console.log('Failed to connect mongoose', error);
    // }

    mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(
            `Connected to Mongo!`
        );
    })
    .catch(err => {
        console.error("Error connecting to mongo", err);
    });
}
