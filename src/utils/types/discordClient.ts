import type { Client } from "discord.js";
import type { Companion } from "./companion";

export type CompanionDiscordClient = {
  id: string;
  client: Client;
};

export type DiscordMessage = {
  channelId: string;
  messageId: string;
};

export interface Discord {
  clients: CompanionDiscordClient[];
  latestMessage?: DiscordMessage;
  postMessage(
    companionId: string,
    channelId: string,
    content: string,
  ): Promise<void>;
}

export interface DiscordCompanion extends Companion {
  discordToken: string | undefined;
}
