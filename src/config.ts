import * as dotenv from "dotenv";
import * as fs from "node:fs";

dotenv.config();

const {
    SETTINGS_FILE,
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    VOICE_CHANNEL_IDS,
    NOTIFICATION_STATUS,
    NOTIFICATION_TIMEOUT,
    NOTIFICATION_ACTION,
    MODE
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !VOICE_CHANNEL_IDS) {
    throw new Error("Missing environment variables");
}

type Config = {
    settingsFile: string,
    discordToken: string,
    discordClientId: string,
    voiceChannelIds: string[],
    notificationStatus: ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    notificationAction: ("start"|"join"|"leave"|"empty")[],
    notificationTimeout: number,
    mode: "notify" | "ping"
}

export const config: Config = {
    settingsFile: SETTINGS_FILE || "settings.json",
    discordToken: DISCORD_TOKEN || "",
    discordClientId: DISCORD_CLIENT_ID || "",
    voiceChannelIds: VOICE_CHANNEL_IDS?.split(",") || [],
    notificationStatus: (NOTIFICATION_STATUS?.split(",") || ["online", "idle"]) as ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    notificationAction: (NOTIFICATION_ACTION?.split(",") || ["start"]) as ("start"|"join"|"leave"|"empty")[],
    notificationTimeout: NOTIFICATION_TIMEOUT ? parseInt(NOTIFICATION_TIMEOUT) : 30,
    mode: (MODE || "notify") as "notify" | "ping",
};

export type UserSettings = {
    status: ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    timeout: number,
    action: ("start"|"join"|"leave"|"empty")[]
}

export type PartialUserSettings = {
    status?: ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    timeout?: number,
    action?: ("start"|"join"|"leave"|"empty")[]
}

type Settings = {
    userSettings: Record<string, PartialUserSettings>
}

export const settings: Settings = loadSettings();

function loadSettings(): Settings {
    const content = fs.readFileSync(config.settingsFile, "utf-8")
    return JSON.parse(content) as Settings;
}

function saveSettings() {
    fs.writeFileSync(config.settingsFile, JSON.stringify(settings));
}

export function getUserSettings(userId: string): UserSettings {
    const raw = settings.userSettings[userId] || {};
    return {
        status: raw.status || config.notificationStatus,
        timeout: raw.timeout || config.notificationTimeout,
        action: raw.action || config.notificationAction
    };
}

export function updateUserSettings(userId: string, updated: PartialUserSettings) {
    const current = settings.userSettings[userId] || {};

    settings.userSettings[userId] = {
        status: updated.status || current.status,
        timeout: updated.timeout || current.timeout,
        action: updated.action || current.action
    };
    saveSettings();
}