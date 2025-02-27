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
    this.publisher = createClient({
      username: "default",
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: "redis-13493.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
        port: 13493,
      },
    });

    this.subscriber = createClient({
      username: "default",
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: 13493,
      },
    });

    await this.publisher.connect();
    await this.subscriber.connect();
    this.publisher.on("error", () => {
      console.error("Redis publisher error:", error);
    });
    this.subscriber.on("error", () => {
      console.error("Redis subscriber error:", error);
    });

    console.log("Redis client connected");
  }

  static async getInstance() {
    if (!redisManager.instance) {
      redisManager.instance = new redisManager();
      await redisManager.instance.init();
    }
    return redisManager.instance;
  }
}
