import { IUserData } from "./types.js";

export function getUserDataFromSession(ctx: any): IUserData {
    return {
        username: ctx.session.username as string,
        password: ctx.session.password as string
    }
}

export function formatMessage(...parts: string[]) {
    return [
        ...parts,
        '\n'
    ].join('\n');
}
