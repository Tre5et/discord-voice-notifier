import {
    Client,
    Collection,
    Events,
    REST,
    SlashCommandBuilder,
    Routes,
    Interaction,
    ChatInputCommandInteraction,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import {config} from "./config";
import {onVoiceState} from "./voice-integration";
import {event, status} from "./commands";

export type CommandData = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates", "GuildMembers", "GuildPresences"],
});

const commands = new Collection<string, CommandData>();
function registerCommand(command: CommandData) {
    console.log("Registering command: ", command.data.name);
    commands.set(command.data.name, command);
}


client.on(Events.ClientReady, () => {
    console.log("Registering commands...");

    registerCommand(status);
    registerCommand(event);

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(config.discordToken);

    // and deploy your commands!
    (async () => {
        try {
            console.log(`Started refreshing application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            await rest.put(
                Routes.applicationCommands(config.discordClientId),
                {body: commands.map(c => c.data.toJSON())},
            );

            console.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
   onVoiceState(oldState, newState);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if(!interaction.isChatInputCommand()) return;

    console.log("Processing command: ", interaction.commandName);

    const command = commands.get(interaction.commandName);

    if(!command) {
        console.log("Command not found: ", interaction.commandName);
        return;
    }

    await command.execute(interaction);
})


client.login(config.discordToken);