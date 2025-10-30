import { ayaCompanionCard, ayaHistory } from "./cards/aya";
import { kyokoCompanionCard, kyokoHistory } from "./cards/kyoko";
import { createCompanionServer } from "./utils/companion";
import { DiscordClient } from "./utils/discordClient";
import { createFirehoseServer } from "./utils/firehose";
import type { DiscordCompanion } from "./utils/types/discordClient";

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

export const discordClient = new DiscordClient(companions);

Promise.all([
  createCompanionServer(companions, 5000),
  createFirehoseServer(8080),
]);
