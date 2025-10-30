import {
  Client,
  GatewayIntentBits,
  Partials,
  type TextChannel,
} from "discord.js";
import type { Discord, DiscordCompanion } from "./types/discordClient";

export class DiscordClient implements Discord {
  clients: { id: string; client: Client }[];
  constructor(companion: DiscordCompanion[]) {
    this.clients = companion.map((c) => {
      // initialize Discord client
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          //GatewayIntentBits.MessageContent, // Required to read message content
        ],
        partials: [Partials.Channel],
      });

      // log when the client is ready
      client.on("clientReady", () => {
        console.log(`Logged in: ${client.user?.tag}`);
      });

      // login to Discord
      if (!c.discordToken) throw new Error("Discord token is undefined");
      client.login(c.discordToken);

      // return the client with companion id
      return {
        id: c.agent.companion.metadata.id,
        client: client,
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
      const channel = client.client.channels.cache.get(
        channelId,
      ) as TextChannel;
      await channel.send(content);
    } catch (error) {
      console.error("Error posting message to Discord:", error);
    }
  }

  async setEventListener(
    eventId: string,
    listener: (client: Client<true>) => void,
  ) {
    this.clients.forEach(({ client }) => {
      client.on(eventId, (c) => listener(c));
    });
  }
}
