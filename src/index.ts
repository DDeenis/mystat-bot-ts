import Telegraf from 'telegraf';
const Scenes = Telegraf.Scenes;
const session = Telegraf.session;
import dotenv from "dotenv";
import scenes from './scenes.js';
import loginMiddleware from './middleware/login.js';
import menuMiddleware from './middleware/menu.js';
import { connectMongo } from './database/database.js';
import { setUserIfExist } from './utils.js';

dotenv.config();

const token = process.env?.BOT_TOKEN;
const connectionString = process.env?.MONGO_CONNECTION;

if (!token) {
    throw new Error('Bot token is not provided');
}

if (!connectionString) {
    throw new Error('MongoDB connection string is not provided');
}

(async () => await connectMongo(connectionString))()
const loginScene = scenes.login;

const stage = new Scenes.Stage<Telegraf.Scenes.WizardContext>([loginScene], { ttl: 360 });
const bot = new Telegraf.Telegraf<Telegraf.Scenes.WizardContext>(token);

bot.use(session());
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
    await setUserIfExist(ctx);
    await next();
});
bot.use(loginMiddleware);
bot.use(menuMiddleware);

bot.command('login', async (ctx) => await loginMiddleware.replyToContext(ctx));
bot.command('menu', async (ctx) => await menuMiddleware.replyToContext(ctx));

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
