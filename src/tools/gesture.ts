import { createCompanionAction } from "@aikyo/utils";
import z from "zod";

export const gestureAction = createCompanionAction({
  id: "gesture",
  description: "ジェスチャーを表現します。",
  inputSchema: z.object({
    name: z.enum(["Walking", "Waving"]),
  }),
  topic: "actions",
  publish: ({ input, id }) => {
    console.log("Action sending....");
    console.log(`gesture: ${input.name}`);

    return {
      jsonrpc: "2.0",
      method: "action.send",
      params: {
        name: "gesture",
        from: id,
        params: { name: input.name },
      },
    };
  },
});
