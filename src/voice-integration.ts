import {Guild, GuildMember, VoiceBasedChannel, VoiceState} from "discord.js";
import {config, getUserSettings, toEnglishList} from "./config";

export function onVoiceState(old: VoiceState, current: VoiceState) {
    if(current.channel?.id != old.channel?.id) {
        if(config.voiceChannelIds.includes(old.channel?.id || "")) {
            processLeave(old);
        }
        if(config.voiceChannelIds.includes(current.channel?.id || "")) {
            processJoin(current);
        }
    }
}

function processJoin(join: VoiceState) {
    const checked = checkPrerequisites(join);
    if(!checked) return;
    const [member, channel, guild] = checked;
    console.log(`Processing voice channel join ${member.displayName} -> ${channel.name}...`);

    const members = guild.members.cache;

    const notifiedMembers = members
        .filter(member => !member.user.bot)
        .map(member =>  {return {member: member, settings: getUserSettings(member.id)}})
        .filter(member => member.settings.status.includes(member.member.presence?.status || "offline"))
        .filter(member => member.settings.action.includes(channel.members.size > 1 ? "join" : "start"))
        //.filter(member => member.member.voice.channel?.id != channel.id)
        .map(member => member.member);

    if(channel.members.size > 1) {
        const existingMembers = channel.members.filter(m => m.id != member.id).map(m => m.displayName);
        notify(notifiedMembers, channel, `**${member.displayName}** joined **${toEnglishList(existingMembers)}** in <#${channel.id}>! Consider joining too.`);
    } else {
        notify(notifiedMembers, channel, `**${member.displayName}** joined <#${channel.id}>! Consider joining them.`);
    }
}

function processLeave(leave: VoiceState) {
    const checked = checkPrerequisites(leave);
    if(!checked) return;
    const [member, channel, guild] = checked;
    console.log(`Processing voice channel leave ${member.displayName} -> ${channel.name}...`);

    const members = guild.members.cache;

    const notifiedMembers = members
        .filter(member => !member.user.bot)
        .map(member =>  {return {member: member, settings: getUserSettings(member.id)}})
        .filter(member => member.settings.status.includes(member.member.presence?.status || "offline"))
        .filter(member => member.settings.action.includes(channel.members.size > 0 ? "leave" : "empty"))
        //.filter(member => member.member.voice.channel?.id != channel.id)
        .map(member => member.member);

    if(channel.members.size > 0) {
        const remainingMembers = channel.members.map(m => m.displayName);
        notify(notifiedMembers, channel, `**${member.displayName}** left **${toEnglishList(remainingMembers)}** in <#${channel.id}>! Consider joining the others.`);
    } else {
        notify(notifiedMembers, channel, `**${member.displayName}** left <#${channel.id}>!`);
    }
}

function checkPrerequisites(action: VoiceState): [GuildMember, VoiceBasedChannel, Guild] | null {
    const channel = action.channel;
    const member = action.member;
    if(!channel || !member) {
        console.log("Invalid channel or member reference");
        return null;
    }
    const guild = channel.guild

    return [member, channel, guild];
}

function notify(members: GuildMember[], channel: VoiceBasedChannel, text: string) {
    console.log(`Notifying ${members.map(m => m.displayName).join(", ")}: ${text}`);
    if(config.mode == "notify") {
        members.forEach(m => m.send(text));
    } else {
        const pings = members
            .map(member => `<@${member.id}>`)
            .join(" ");
        channel.send(`${pings} ${text}`)
    }
}

