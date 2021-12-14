import { Command, Listener } from '@structures';
import { Message } from 'discord.js';
import { DEPRECATION_MESSAGE } from '@utils/constants';

export default class extends Listener {
    constructor() {
        super('commandFinished', {
            emitter: 'commandHandler',
            event: 'commandFinished',
            category: 'commandHandler',
        });
    }

    exec(message: Message, command: Command) {
        return this.client.embeds
            .richDisplay({ removeOnly: true, removeRequest: false })
            .addPage(this.client.embeds.clientError(DEPRECATION_MESSAGE))
            .useCustomFooters()
            .run(
                this.client,
                message,
                message, // await message.channel.send('Loading ...')
                '',
                {
                    collectorTimeout: 300000,
                }
            );
    }
}
