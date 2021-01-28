import { Command } from '@structures';
import { Message } from 'discord.js';
import { URL } from 'url';
import { Server } from '@models/server';

export default class extends Command {
    constructor() {
        super('from-url', {
            nsfw: true,
            isConditionalorRegexCommand: true,
            typing: false,
        });
    }

    url = false;

    async before(message: Message) {
        try {
            let server = await Server.findOne({ serverID: message.guild.id }).exec();
            if (!server) {
                server = await new Server({
                    settings: { url: false },
                }).save();
            }
            this.url = server.settings.url;
        } catch (err) {
            this.client.logger.error(err);
            return message.channel.send(this.client.embeds.internalError(err));
        }
    }

    condition(message: Message) {
        try {
            if (!message.content) return false;
            const url = new URL(
                `${message.content.startsWith('nhentai.net') ? 'https://' : ''}${message.content}`,
                'https://nhentai.net'
            );
            return (
                ([
                    '/g/',
                    '/tag/',
                    '/artist/',
                    '/character/',
                    '/group/',
                    '/parody/',
                    '/language/',
                ].some(path => url.pathname.startsWith(path)) ||
                    ['/random/', '/random', '/search/', '/info/', '/info'].some(
                        path => url.pathname === path
                    ) ||
                    ((message.content.startsWith('https://nhentai.net') ||
                        message.content.startsWith('nhentai.net')) &&
                        url.pathname === '/')) &&
                url.host === 'nhentai.net'
            );
        } catch (err) {
            return false;
        }
    }

    async exec(message: Message) {
        if (!this.url) return;
        const url = new URL(
            `${message.content.startsWith('nhentai.net') ? 'https://' : ''}${message.content}`,
            'https://nhentai.net'
        );
        const path = url.pathname.split('/');
        let pageNum = 1;
        if (url.searchParams.has('page')) pageNum = parseInt(url.searchParams.get('page'), 10);
        if (url.pathname.startsWith('/')) path.shift();
        if (!isNaN(parseInt(path[path.length - 1], 10)) && path.length > 2) {
            pageNum = parseInt(path.splice(path.length - 1)[0], 10);
        }
        let sort = 'recent';
        if (url.searchParams.has('sort')) sort = url.searchParams.get('sort');
        if (
            ['recent', 'popular', 'popular-today', 'popular-week'].includes(path[path.length - 1])
        ) {
            sort = path.splice(path.length - 1)[0];
        }
        let q = '';
        if (url.searchParams.has('q')) q = url.searchParams.get('q').split('+').join(' ');
        if (q !== '') path.push(q);
        const cmd = path[0],
            page = pageNum.toString(),
            dontLogErr = true;
        message.util.parsed.alias = cmd;
        const command = this.client.commandHandler.findCommand(cmd);
        await command.before(message);
        await command.exec(message, {
            text: cmd === 'search' ? q : path[1],
            page,
            sort,
            dontLogErr,
        });
    }
}
