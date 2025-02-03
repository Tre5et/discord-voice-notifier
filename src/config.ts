import * as dotenv from "dotenv";
import * as fs from "node:fs";

dotenv.config();

const {
    SETTINGS_FILE,
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    VOICE_CHANNEL_IDS,
    NOTIFICATION_STATUS,
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
    mode: "notify" | "ping"
}

export const config: Config = {
    settingsFile: SETTINGS_FILE || "settings.json",
    discordToken: DISCORD_TOKEN || "",
    discordClientId: DISCORD_CLIENT_ID || "",
    voiceChannelIds: VOICE_CHANNEL_IDS?.split(",") || [],
    notificationStatus: (NOTIFICATION_STATUS?.split(",") || ["online", "idle"]) as ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    notificationAction: (NOTIFICATION_ACTION?.split(",") || ["start"]) as ("start"|"join"|"leave"|"empty")[],
    mode: (MODE || "notify") as "notify" | "ping",
};

export type UserSettings = {
    status: ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    events: ("start"|"join"|"leave"|"empty")[]
}

export type PartialUserSettings = {
    status?: ("online"|"idle"|"dnd"|"invisible"|"offline")[],
    events?: ("start"|"join"|"leave"|"empty")[]
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
        events: raw.events || config.notificationAction
    };
}

export function updateUserSettings(userId: string, updated: PartialUserSettings) {
    const current = settings.userSettings[userId] || {};

    settings.userSettings[userId] = {
        status: updated.status || current.status,
        events: updated.events || current.events
    };
    saveSettings();
}

export function toStatusString(statusValue: string): string {
    switch(statusValue) {
        case "online": return "Online";
        case "idle": return "Idle";
        case "dnd": return "Do Not Disturb";
        case "invisible": return "Invisible";
        case "offline": return "Offline";
        default: return "unknown";
    }
}

export function toEventString(actionValue: string): string {
    switch(actionValue) {
        case "start": return "Someone joins a Voice Channel alone";
        case "join": return "Someone joins a Voice Channel with other people";
        case "leave": return "Someone leaves a Voice Channel with other people";
        case "empty": return "Someone leaves a Voice Channel without other people";
        default: return "unknown";
    }
}

export const statusChoices = [
    {name: toStatusString("online"), value: "online"},
    {name: toStatusString("idle"), value: "idle"},
    {name: toStatusString("dnd"), value: "dnd"},
    {name: toStatusString("offline"), value: "offline"},
];

export const eventChoices = [
    {name: toEventString("start"), value: "start"},
    {name: toEventString("join"), value: "join"},
    {name: toEventString("leave"), value: "leave"},
    {name: toEventString("empty"), value: "empty"},
];

export function toEnglishList(names: string[], separator: string = ",", finalization: string = "and "): string {
    if (names.length == 0) {
        return "";
    }

    if (names.length == 1) {
        return names[0];
    }

    if (names.length == 2) {
        return `${names[0]} ${finalization} ${names[1]}`;
    }

    const last = names.pop();
    return `${names.join(`${separator} `)} ${finalization} ${last}`;
}