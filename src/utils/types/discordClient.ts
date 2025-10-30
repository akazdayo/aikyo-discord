import type { REST } from "@discordjs/rest";
import type { Companion } from "./companion";

export interface Discord {
  clients: {
    id: string;
    client: REST;
  }[];
  postMessage(
    companionId: string,
    channelId: string,
    content: string,
  ): Promise<void>;
}

export interface DiscordCompanion extends Companion {
  discordClient: REST;
}
