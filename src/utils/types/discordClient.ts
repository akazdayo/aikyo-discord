import type { Client } from "discord.js";
import type { Companion } from "./companion";

export interface Discord {
  clients: {
    id: string;
    client: Client;
  }[];
  postMessage(
    companionId: string,
    channelId: string,
    content: string,
  ): Promise<void>;
}

export interface DiscordCompanion extends Companion {
  discordToken: string | undefined;
}
