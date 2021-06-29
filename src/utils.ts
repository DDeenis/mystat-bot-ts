import { IUserData } from "./types";

export function getUserDataFromSession(ctx: any): IUserData {
    return {
        username: ctx.session.username as string,
        password: ctx.session.password as string
    }
}