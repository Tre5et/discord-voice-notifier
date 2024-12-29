import * as dotenv from "dotenv";

dotenv.config();

type Mode = "NOTIFY" | "PING";

const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    GUILD_ID,
    VOICE_CHANNEL_IDS,
    NOTIFICATION_TIMEOUT,
    MODE: Mode
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GUILD_ID || !VOICE_CHANNEL_IDS) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    GUILD_ID,
    VOICE_CHANNEL_IDS: VOICE_CHANNEL_IDS?.split(",") || [],
    NOTIFICATION_TIMEOUT: NOTIFICATION_TIMEOUT ? parseInt(NOTIFICATION_TIMEOUT) : 30,
    MODE: Mode || "NOTIFY",
};