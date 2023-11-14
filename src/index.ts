import Telegraf from "telegraf";
import scenes from "./scenes.js";
import loginMiddleware from "./middleware/login.js";
import { menuMiddleware } from "./middleware/menu.js";
import userStore, { loadStoreData, saveUsersData } from "./store/userStore.js";
import { setupCrashHandler } from "./helpers/crashHandler.js";
import { setUserOrUpdateToken, debounce } from "./utils.js";
import { env } from "./env.js";

setupCrashHandler();

const token = env.BOT_TOKEN;

const saveDebounced = debounce(saveUsersData, 5000);

if (env.ENABLE_USERS_CACHE) {
  loadStoreData();
  userStore.onStoreChange = saveUsersData;
  userStore.onGetUser = (api?: any) => {
    if (api) {
      saveDebounced();
    }
  };
} else {
  console.log("Users cache disabled, skipping");
}

const loginScene = scenes.login;

const stage = new Telegraf.Scenes.Stage<Telegraf.Scenes.WizardContext>(
  [loginScene],
  {
    ttl: 360,
  }
);
const bot = new Telegraf.Telegraf<Telegraf.Scenes.WizardContext>(token);

bot.use(Telegraf.session());
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  await setUserOrUpdateToken(ctx);
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

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
