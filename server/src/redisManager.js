import { createClient } from "redis";

export class redisManager {
  constructor() {
    if (redisManager.instance) {
      return redisManager.instance;
    }

    redisManager.instance = this;
    this.publisher = null;
    this.subscriber = null;
  }

  async init() {
    try {
      // Connect to local Redis container on port 6379
      this.publisher = createClient({
        socket: {
          host: "localhost",
          port: 6379,
        },
      });

      this.subscriber = createClient({
        socket: {
          host: "localhost",
          port: 6379,
        },
      });

      this.publisher.on("error", (error) => {
        console.error("Redis publisher error:", error.message);
      });
      this.subscriber.on("error", (error) => {
        console.error("Redis subscriber error:", error.message);
      });

      await this.publisher.connect();
      await this.subscriber.connect();

      console.log("Redis client connected");
    } catch (error) {
      console.error("Failed to initialize Redis:", error.message);
      throw error;
    }
  }

  static async getInstance() {
    if (!redisManager.instance) {
      redisManager.instance = new redisManager();
      await redisManager.instance.init();
    }
    return redisManager.instance;
  }
}
