export class UserSession {
    constructor() {
        this.userData = { username: '', password: '' };
    }
    get UserData() {
        return this.userData;
    }
    set username(value) {
        this.userData.username = value;
    }
    set password(value) {
        this.userData.password = value;
    }
    get username() {
        return this.userData.username;
    }
    get password() {
        return this.userData.password;
    }
}
