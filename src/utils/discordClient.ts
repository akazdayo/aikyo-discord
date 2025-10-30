import type { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import type { Discord, DiscordCompanion } from "./types/discordClient";

export class DiscordClient implements Discord {
  clients: { id: string; client: REST }[];
  constructor(companion: DiscordCompanion[]) {
    this.clients = companion.map((c) => {
      return {
        id: c.agent.companion.metadata.id,
        client: c.discordClient,
      };
    });
  }

  async postMessage(
    companionId: string,
    channelId: string,
    content: string,
  ): Promise<void> {
    try {
      const client = this.clients.find((c) => c.id === companionId);
      if (!client) {
        throw new Error(
          `Discord client for companion ${companionId} not found.`,
        );
      }
      await client.client.post(Routes.channelMessages(channelId), {
        body: {
          content: content,
        },
      });
    } catch (error) {
      console.error("Error posting message to Discord:", error);
    }
  }
}
