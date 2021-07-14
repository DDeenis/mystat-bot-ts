import { Context } from "vm";
import { getUserByChatId } from "./database/database.js";
import { IUserData } from "./types.js";

export function getUserDataFromSession(ctx: Context): IUserData {
    return {
        username: ctx.session?.username as string,
        password: ctx.session?.password as string
    }
}

export function setUserDataToSession(ctx: Context, userData: IUserData): void {
    setSessionValue<string>(ctx, 'username', userData.username);
    setSessionValue<string>(ctx, 'password', userData.password);
}

export function setSessionValue<T>(ctx: Context, fieldName: string, value: T): void {
    ctx.session[fieldName] = value;
}

export function getSessionValue<T>(ctx: Context, fieldName: string): T {
    return ctx.session[fieldName] as T;
}

export function formatMessage(...parts: string[]): string {
    return [
        ...parts,
        '\n'
    ].join('\n');
}

export const cropString = (source: string, end: number): string => source.length > end ? source.substring(0, end) + '…' : source;

export async function setUserIfExist(ctx: Context): Promise<string | undefined> {
    const userData = getUserDataFromSession(ctx);
    
    if (userData.username && userData.password) {
        return;
    }

    const chatId = ctx.chat?.id;

    if (!chatId) {
        return '🚫 Что-то пошло не так.';
    }

    const user = await getUserByChatId(chatId);

    if (user) {
        setUserDataToSession(ctx, user);
    }
}
