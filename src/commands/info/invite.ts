import { Command } from '@structures';
import { Message } from 'discord.js';
import { PERMISSIONS } from '@utils/constants';

export default class extends Command {
    constructor() {
        super('invite', {
            aliases: ['invite', 'join'],
            description: {
                content: 'Shows invite link.',
                examples: ['\nInvite me to your server!'],
            },
        });
    }

    async exec(message: Message) {
        const embed = this.client.embeds.default().setDescription(
            `[Here](https://discord.com/api/oauth2/authorize?client_id=663743798722953258&permissions=103116007424&scope=bot%20applications.commands) is my invite link!`
        );
        return message.channel.send({ embed });
    }
}
