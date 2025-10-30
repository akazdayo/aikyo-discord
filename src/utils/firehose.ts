import { Firehose } from "@aikyo/firehose";
import { discordClient } from "..";
import { speakDataSchema } from "./types/firehose";

export const discordChannelId =
  process.env.DISCORD_CHANNEL_ID ??
  (() => {
    throw new Error("DISCORD_CHANNEL_ID is not defined");
  })();

export async function createFirehoseServer(port: number = 8080) {
  // Create a new Firehose server
  const firehose = new Firehose(port);
  await firehose.start();

  await firehose.subscribe("queries", (data) => {
    // Validate incoming data
    const speakData = speakDataSchema.parse(data);
    firehose.broadcastToClients(speakData);
  });

  await firehose.subscribe("messages", (data) => {
    firehose.broadcastToClients(data);

    // Post message to Discord
    discordClient.postMessage(
      data.params.from,
      discordChannelId,
      data.params.message,
    );
  });

  await firehose.subscribe("states", (data) => {
    firehose.broadcastToClients(data);
  });

  return firehose;
}
