import MystatAPI from "mystat-api";
import { MystatUserData } from "mystat-api/dist/types";
import { ConsoleLogger } from "../helpers/logger.js";

type ChatId = number;

export class UserStore {
  users: Map<ChatId, MystatAPI>;
  logger: ConsoleLogger;

  constructor() {
    this.users = new Map<ChatId, MystatAPI>();
    this.logger = new ConsoleLogger("[STORE]");
  }

  get(chatId?: ChatId) {
    if (!chatId) {
      return undefined;
    }

    const result = this.users.get(chatId);

    if (!result) {
      this.logger.warning("Can't get user with chatId: " + chatId);
    }

    return this.users.get(chatId);
  }

  set(chatId: ChatId, userData: MystatUserData) {
    this.logger.log("Create user with chatId: " + chatId);
    this.users.set(chatId, new MystatAPI(userData));
  }

  has(chatId: ChatId) {
    return this.users.has(chatId);
  }

  remove(chatId: ChatId) {
    this.logger.log("Remove user with chatId: " + chatId);
    this.users.delete(chatId);
  }
}

const userStore = new UserStore();

export default userStore;
