import * as dotenv from "dotenv";

dotenv.config();

const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    VOICE_CHANNEL_IDS,
    NOTIFICATION_STATUS,
    NOTIFICATION_TIMEOUT,
    MODE
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !VOICE_CHANNEL_IDS) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    VOICE_CHANNEL_IDS: VOICE_CHANNEL_IDS?.split(",") || [],
    NOTIFICATION_STATUS: NOTIFICATION_STATUS?.split(",") || ["online", "idle"],
    NOTIFICATION_TIMEOUT: NOTIFICATION_TIMEOUT ? parseInt(NOTIFICATION_TIMEOUT) : 30,
    MODE: MODE || "NOTIFY",
};