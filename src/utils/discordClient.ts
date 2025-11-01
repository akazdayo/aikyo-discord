import { Client, GatewayIntentBits, Partials } from "discord.js";
import type {
  CompanionDiscordClient,
  Discord,
  DiscordCompanion,
  DiscordMessage,
} from "./types/discordClient";

export class DiscordClient implements Discord {
  clients: CompanionDiscordClient[];
  latestMessage?: DiscordMessage;
  constructor(
    companion: DiscordCompanion[],
    readyListener?: (c: Client<true>) => void,
  ) {
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
      client.on(
        "clientReady",
        readyListener ??
          (() => {
            console.log(`Logged in: ${client.user?.tag}`);
          }),
      );

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

  getClientById(companionId: string): CompanionDiscordClient {
    const client = this.clients.find((c) => c.id === companionId);
    if (!client) {
      throw new Error(`Discord client for companion ${companionId} not found.`);
    }
    return client;
  }

  async getChannelById(channelId: string, client: CompanionDiscordClient) {
    try {
      const channel = await client.client.channels.fetch(channelId);

      if (!channel?.isSendable()) throw new Error("Channel is not sendable");
      return channel;
    } catch (error) {
      console.error("Error fetching channel from Discord:", error);
      throw error;
    }
  }

  async postMessage(
    companionId: string,
    channelId: string,
    content: string,
  ): Promise<void> {
    try {
      const client = this.getClientById(companionId);

      const channel = await this.getChannelById(channelId, client);
      await channel.send(content);
    } catch (error) {
      console.error("Error posting message to Discord:", error);
    }
  }

  async postReaction(
    companionId: string,
    discordMessage: DiscordMessage | undefined,
    emoji: string,
  ): Promise<void> {
    try {
      if (!discordMessage) {
        throw new Error("No message to react to.");
      }
      // Get a client
      const client = this.getClientById(companionId);

      // Fetch the channel and message
      const channel = await this.getChannelById(
        discordMessage.channelId,
        client,
      );
      const message = await channel.messages.fetch(discordMessage.messageId);

      // React to the message
      await message.react(emoji);
    } catch (error) {
      console.error("Error posting reaction to Discord:", error);
    }
  }

  async setEventListener(
    eventId: string,
    listener: (client: CompanionDiscordClient, ...args: any[]) => void,
  ) {
    this.clients.forEach((companionClient) => {
      const client = companionClient.client;
      client.on(eventId, (...args) => listener(companionClient, ...args));
    });
  }

  async setSingleEventListener(
    companionId: string,
    eventId: string,
    listener: (client: CompanionDiscordClient[], ...args: any[]) => void,
  ) {
    const client = this.clients.find((c) => c.id === companionId);
    client?.client.on(eventId, (...args) => listener(this.clients, ...args));
  }
}
