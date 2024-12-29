import {Guild, VoiceBasedChannel, VoiceState} from "discord.js";
import {config} from "./config";

export function onVoiceState(old: VoiceState, current: VoiceState) {
    if(
        current.channel
        && current.channel.id != old.channel?.id
        && config.VOICE_CHANNEL_IDS.includes(current.channel.id)
        && current.channel.members.size == 1
    ) {
        console.log(`User ${current.member?.displayName} joined ${current.channel.name}: Scheduling notification in ${config.NOTIFICATION_TIMEOUT} seconds`);
        setTimeout(
            () => processChannelLater(current.channel, current.guild),
            config.NOTIFICATION_TIMEOUT * 1000
        );
    }
}

async function processChannelLater(channel: VoiceBasedChannel | null, guild: Guild) {
    if(!channel) {
        console.log("Invalid channel reference");
        return;
    }
    console.log(`Processing voice channel ${channel.name}...`);
    const members = guild.members.cache;

    const voiceChannelMembers = members
        .filter(member => member.voice.channel?.id == channel.id);

    const availableMembers = members
        .filter(member => !member.user.bot)
        .filter(member => config.NOTIFICATION_STATUS.includes(member.presence?.status || "offline"))
        .filter(member => member.voice.channel?.id != channel.id);

    if(voiceChannelMembers.size == 0) {
        console.log(`No one in ${channel.name}`);
        return;
    }

    if(availableMembers.size == 0) {
        console.log(`${voiceChannelMembers.map(m => m.displayName).join(", ")} in ${channel.name}: No one to ping`);
        return;
    }

    const names = toEnglishList(voiceChannelMembers.map(m => m.displayName));

    if(config.MODE == "NOTIFY") {
        console.log(`${voiceChannelMembers.map(m => m.displayName).join(", ")} in ${channel.name}: Notifying ${availableMembers.map(m => m.displayName).join(", ")}`);
        availableMembers.forEach(member => {
            member.send(`**${names}** ${voiceChannelMembers.size > 1 ? "are" : "is"} in <#${channel.id}>! Consider joining them.`);
        });
    } else {
        console.log(`${voiceChannelMembers.map(m => m.displayName).join(", ")} in ${channel.name}: Pinging ${availableMembers.map(m => m.displayName).join(", ")}`);

        const pings = availableMembers
            .map(member => `<@${member.id}>`)
            .join(" ");

        console.log(`${voiceChannelMembers.map(m => m.displayName).join(", ")} alone in ${channel.name}: Pinging ${availableMembers.map(m => m.displayName).join(", ")}`);
        await channel.send(`${pings} **${names}** ${voiceChannelMembers.size > 1 ? "are" : "is"} in voice channel **${channel.name}**! Consider joining them.`);
    }
}

function toEnglishList(names: string[]): string {
    if(names.length == 0) {
        return "";
    }

    if(names.length == 1) {
        return names[0];
    }

    if(names.length == 2) {
        return `${names[0]} and ${names[1]}`;
    }

    const last = names.pop();
    return `${names.join(", ")}, and ${last}`;
}