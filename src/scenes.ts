import Telegraf from "telegraf";
import { createUser } from "./database/database.js";
import MystatAPI from "mystat-api";
import userStore from "./store/userStore.js";
import { MystatUserData } from "mystat-api/dist/types.js";

const Scenes = Telegraf.Scenes;
const deunionize = Telegraf.deunionize;

const loginScene = new Scenes.WizardScene<Telegraf.Scenes.WizardContext>(
  "login",
  async (ctx) => {
    await ctx.reply("📲 Отправьте свой логин от mystat");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const username = deunionize(ctx.message)?.text;

    if (!username) {
      return await ctx.reply("Логин должен быть текстом");
    }

    (ctx.session as any).username = username;

    ctx.deleteMessage(ctx.message?.message_id); // Deleting login so it won't be in chat history
    await ctx.reply("🔑 Теперь оправьте свой пароль от mystat");

    return ctx.wizard.next();
  },
  async (ctx) => {
    const password = deunionize(ctx.message)?.text;

    if (!password) {
      return await ctx.reply("Пароль должен быть текстом");
    }

    (ctx.session as any).password = password;

    ctx.deleteMessage(ctx.message?.message_id); // Deleting password so it won't be in chat history
    await ctx.reply("🔍 Обработка информации");

    const userData: MystatUserData = {
      username: (ctx as any).session.username,
      password: (ctx as any).session.password,
    };
    const userApi = new MystatAPI(userData);
    const authData = await userApi.authUser();

    const isAuth = "access_token" in authData.data;
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;

    if (!chatId || !userId) {
      await ctx.reply("🚫 Что-то пошло не так.");
      return await ctx.scene.leave();
    }

    if (!isAuth) {
      await ctx.reply(
        "🔒 При входе возникла ошибка. Проверьте логин и пароль."
      );
    } else {
      await ctx.reply("🔓 Вход успешно выполнен");
      await ctx.reply("Используйте /menu чтобы перейти в меню");
      await createUser({
        username: userData.username,
        password: userData.password,
        chatId,
      });
      userStore.set(chatId, userData);
    }

    return await ctx.scene.leave();
  }
);

export default {
  login: loginScene,
};
