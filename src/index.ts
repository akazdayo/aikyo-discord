import crypto from "node:crypto";
import type { Message } from "discord.js";
import WebSocket from "ws";
import { ayaCompanionCard, ayaHistory } from "./cards/aya";
import { kyokoCompanionCard, kyokoHistory } from "./cards/kyoko";
import { createCompanionServer } from "./utils/companion";
import { DiscordClient } from "./utils/discordClient";
import { createFirehoseServer } from "./utils/firehose";
import type {
  CompanionDiscordClient,
  DiscordCompanion,
} from "./utils/types/discordClient";
import type { Request } from "./utils/types/firehose";

const FIREHOSE_PORT = 8080;
const ws = new WebSocket(`ws://localhost:${FIREHOSE_PORT}`);

export const discordChannelId =
  process.env.DISCORD_CHANNEL_ID ??
  (() => {
    throw new Error("DISCORD_CHANNEL_ID is not defined");
  })();

export const companions: DiscordCompanion[] = [
  {
    agent: kyokoCompanionCard,
    history: kyokoHistory,
    discordToken: process.env.DISCORD_API_KEY_KYOKO,
  },
  {
    agent: ayaCompanionCard,
    history: ayaHistory,
    discordToken: process.env.DISCORD_API_KEY_AYA,
  },
];

export const discordClient = new DiscordClient(companions, async (client) => {
  const channel = await client.channels.fetch(discordChannelId);
  if (!channel?.isSendable()) throw new Error("Channel is not sendable");
  console.log(`Logged in: ${client.user?.tag}`);
});

discordClient.setEventListener(
  "messageCreate",
  async (companionDiscordClient: CompanionDiscordClient, message: Message) => {
    const client = companionDiscordClient.client;
    if (message.author.bot) return; // Ignore messages from bots

    // Check if the bot is mentioned in the message
    const mentioned = message.mentions.users.has(client.user!.id!);
    if (!mentioned) return;

    if (!ws.OPEN) return;
    const uuid = crypto.randomUUID().toString();
    const request = {
      topic: "messages",
      body: {
        method: "message.send",
        jsonrpc: "2.0",
        params: {
          id: uuid,
          message: message.content,
          from: `user_${message.author.username}`,
          to: [companionDiscordClient.id],
        },
      },
    };
    console.dir(JSON.stringify(request));
    ws.send(JSON.stringify(request));
  },
);

Promise.all([
  createCompanionServer(companions, 5000),
  createFirehoseServer(FIREHOSE_PORT),
]);
