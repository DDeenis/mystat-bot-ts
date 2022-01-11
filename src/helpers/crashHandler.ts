import { writeFileSync } from "fs";

export const setupCrashHandler = (logName = "err.txt") => {
  process.on("uncaughtException", (signal) => {
    writeFileSync(logName, signal.message, { encoding: "utf8" });
    process.exit(0);
  });

  process.on("unhandledRejection", (signal) => {
    writeFileSync(logName, JSON.stringify(signal), { encoding: "utf8" });
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log(`Process ${process.pid} received a SIGTERM signal`);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log(`Process ${process.pid} has been interrupted`);
    process.exit(0);
  });
};
