import MystatAPI from "mystat-api";
import { MystatUserData } from "mystat-api/dist/types";

type ChatId = number;

export class UserStore {
  users: Map<ChatId, MystatAPI>;

  constructor() {
    this.users = new Map<ChatId, MystatAPI>();
  }

  get(chatId: ChatId) {
    return this.users.get(chatId);
  }

  set(charId: ChatId, userData: MystatUserData) {
    this.users.set(charId, new MystatAPI(userData));
  }

  has(chatId: ChatId) {
    return this.users.has(chatId);
  }

  remove(chatId: ChatId) {
    this.users.delete(chatId);
  }
}

const userStore = new UserStore();

export default userStore;
