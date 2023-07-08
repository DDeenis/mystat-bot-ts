import ApiClient from "mystat-api";
import { createClient } from "mystat-api";
import { ConsoleLogger } from "../helpers/logger.js";

type ChatId = number;
type ApiClient = Awaited<ReturnType<typeof createClient>>;

export class UserStore {
  users: Map<ChatId, ApiClient>;
  logger: ConsoleLogger;

  constructor() {
    this.users = new Map<ChatId, ApiClient>();
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

  async set(chatId: ChatId, api: ApiClient) {
    this.logger.log("Create user with chatId: " + chatId);
    this.users.set(chatId, api);
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
