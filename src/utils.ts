import { Scenes } from "telegraf";
import { getUserByChatId } from "./database/database.js";
import userStore from "./store/userStore.js";

export function setSessionValue<T>(
  ctx: any,
  fieldName: string,
  value: T
): void {
  ctx.session[fieldName] = value;
}

export function getSessionValue<T>(ctx: any, fieldName: string): T {
  return ctx.session[fieldName] as T;
}

export function formatMessage(...parts: string[]): string {
  return [...parts, "\n"].join("\n");
}

export const cropString = (source: string, end: number): string =>
  source.length > end ? source.substring(0, end) + "…" : source;

export async function setUserIfExist(
  ctx: Scenes.WizardContext
): Promise<string | undefined> {
  const chatId = ctx.chat?.id;
  const userData = userStore.get(chatId)?.userData;

  if (userData?.username && userData?.password) {
    return;
  }

  if (!chatId) {
    return "🚫 Что-то пошло не так.";
  }

  const user = await getUserByChatId(chatId);

  if (user) {
    userStore.set(chatId, user);
  }
}
