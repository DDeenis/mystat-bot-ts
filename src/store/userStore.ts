import { createClient, ClientData } from "mystat-api";
import { writeFile, readFile, access, constants } from "fs/promises";
import { ConsoleLogger } from "../helpers/logger.js";

type ChatId = number;
type ApiClient = Awaited<ReturnType<typeof createClient>>;
type SerializedClient = { id: number; clientData: ClientData };

export class UserStore {
  users: Map<ChatId, ApiClient>;
  logger: ConsoleLogger;
  onStoreChange?: () => void;
  onGetUser?: (user?: ApiClient) => void;

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

    this.onGetUser?.(result);

    return result;
  }

  async set(chatId: ChatId, api: ApiClient) {
    this.logger.log("Create user with chatId: " + chatId);
    this.users.set(chatId, api);
    this.onStoreChange?.();
  }

  has(chatId: ChatId) {
    return this.users.has(chatId);
  }

  remove(chatId: ChatId) {
    this.logger.log("Remove user with chatId: " + chatId);
    this.users.delete(chatId);
    this.onStoreChange?.();
  }

  serialize() {
    return JSON.stringify(
      [...this.users].map(
        (u) =>
          ({
            id: u[0],
            clientData: u[1].clientData,
          } satisfies SerializedClient)
      )
    );
  }

  deserialize(json: string) {
    const data = JSON.parse(json) as SerializedClient[];
    data.forEach(async (u) => {
      this.users.set(u.id, await createClient(u.clientData));
    });
  }
}

const userStore = new UserStore();
const fileName = "users.cache";

export function saveUsersData() {
  const json = userStore.serialize();
  return writeFile(fileName, json);
}

export function loadStoreData() {
  return access(fileName, constants.F_OK)
    .then(async () => {
      const json = await readFile(fileName);
      userStore.deserialize(json.toString());
      console.log("Users cache loaded");
    })
    .catch(() => {
      console.log("No cache, skip load");
    });
}

export default userStore;
