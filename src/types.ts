interface IUserData {
    username: string,
    password: string
}

export class UserSession {
    private userData: IUserData;

    constructor() {
        this.userData = { username: '', password: '' };
    }

    get UserData(): IUserData {
        return this.userData;
    }

    set username(value: string) {
        this.userData.username = value;
    }

    set password(value: string) {
        this.userData.password = value;
    }

    get username(): string {
        return this.userData.username;
    }

    get password(): string {
        return this.userData.password;
    }
}
