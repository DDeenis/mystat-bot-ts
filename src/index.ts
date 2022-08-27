import Telegraf from "telegraf";
import dotenv from "dotenv";
import scenes from "./scenes.js";
import loginMiddleware from "./middleware/login.js";
import { menuTemplate, menuMiddleware } from "./middleware/menu.js";
import { setUserIfExist } from "./utils.js";
import telegraf_inline from "telegraf-inline-menu";
import userStore from "./store/userStore.js";
import { setupCrashHandler } from "./helpers/crashHandler.js";

setupCrashHandler();
dotenv.config();
const Scenes = Telegraf.Scenes;
const session = Telegraf.session;
const replyMenuToContext = telegraf_inline.replyMenuToContext;

const token = process.env?.BOT_TOKEN;

if (!token) {
  throw new Error("Bot token is not provided");
}

const loginScene = scenes.login;

const stage = new Scenes.Stage<Telegraf.Scenes.WizardContext>([loginScene], {
  ttl: 360,
});
const bot = new Telegraf.Telegraf<Telegraf.Scenes.WizardContext>(token);

bot.use(session());
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  await setUserIfExist(ctx);
  await next();
});
bot.use(loginMiddleware);
bot.use(menuMiddleware);

bot.command("login", async (ctx) => await loginMiddleware.replyToContext(ctx));
bot.command("menu", async (ctx) => await menuMiddleware.replyToContext(ctx));
bot.start(async (ctx) => {
  const userLogged = userStore.has(ctx.chat.id);

  return await (userLogged
    ? menuMiddleware.replyToContext(ctx)
    : loginMiddleware.replyToContext(ctx));
});

bot.inlineQuery([], async (a) => {
  await Scenes.Stage.enter(a.callbackQuery ?? "");
});
bot.on("callback_query", async (ctx) => {
  await replyMenuToContext(menuTemplate, ctx, (ctx.callbackQuery as any).data);
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
