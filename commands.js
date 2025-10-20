import dotenv from 'dotenv';
dotenv.config();

async function DiscordRequest(endpoint, options) {
    // Append endpoint to root API URL
    const url = 'https://discord.com/api/v10/' + endpoint;
    // Stringify payloads
    if (options.body) options.body = JSON.stringify(options.body);

    // Use fetch to make requests
    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json; charset=UTF-8',
            //'User-Agent': 
        },
        ...options
    });

    // Throw API errors
    if (!res.ok) {
        const data = await res.json();
        console.log(res.status);
        throw new Error(JSON.stringify(data));
    }
    return res;
}

async function InstallGlobalCommands(appId, commands) {
    // API endpoint to overwrite commands
    const endpoint = `applications/${appId}/commands`;

    try {
        await DiscordRequest(endpoint, { method: 'PUT', body : commands });
    } catch (err) {
        console.error(err);
    }
}

// DEFINE COMMANDS HERE

const TEST_COMMAND = {
    name: 'test',
    description: 'Test command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// THIS COMMAND DOESN'T WORK??
const NOTION_COMMAND = {
    name: 'notion',
    description: 'List this weeks to-do',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
}

const ALL_COMMANDS = [TEST_COMMAND, NOTION_COMMAND];
InstallGlobalCommands(process.env.DISCORD_APP_ID, ALL_COMMANDS);