import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { 
    InteractionResponseFlags,
    InteractionResponseType,
    InteractionType,
    MessageComponentTypes,
    verifyKeyMiddleware 
} from 'discord-interactions';
import { get_weekly_todo } from './notion_schedule_data.js'

// Create express server/app
const app = express();
const PORT = process.env.PORT || 3000;

// Check if running
app.get('/', (req, res) => {
    res.send("GET request to homepage: Bot is running!");
});

// Handle commands (Discord interactions endpoint)
app.post('/interactions', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), async function (req, res) {
    const { id, type, data } = req.body;

    // Handle verification requests (PING)
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    // Handle slash commands (user requests)
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        if (name === "test") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: "hello!"
                        }
                    ]
                },
            });
        }
        if (name === "notion") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: await get_weekly_todo()
                        }
                    ]
                },
            });
        }

        console.error("Unknown command");
        return res.status(400).json({ error: "Unknown command" });
    }

    console.error("Unknown interaction type ", type);
    return res.status(400).json({ error: "Unknown interaction type" });
});

app.listen(PORT, () => {
    console.log("Listening on port ", PORT);
});