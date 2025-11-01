import { createTool } from "@mastra/core/tools";
import { discordClient } from "../..";
import { z } from "zod";

export const reactionTool = createTool({
  id: "emoji-reaction",
  description: "ユーザーのメッセージに対して絵文字でリアクションをします。",
  inputSchema: z.object({
    emoji: z.string().describe("リアクションに使用する絵文字"),
  }),
  execute: async ({ context: { emoji }, runtimeContext }): Promise<string> => {
    try {
      const message = discordClient.latestMessage;
      if (!message) throw new Error("No message to react to.");

      const companionId = runtimeContext.get("id");
      if (typeof companionId !== "string")
        throw new Error("Companion ID is not found in runtime context.");

      await discordClient.postReaction(companionId, message, emoji);
      return `Reacted to the message with emoji: ${emoji}`;
    } catch (error) {
      console.error("Error executing reaction tool:", error);
      return error as string;
    }
  },
});
