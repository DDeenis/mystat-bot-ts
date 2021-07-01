import { Context } from "vm";
import { IUserData } from "./types.js";

export function getUserDataFromSession(ctx: Context): IUserData {
    return {
        username: ctx.session.username as string,
        password: ctx.session.password as string
    }
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
