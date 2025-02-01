import {Client, Events} from "discord.js";
import {config} from "./config";
import {onVoiceState} from "./voice-integration";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates", "GuildMembers", "GuildPresences"],
});

client.once("ready", () => {
    console.log("Discord bot is ready!");
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
   onVoiceState(oldState, newState);
});


client.login(config.discordToken);