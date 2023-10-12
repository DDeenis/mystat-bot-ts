import { appendFileSync } from "fs";

export const setupCrashHandler = (logName = "err.txt") => {
  process.on("uncaughtException", (signal) => {
    appendFileSync(logName, signal.message + "\n", { encoding: "utf8" });
    console.error(signal);
    process.exit(0);
  });

  process.on("unhandledRejection", (signal) => {
    appendFileSync(logName, JSON.stringify(signal) + "\n", {
      encoding: "utf8",
    });
    console.error(signal);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.error(`Process ${process.pid} received a SIGTERM signal`);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.error(`Process ${process.pid} has been interrupted`);
    process.exit(0);
  });
};
