import { ayaCompanionCard, ayaHistory, ayaRestClient } from "./cards/aya";
import {
  kyokoCompanionCard,
  kyokoHistory,
  kyokoRestClient,
} from "./cards/kyoko";
import { createCompanionServer } from "./utils/companion";
import { DiscordClient } from "./utils/discordClient";
import { createFirehoseServer } from "./utils/firehose";
import type { DiscordCompanion } from "./utils/types/discordClient";

export const companions: DiscordCompanion[] = [
  {
    agent: kyokoCompanionCard,
    history: kyokoHistory,
    discordClient: kyokoRestClient,
  },
  {
    agent: ayaCompanionCard,
    history: ayaHistory,
    discordClient: ayaRestClient,
  },
];

export const discordClient = new DiscordClient(companions);

Promise.all([
  createCompanionServer(companions, 5000),
  createFirehoseServer(8080),
]);
