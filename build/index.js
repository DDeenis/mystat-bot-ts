var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { Scenes, session, Telegraf } from 'telegraf';
import { MenuTemplate, MenuMiddleware } from "telegraf-inline-menu";
import { UserSession } from './types.js';
import { config } from "dotenv";
import scenes from './scenes.js';
config();
const token = (_a = process.env) === null || _a === void 0 ? void 0 : _a.BOT_TOKEN;
if (!token) {
    throw new Error('Bot token is not provided');
}
const bot = new Telegraf(token);
const userSession = new UserSession();
const loginScene = scenes.login(userSession);
const stage = new Scenes.Stage([loginScene], { ttl: 360 });
const loginMenuTemplate = new MenuTemplate((ctx) => `Здравствуйте, ${ctx.from.first_name}`);
loginMenuTemplate.interact('Войти в mystat', 'login-btn', {
    do: (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.scene.enter('login');
        return false;
    }),
});
const loginMiddleware = new MenuMiddleware('login/', loginMenuTemplate);
bot.use(session());
bot.use(stage.middleware());
bot.use(loginMiddleware);
bot.command('login', (ctx) => loginMiddleware.replyToContext(ctx));
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
