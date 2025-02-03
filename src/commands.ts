import {
    SlashCommandBuilder,
    InteractionContextType,
    ChatInputCommandInteraction
} from "discord.js";
import {CommandData} from "./index";
import {
    eventChoices,
    getUserSettings,
    statusChoices,
    toEnglishList, toEventString,
    toStatusString,
    updateUserSettings
} from "./config";

export const ping: CommandData = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setContexts(InteractionContextType.BotDM),

    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.reply('Pong!')
    }
}

export const status: CommandData = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Allows you to control when you are notified about voice channel events.")
        .setContexts(InteractionContextType.BotDM)
        .addSubcommand(subcommand =>
            subcommand.setName("view")
                .setDescription("Shows your current notification settings.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("update")
                .setDescription("Allows you to change your notification settings.")
                .addStringOption(option =>
                    option.setName("status1")
                        .setDescription("A status in which you want to be notified.")
                        .setRequired(false)
                        .addChoices(statusChoices)
                )
                .addStringOption(option =>
                    option.setName("status2")
                        .setDescription("A status in which you want to be notified.")
                        .setRequired(false)
                        .addChoices(statusChoices)
                )
                .addStringOption(option =>
                    option.setName("status3")
                        .setDescription("A status in which you want to be notified.")
                        .setRequired(false)
                        .addChoices(statusChoices)
                )
                .addStringOption(option =>
                    option.setName("status4")
                        .setDescription("A status in which you want to be notified.")
                        .setRequired(false)
                        .addChoices(statusChoices)
                )
        ),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.user.id;

        if(interaction.options.getSubcommand() == "view") {
            const settings = getUserSettings(user);
            const status = settings.status.map(toStatusString);
            console.log(`Requested status settings for ${user}: ${status}`);

            if(status.length == 0) {
                await interaction.reply("You aren't receiving any notifications.");
                return;
            }
            await interaction.reply(`You are receiving notifications when your status is **${toEnglishList(status, ",", "or")}**.`);
            return;
        } else if(interaction.options.getSubcommand() == "update") {
            const status1 = interaction.options.getString("status1");
            const status2 = interaction.options.getString("status2");
            const status3 = interaction.options.getString("status3");
            const status4 = interaction.options.getString("status4");

            const status = [status1, status2, status3, status4].filter(s => s) as ("online"|"idle"|"dnd"|"offline")[];
            updateUserSettings(user, {status: status});
            console.log(`Updated status settings for ${user}: ${status}`);

            if(status.length == 0) {
                await interaction.reply("You won't receive any more notifications.");
                return;
            }
            await interaction.reply(`You will receive notifications when your status is **${toEnglishList(status.map(toStatusString), ",", "or")}**.`);
            return;
        }

        await interaction.reply('Unknown command!')
    }
}

export const event: CommandData = {
    data: new SlashCommandBuilder()
        .setName("events")
        .setDescription("Allows you to control about which voice channel events you will be notified.")
        .setContexts(InteractionContextType.BotDM)
        .addSubcommand(subcommand =>
            subcommand.setName("view")
                .setDescription("Shows your current notification settings.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("update")
                .setDescription("Allows you to change your notification settings.")
                .addStringOption(option =>
                    option.setName("event1")
                        .setDescription("A event about which you want to be notified.")
                        .setRequired(false)
                        .addChoices(eventChoices)
                )
                .addStringOption(option =>
                    option.setName("event2")
                        .setDescription("A event about which you want to be notified.")
                        .setRequired(false)
                        .addChoices(eventChoices)
                )
                .addStringOption(option =>
                    option.setName("event3")
                        .setDescription("A event about which you want to be notified.")
                        .setRequired(false)
                        .addChoices(eventChoices)
                )
                .addStringOption(option =>
                    option.setName("event4")
                        .setDescription("A event about which you want to be notified.")
                        .setRequired(false)
                        .addChoices(eventChoices)
                )
        ),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.user.id;

        if(interaction.options.getSubcommand() == "view") {
            const settings = getUserSettings(user);
            const events = settings.events.map(toEventString);
            console.log(`Requested event settings for ${user}: ${events}`);

            if(events.length == 0) {
                await interaction.reply("You aren't receiving any notifications.");
                return;
            }
            await interaction.reply(`You are receiving notifications when **${toEnglishList(events, ",", "or")}**.`);
            return;
        } else if(interaction.options.getSubcommand() == "update") {
            const event1 = interaction.options.getString("event1");
            const event2 = interaction.options.getString("event2");
            const event3 = interaction.options.getString("event3");
            const event4 = interaction.options.getString("event4");

            const events = [event1, event2, event3, event4].filter(s => s) as ("start"|"join"|"leave"|"empty")[];
            updateUserSettings(user, {events: events});
            console.log(`Updated event settings for ${user}: ${events}`);

            if(events.length == 0) {
                await interaction.reply("You won't receive any more notifications.");
                return;
            }
            await interaction.reply(`You will receive notifications when **${toEnglishList(events.map(toEventString), ",", "or")}**.`);
            return;
        }

        await interaction.reply('Unknown command!')
    }
}