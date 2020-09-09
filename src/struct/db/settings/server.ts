import { Message } from 'discord.js';
import { Server } from '../models/server';
import { History } from '../models/tag';

export async function history(message: Message, serverHistory: History) {
    let server = await Server.findOne({ serverID: message.guild.id }).exec();
    if (!server) {
        await new Server({
            serverID: message.guild.id,
            recent: [serverHistory],
        }).save();
    } else {
        server.recent.push(serverHistory);
        await server.save();
    }
}

export async function prefix(
    message: Message,
    action: 'add' | 'remove' | 'clear' | 'list',
    prefix?: string
) {
    let server = await Server.findOne({ serverID: message.guild.id }).exec();
    const _ = { id: prefix, author: message.author.id, date: Date.now() };
    if (!server) {
        if (action === 'add') {
            await new Server({
                serverID: message.guild.id,
                settings: {
                    prefixes: [_],
                },
            }).save();
        }
        return [_];
    } else {
        let prefixes = server.settings.prefixes;
        const hasPrefix = prefixes.some(pfx => pfx.id === prefix);
        if (!hasPrefix && action === 'add') prefixes.push(_);
        else if (hasPrefix && action === 'remove')
            prefixes = prefixes.filter(pfx => pfx.id !== prefix);
        server.settings.prefixes = action === 'clear' ? [] : prefixes;
        await server.save();
        return prefixes;
    }
}
