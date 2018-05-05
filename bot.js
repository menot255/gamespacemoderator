/*
*
* WARNING!
* Использование этого кода в полной мере или частично позволяется только на некоммерческих основаниях после разрешения автора.
* Для связи с автором можете использовать данные реквизиты:
* Discord: zziger#8040
* Telegramm: @zziger
* VK: https://vk.com/zziger (автор тут бывает редко)
*
* Бот написан специально для сервера GameSpace в Discord.
* Ссылка-приглашение на сервер: https://discord.io/gspace
*
* Copyright 2018 © GameSpace. Все права защищены.
* Нарушение авторских прав преследуется законом.
*
* CC-BY-NC-SA
* http://creativecommons.org/licenses/by-nc-sa/4.0/
*
* */
const Discord = require('discord.js');
const util = require("util");
const https = require("https");
const request = require("request");
const querystring = require('querystring');
const colorParse = require('parse-color');
const getImageColors = require('get-image-colors');
const client = new Discord.Client({ autofetch: [
        'MESSAGE_CREATE',
        'MESSAGE_UPDATE',
        'MESSAGE_REACTION_ADD',
        'MESSAGE_REACTION_REMOVE',
    ] });
const rule = {game_admin: "417312252463677451", game_owner: "417267817763831808", content_maker: "417267817763831808", game_sponsor: "417396657668358165", own: "419562566512017415"};
const creators = ['421030089732653057'];
const emojis = {up:'418748638081318912', stop:'418748635820326912', shuffle:'418748638173462528', repeat1:'418748637531865089', repeat:'418748637649174535', play:'418748635765800961', pause:'418748635329855489', ok:'418748637502504972', forward:'418748554899881994', down:'418748613733122058', back:'418748554014752770', ABCD:'418748554518069249', abcd:'418748553985261568', abc:'418748552802598927', protiv:'419121914959626240', neznayu:'419121999277719562', za:'419122029854457866', obnimayu:'421647583551684609', money:'422055316792803349', error: '424467513578094592', facepalm: '429213277688561664'};
const commandCooldown = new Set();
const botFullRights = ['418096126957453337', '421558850681044993'];
const colors = ['e74c3c', 'e67e22', 'f1c40f', '2ecc71', '1abc9c', '3498db', '9b59b6'];
let colors_e = false;
let splooter = false;

function color () {
    if (colors_e)
    colors.forEach(function (item, number) {
        if (colors_e)
        setTimeout(function () {if (colors_e) {client.guilds.get('417266233562365952').roles.get('428894052960960513').setColor(item).catch();if(number === colors.length-1) setTimeout(function () {color()}, 2000)}}, number*2000);
    });
}


/** @namespace process.env.PREFIX */
/** @namespace process.env.BOT_TOKEN */
/** @namespace process.env.SITE_DOMAIN */
/** @namespace process.env.SECRET_KEY */
/** @namespace process.env.WEBHOOK_ID */
/** @namespace process.env.WEBHOOK_TOKEN */





function declOfNum(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function setBigTimeout(func, timeout) {
    if (timeout > 0x7FFFFFFF)
        setTimeout(function() {setBigTimeout(func, timeout-0x7FFFFFFF);}, 0x7FFFFFFF);
    else
        setTimeout(func, timeout);
}

function  getStringCapsPercent(string) {
    let str = string.trim().replace(/<:(.*?):(.*?)>/g, '').replace(/<a:(.*?):(.*?)>/g, '');
    let length = str.replace(/[^a-zа-яA-ZА-ЯІЇЁёії]/g, '').length;
    if (length === 0) return;
    let caps = str.replace(/[^A-ZА-ЯІЇЁ]/g, '').length;
    return Math.round(caps/length*100);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function multipleReact(message, arr) {
    if (arr !== []) {
        await message.react(arr.shift()).catch(console.error).then(function () {multipleReact(message,arr).catch(console.error);});
    }
}

function embed_error(text) {
    let error_emoji = client.emojis.get(emojis.error);
    return new Discord.RichEmbed()
        .setTitle('Ошибка')
        .setColor('#C34E4E')
        .setFooter('Game🌀Space')
        .setDescription(`${error_emoji} ${text}`);
}

async function unmute(member, mute_id, time, reason = 'Автоматический анмут') {
    setBigTimeout( function () {
        request(`http://${process.env.SITE_DOMAIN}/unmute.php?mute=${mute_id}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${client.user.id}`, async function (error, response, body) {
            try { let data = JSON.parse(body);
            if (!data['error']) {
                member.removeRole('427148609776254986').catch(console.error);
                member.user.send('Вы были размучены.');
            }} catch (Exception) {}
        });
    }, time+1000);
}

function add_command(aliases, onlyInBotChat, message, command, args, access_type, access_params, command_function) {

    if (onlyInBotChat) {
        if (!botFullRights.includes(message.channel.id)) return;
    }

    if (typeof aliases !== 'object')
        return console.error('Error: command aliases aren\'n array');

    let embed;

    let error = false;
    if (!creators.includes(message.author.id))
    if (access_type === 'rules') {
        let rights_arr = [];
        let err = false;
        access_params.forEach(function (item) {
            if (!message.member.hasPermission(item, false, true, true)) {
                err = true;
                rights_arr.push(item);
            }
        });
        if (err === true) {
            let a = '';
            let required = 'которые требуются';
            let rigths = rights_arr.join('`, `');
            if (access_params.length === 1) {
                a = 'а';
                required = 'которое требуется';
            }
            embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но у Вас нет прав${a} \`${rigths}\`, ${required} для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
            error = true;
        }
    } else if (access_type === 'roles') {
        if (!message.member.roles.some(r=>access_params.includes(r.id))) {
            let a = 'ни одной из ролей';
            let roles = '';
            let required = 'которые требуются';
            access_params.forEach(function (item) {
                roles = roles + message.guild.roles.get(item);
            });
            if (access_params.length === 1) {
                a = 'роли';
                required = 'которая требуется';
            }
            embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но у Вас нет ${a} ${roles}, ${required} для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
            error = true;
        }
    } else if (access_type === 'creat') {
        embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но Вы должны быть создателем бота для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
        error = true;
    }


    if (!aliases.includes(command)) return;
    if (error) return message.channel.send({embed});

    if (!message.member.roles.some(r=>[rule.game_owner, rule.game_owner, rule.own].includes(r.id)))
    if (!commandCooldown.has(message.author.id)) {
        commandCooldown.add(message.author.id);
        setTimeout(() => {
            commandCooldown.delete(message.author.id);
        }, 10000);
    } else {
        return message.channel.send('Хэй-хэй, '+message.author+', остынь! Тебе нужно немного подождать, чтоб еще раз обратится ко мне :D');
    }
    command_function();
}

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


client.on('ready', () => {
	console.log('Bot loaded');
	client.user.setPresence({ game: { name: `за GameSpace'ом`, type: 3 } }).catch();
    request(`http://${process.env.SITE_DOMAIN}/get_mute.php?&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${client.user.id}`, async function (error, response, body) {
        let data = JSON.parse(body);
        data.forEach(function (item) {
            unmute(client.guilds.get('417266233562365952').members.get(item[0]['discord_id']), item[0]['id'], item[1]*1000).catch(console.err);
            if (item[1] !== 0)
            console.log(`//--- Возобновлен мут ${client.guilds.get('417266233562365952').members.get(item[0]['discord_id']).displayName} на ${item[1]}с ---//`);
            else
                console.log(`//--- ${client.guilds.get('417266233562365952').members.get(item[0]['discord_id']).displayName} был размучен ---//`)
        });
    });
});


client.on("messageUpdate", async (old_message, message) => {
	 //Игнорирование некоторых типов каналов
    if (['dm', 'group', 'category', 'voice'].includes(message.channel.type)) return;
	
    if (getStringCapsPercent(message.content) > 80 && message.content.replace(/[^a-zа-яA-ZА-ЯІЇЁёії]/g, '').length > 5 && message.content !== '' && !message.author.bot) {
        let reason = 'Капс в чате. Сообщение:\n'+message.content;
        request(`http://${process.env.SITE_DOMAIN}/warn.php?id=${message.author.id}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${client.user.id}`, function (error, response, body) {
            try {
            let data = JSON.parse(body);
            let footer = 'Game🌀Space #'+data.id;
            if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
            let embed = new Discord.RichEmbed()
                .setTitle('Предупреждение')
                // .setDescription(`**Пользователь:** ${user.user}\n**Модератор:** ${message.author}\n**Причина:**\n\n${reason}`)
                .addField('Пользователь', `${message.author} (\`${message.author.tag}\`)`, true)
                .addField('Модератор', `${client.user} (\`${client.user.tag}\`)`, true)
                .setFooter(footer)
                .setColor('F1C40F');
            if (reason !== null && typeof reason !== undefined && reason !== '') embed.addField('Причина', `${reason}`);
            message.channel.send(`${message.author} получил варн по причине \`капс в чате\`. #${data.id}`);
            message.guild.channels.get('426756919777165312').send({embed});
            } catch (Exception) {message.channel.send({embed: embed_error('Ошибка авто-варна.')})}
        });
    }
});

client.on('guildMemberUpdate', function (old_member, new_member) {
    if (splooter)
    if (new_member.user.id === '329240046337261569') {
        new_member.setNickname('splooter').catch();
    }
});

client.on("message", async message => {

//Системные команды
    if (message.channel.id === '421260737281785856') {
        if(!message.author.bot) return;
        if(message.author.discriminator !== '0000') return;
        if(message.content.indexOf(process.env.PREFIX) !== 0) return;
        const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

    if (command === 'mute') {

        message.delete();
        let new_args = args;
        let user = message.guild.members.get(new_args.shift());
        let time_formatted = new_args.shift();
        let reason = new_args.join(' ').trim();

        function getSeconds(str) {
            let seconds = 0;
            let years = str.match(/(\d+)\s*y/);
            let months = str.match(/(\d+)\s*M/);
            let weeks = str.match(/(\d+)\s*w/);
            let days = str.match(/(\d+)\s*d/);
            let hours = str.match(/(\d+)\s*h/);
            let minutes = str.match(/(\d+)\s*m/);
            let secs = str.match(/(\d+)\s*s/);
            if (years) { seconds += parseInt(years[1])*31556926; }
            if (months) { seconds += parseInt(months[1])*2592000; }
            if (weeks) { seconds += parseInt(weeks[1])*604800; }
            if (days) { seconds += parseInt(days[1])*86400; }
            if (hours) { seconds += parseInt(hours[1])*3600; }
            if (minutes) { seconds += parseInt(minutes[1])*60; }
            if (secs) { seconds += parseInt(secs[1]); }
            return seconds;
        }
        function getTimeInWords(str) {
            let text = '';
            let years = str.match(/(\d+)\s*y/);
            let months = str.match(/(\d+)\s*M/);
            let weeks = str.match(/(\d+)\s*w/);
            let days = str.match(/(\d+)\s*d/);
            let hours = str.match(/(\d+)\s*h/);
            let minutes = str.match(/(\d+)\s*m/);
            let secs = str.match(/(\d+)\s*s/);
            if (years) { text += years[1]+' '+declOfNum(parseInt(years[1]), ['год ', 'года ', 'лет ']) }
            if (months) { text += months[1]+' '+declOfNum(parseInt(months[1]), ['месяц ', 'месяца ', 'месяцев ']) }
            if (weeks) { text += weeks[1]+' '+declOfNum(parseInt(weeks[1]), ['неделю ', 'недели ', 'недель ']) }
            if (days) { text += days[1]+' '+declOfNum(parseInt(days[1]), ['день ', 'дня ', 'дней']) }
            if (hours) { text += hours[1]+' '+declOfNum(parseInt(hours[1]), ['час ', 'часа ', 'часов ']) }
            if (minutes) { text += minutes[1]+' '+declOfNum(parseInt(minutes[1]), ['минуту ', 'минуты ', 'минут ']) }
            if (secs) { text += secs[1]+' '+declOfNum(parseInt(secs[1]), ['секунду ', 'секунды ', 'секунд ']) }
            return text;
        }
        let time = getSeconds(time_formatted);
        if (time === 0) return;

        if (!user) return;
        // if (user.user.id === message.author.id) return message.channel.send({embed: embed_error(`${user.user}, извините, но вы не можете замутить самого себя.`)});
        if (user.user.bot) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете наказать бота`)});
        let reasontext = '';
        if (reason !== null && typeof reason !== undefined && reason !== '') reasontext = ` с причиной \`${reason}\``;
        if (reason === null || typeof reason === undefined || reason === '') reason = 'Причина не указана.';
        message.delete();
        request(`http://${process.env.SITE_DOMAIN}/mute.php?id=${user.user.id}&time=${time*1000}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}`, function (error, response, body) {
            try {
                let data = JSON.parse(body);
                let footer = 'Game🌀Space #'+data.id;
                if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
                let embed = new Discord.RichEmbed()
                    .setTitle('Мут')
                    .addField('Пользователь', `${user.user} (\`${user.user.tag}\`)`, true)
                    .addField('Модератор', `${client.user} (\`${client.user.tag}\`)`, true)
                    .addField('Длительность', getTimeInWords(time_formatted), true)
                    .setFooter(footer)
                    .setColor('C34E4E');
                let dm_embed = new Discord.RichEmbed()
                    .setTitle('Мут')
                    .setDescription('Вы были замучены на сервере GameSpace')
                    .addField('Модератор', `${client.user} (\`${client.user.tag}\`)`, true)
                    .addField('Длительность', getTimeInWords(time_formatted), true)
                    .setFooter(footer)
                    .setColor('C34E4E');
                if (reason !== null && typeof reason !== undefined && reason !== '') {embed.addField('Причина', `${reason}`);dm_embed.addField('Причина', `${reason}`);}
                message.guild.channels.get('426756919777165312').send({embed});
                user.send({embed});
                user.addRole('427148609776254986').catch(console.error);
                console.log(time);
                unmute(user, data.id, time*1000).catch(console.error);
            } catch (Exception) {}
        });

    }


    return;
}
 //Игнорирование некоторых типов каналов
    if (['dm', 'group', 'category', 'voice'].includes(message.channel.type)) return;
	
    if (getStringCapsPercent(message.content) > 80 && message.content.replace(/[^a-zа-яA-ZА-ЯІЇЁёії]/g, '').length > 5 && message.content !== '' && !message.author.bot) {
        let reason = 'Капс в чате. Сообщение:\n'+message.content;
        request(`http://${process.env.SITE_DOMAIN}/warn.php?id=${message.author.id}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${client.user.id}`, function (error, response, body) {
            try {
                let data = JSON.parse(body);
                let footer = 'Game🌀Space #' + data.id;
                if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
                let embed = new Discord.RichEmbed()
                    .setTitle('Предупреждение')
                    // .setDescription(`**Пользователь:** ${user.user}\n**Модератор:** ${message.author}\n**Причина:**\n\n${reason}`)
                    .addField('Пользователь', `${message.author} (\`${message.author.tag}\`)`, true)
                    .addField('Модератор', `${client.user} (\`${client.user.tag}\`)`, true)
                    .setFooter(footer)
                    .setColor('F1C40F');
                if (reason !== null && typeof reason !== undefined && reason !== '') embed.addField('Причина', `${reason}`);
                message.channel.send(`${message.author} получил варн по причине \`капс в чате\`. #${data.id}`);
                message.guild.channels.get('426756919777165312').send({embed});
            } catch (Exception) {
                message.channel.send('Ошибка авто-варна.')
            }
        });
    }

    if (['dm', 'group', 'category', 'voice'].includes(message.channel.type)) return;
    if (!['417266233562365952', '416813030232424462'].includes(message.guild.id)) {
        message.guild.leave().catch();
        return;
    }


	if(message.author.bot) return;
    if(message.content.indexOf(process.env.PREFIX) !== 0) return;

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  	const command = args.shift().toLowerCase();

    add_command(['warn', 'варн', 'punish', 'наказать', 'предупреждение', 'наказание', 'предупредить', 'отпороть'], false, message, command, args, 'rules', ['MANAGE_MESSAGES'], function () {
        message.delete();
        let new_args = args;
        new_args.shift();
        let reason = new_args.join(' ').trim();

        let user = message.mentions.members.first();
        if (!user) return message.channel.send({embed: embed_error(`${message.author}, извините, но пользователь, которого вы упомянули, не является участником сервера или не существует`)});
        if (user.user.id === message.author.id) return message.channel.send({embed: embed_error(`${user.user}, извините, но вы не можете наказать самого себя.`)});
        if (user.user.bot) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете наказать бота`)});
        let reasontext = '';
        if (reason !== null && typeof reason !== undefined && reason !== '') reasontext = ` с причиной \`${reason}\``;
        if (reason === null || typeof reason === undefined || reason === '') reason = 'Причина не указана.';
        let accepting = message.channel.send(`Вы уверены, что хотите выписать предупреждение пользователю \`${user.user.tag}\`${reasontext}?\n\n**Напишите \`да\`, чтобы подтведить.**`);
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
        collector.on('collect', msg => {
            if (['да', 'ага', 'кнш', 'конечно', 'конешно', 'давай', 'йес', 'yes', 'y', 'aga', 'go', 'da', 'го'].includes(msg.content.toLowerCase())) {
                message.channel.startTyping();
                message.delete();
                request(`http://${process.env.SITE_DOMAIN}/warn.php?id=${user.user.id}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}`, function (error, response, body) {
                    try {
                        let data = JSON.parse(body);
                        let footer = 'Game🌀Space #' + data.id;
                        if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
                        let embed = new Discord.RichEmbed()
                            .setTitle('Предупреждение')
                            // .setDescription(`**Пользователь:** ${user.user}\n**Модератор:** ${message.author}\n**Причина:**\n\n${reason}`)
                            .addField('Пользователь', `${user.user} (\`${user.user.tag}\`)`, true)
                            .addField('Модератор', `${message.author} (\`${message.author.tag}\`)`, true)
                            .setFooter(footer)
                            .setColor('F1C40F');
                        if (reason !== null && typeof reason !== undefined && reason !== '') embed.addField('Причина', `${reason}`);
                        message.channel.send(`${user.user}`, {embed}).then(() => {
                            message.channel.stopTyping(true)
                        });
                        message.guild.channels.get('426756919777165312').send({embed});
                    } catch (Exception) {message.channel.send({embed: embed_error('Ошибка варна.')})}
                });
            }
            console.log(collector);
            collector.stop();
        });
    });

    add_command(['fwarn', 'фварн', 'fpunish', 'фнаказать', 'фпредупреждение', 'фнаказание', 'фпредупредить', 'фотпороть'], false, message, command, args, 'rules', ['MANAGE_MESSAGES'], function () {
        message.delete();
        let new_args = args;
        let number = new_args.shift();
        new_args.shift();
        let reason = new_args.join(' ').trim();

        let user = message.mentions.members.first();
        if (!user) return message.channel.send({embed: embed_error(`${message.author}, извините, но пользователь, которого вы упомянули, не является участником сервера или не существует`)});
        if (user.user.id === message.author.id) return message.channel.send({embed: embed_error(`${user.user}, извините, но вы не можете наказать самого себя.`)});
        if (user.user.bot) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете наказать бота`)});
        let reasontext = '';
        if (reason !== null && typeof reason !== undefined && reason !== '') reasontext = ` с причиной \`${reason}\``;
        if (reason === null || typeof reason === undefined || reason === '') reason = 'Причина не указана.';
        let accepting = message.channel.send(`Вы уверены, что хотите выписать предупреждение пользователю \`${user.user.tag}\`${reasontext}?\n\n**Напишите \`да\`, чтобы подтведить.**`);
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
        collector.on('collect', msg => {
            if (['да', 'ага', 'кнш', 'конечно', 'конешно', 'давай', 'йес', 'yes', 'y', 'aga', 'go', 'da', 'го'].includes(msg.content.toLowerCase())) {
                message.delete();
                accepting.delete();
                try {
                    let footer = 'Game🌀Space #' + number;
                    if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
                    let embed = new Discord.RichEmbed()
                        .setTitle('Предупреждение')
                        // .setDescription(`**Пользователь:** ${user.user}\n**Модератор:** ${message.author}\n**Причина:**\n\n${reason}`)
                        .addField('Пользователь', `${user.user} (\`${user.user.tag}\`)`, true)
                        .addField('Модератор', `${message.author} (\`${message.author.tag}\`)`, true)
                        .setFooter(footer)
                        .setColor('F1C40F');
                    if (reason !== null && typeof reason !== undefined && reason !== '') embed.addField('Причина', `${reason}`);
                    message.channel.send(`${user.user}`, {embed}).then(() => {
                        message.channel.stopTyping(true)
                    });
                    message.guild.channels.get('426756919777165312').send({embed});
                } catch (Exception) {message.channel.send({embed: embed_error('Ошибка варна.')})}
            }
            console.log(collector);
            collector.stop();
        });
    });

    add_command(['mod_eval'], false, message, command, args, 'creat', null, function () {
        try {
            let code = args.join(" ");
            eval(code);
        } catch (err) {}
    }, 'hid');


    add_command(['нарушения', 'наказания', 'варны', 'предупреждения', 'муты', 'punishments', 'warns', 'mutes'], false, message, command, args, 'e', null, function () {
        message.delete();
        let user = message.mentions.members.first();
        let requested = '';
        let user_molodec = `${message.author}, можете гордиться, вы - молодец!`;
        if (user) {
            if (!message.member.hasPermission('MANAGE_MESSAGES', false, true, true))
                return message.channel.send({embed: embed_error('Вы не имеете права `MANAGE_MESSAGES`, которое требуется для просмотра чужих нарушений\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>')});
            requested = `, запрошенные пользователем ${message.author} (\`${message.author.tag}\`)`;
            user_molodec = `${user} - молодец!`;
        } else {
            user = message.member;
        }
        let page = args[0];
        if (!isNumeric(page)) page = 1;
        request(`http://${process.env.SITE_DOMAIN}/punishments.php?&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${user.user.id}`, function (error, response, body) {
            try {
                let data1 = JSON.parse(body);
                let data = [''].concat(data1);
                let punishments = '';
                console.log(data1);
                let limit = 5;
                let all_pages = Math.ceil(data.length/limit);
                console.log(all_pages);
                let current_page = parseInt(page);
                if (current_page > all_pages || current_page < 1 || !isNumeric(page))
                    current_page = 1;
                console.log(current_page);
                let all_data = data.slice(1+((current_page-1)*limit), (limit+1)+((current_page-1)*limit));
                console.log(all_data);
                let user_text = '';
                if (user !== message.member) user_text = ` ${user}`;
                let next_page = ``;
                if (current_page < all_pages) next_page = `Для просмотра следующей страницы введите:\n${process.env.PREFIX}${command} ${current_page+1}${user_text}`;
                let footer = 'Стр. '+current_page+'/'+all_pages+'; '+data.filter(pun => pun['type'] === 'warn' && pun['deleted'] === false).length+' '+declOfNum(data.filter(pun => pun['type'] === 'warn' && pun['deleted'] === false).length, ['варн', 'варна', 'варнов'])+'; '+data.filter(pun1=>pun1['type'] === 'mute' && pun1['deleted'] === false).length+' '+declOfNum(data.filter(pun1=>pun1['type'] === 'mute' && pun1['deleted'] === false).length, ['мут', 'мута', 'мутов']);
                all_data.forEach(function (item, num) {
                    if (item['deleted'] === '1') return;
                    if (item === [] || item === '') return;
                    console.log('cho?');
                    let type;
                    switch (item['type']) {
                        case 'warn':
                            type = 'Варн\\🚫';
                            break;
                        case 'mute':
                            type = 'Мут\\😠';
                            break;
                        case 'kick':
                            type = 'Кик\\👿';
                            break;
                        default:
                            type = 'Варн';
                    }
                    punishments = punishments + '***Нарушение*** *(ID: `' + item['id'] + '`)*\n';
                    punishments = punishments + '**Тип: __' + type + '__**\n';
                    punishments = punishments + '**От:** ' + message.guild.members.get(item['user_from']).toString() + '(`' + message.guild.members.get(item['user_from']).user.tag + '`)\n';
                    if (item['type'] === 'mute') {

                        punishments = punishments + '**Длительность:** ' + item['time'] + 'мс\n';
                    }
                    if (item['type'] === 'mute') {
                        let zak;
                        if (item['unmuted']) zak = 'Нет';
                        else zak = 'Да';
                        punishments = punishments + '**Действует?** ' + zak + '\n';
                        if (item['unmuted']) {
                            punishments = punishments + '**Размут от:** ' + message.guild.members.get(item['unmute_who_id']).toString() + '\n';
                            punishments = punishments + '**Причина размута: ' + item['unmute_reason'] + '**\n';
                        }
                    }
                    punishments = punishments + '|\\⚠ = **' + item['reason'].replace(/` /g, '\'').replace(/\n/g, ' ') + '**\n\n';
                });
                if (punishments === '' && current_page === 1) punishments = `Нарушений нет. ${user_molodec} :thumbsup::skin-tone-2:\n\n`;
                let embed = new Discord.RichEmbed()
                    .setTitle('Список нарушений')
                    .setDescription(`Данные о пользователе ${user.user} (\`${user.user.tag}\`)${requested}\n\n${punishments}${next_page}`)
                    .setFooter(footer)
                    .setColor('F1C40F');
                message.channel.send(`${user.user}`, {embed}).then(() => {message.channel.stopTyping(true)});
            } catch (Exception) {message.channel.send({embed: embed_error('Ошибка варна.')})}
        });
    });

    add_command(['un-warn', 'un_warn', 'unwarn', 'ан-варн', 'ан_варн', 'анварн', 'удалить_наказание', 'удалить-наказание'], false, message, command, args, 'rules', ['MANAGE_MESSAGES'], function () {
        message.delete();
        let new_args = args;
        let warn = new_args.shift();
        let reason = new_args.join(' ').trim();

        let reasontext = '';
        if (reason !== null && typeof reason !== undefined && reason !== '') reasontext = ` с причиной \`${reason}\``;
        if (reason === null || typeof reason === undefined || reason === '') reason = 'Причина не указана.';

        message.channel.startTyping();
        request(`http://${process.env.SITE_DOMAIN}/get_warn.php?warn=${warn}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}`, function (error, response, body) {
            try {
            message.channel.stopTyping(true);
            console.log(body);
            if (body.trim() === '[]') return message.channel.send({embed: embed_error(`${message.author}, извините, но данного варна не существует`)});
            let data2 = JSON.parse(body);
            if (data2['type'] !== 'warn') return message.channel.send({embed: embed_error(`${message.author}, извините, но данного варна не существует`)});
            if (data2['discord_id'] === message.author.id) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете удалить наказание, которое было адресовано вам`)});
            let const_embed = new Discord.RichEmbed()
                .setTitle('Предупреждение')
                // .setDescription(`**Пользователь:** ${user.user}\n**Модератор:** ${message.author}\n**Причина:**\n\n${reason}`)
                .addField('Пользователь', `${message.guild.members.get(data2['discord_id']).user} (\`${message.guild.members.get(data2['discord_id']).user.tag}\`)`, true)
                .addField('Модератор', `${message.guild.members.get(data2['user_from']).user} (\`${message.guild.members.get(data2['user_from']).user.tag}\`)`, true)
                .addField('Причина', `${data2['reason']}`)
                .setFooter('Game🌀Space #'+data2.id)
                .setColor('F1C40F');
            let accepting = message.channel.send(`Вы уверены, что хотите удалить этот варн? Напишите \`да\`, чтобы продолжить.`, {embed: const_embed});
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 60000});
            collector.on('collect', msg => {
                if (['да', 'ага', 'кнш', 'конечно', 'конешно', 'давай', 'йес', 'yes', 'y', 'aga', 'go', 'da', 'го'].includes(msg.content.toLowerCase())) {
                    message.channel.startTyping();
                    request(`http://${process.env.SITE_DOMAIN}/remove_warn.php?warn=${warn}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}`, function (error, response, body) {
                        try {
                        message.channel.stopTyping(true);
                        let footer = 'Game🌀Space #' + data2['id'];
                        let embed = new Discord.RichEmbed()
                            .setTitle('Удалено предупреждение')
                            .addField('Пользователь', `${message.guild.members.get(data2['discord_id']).user} (\`${message.guild.members.get(data2['discord_id']).user.tag}\`)`, true)
                            .addField('Модератор', `${message.author} (\`${message.author.tag}\`)`, true)
                            .addField('Причина', `${data2['reason']}`)
                            .addField('Кто удалил?', `${message.author}`, true)
                            .addField('Причина удаления', `${reason}`)
                            .setFooter(footer)
                            .setColor('F1C40F');
                        message.guild.channels.get('426756919777165312').send({embed});
                        message.channel.send({embed});
                        } catch (Exception) {message.channel.send({embed: embed_error('Ошибка ан-варна.')})}
                    });
                }
                console.log(collector);
                collector.stop();
            });
            } catch (Exception) {message.channel.send({embed: embed_error('Ошибка ан-варна.')})}
        });
    });
    add_command(['mute', 'мут', 'заклеить_рот', 'заткнуть', 'заткнись', 'закройся'], false, message, command, args, 'rules', ['MANAGE_MESSAGES'], function () {
        message.delete();
        let new_args = args;
        new_args.shift();
        let time_formatted = new_args.shift();
        let reason = new_args.join(' ').trim();

        function getSeconds(str) {
            let seconds = 0;
            let years = str.match(/(\d+)\s*y/);
            let months = str.match(/(\d+)\s*M/);
            let weeks = str.match(/(\d+)\s*w/);
            let days = str.match(/(\d+)\s*d/);
            let hours = str.match(/(\d+)\s*h/);
            let minutes = str.match(/(\d+)\s*m/);
            let secs = str.match(/(\d+)\s*s/);
            if (years) { seconds += parseInt(years[1])*31556926; }
            if (months) { seconds += parseInt(months[1])*2592000; }
            if (weeks) { seconds += parseInt(weeks[1])*604800; }
            if (days) { seconds += parseInt(days[1])*86400; }
            if (hours) { seconds += parseInt(hours[1])*3600; }
            if (minutes) { seconds += parseInt(minutes[1])*60; }
            if (secs) { seconds += parseInt(secs[1]); }
            return seconds;
        }
        function getTimeInWords(str) {
            let text = '';
            let years = str.match(/(\d+)\s*y/);
            let months = str.match(/(\d+)\s*M/);
            let weeks = str.match(/(\d+)\s*w/);
            let days = str.match(/(\d+)\s*d/);
            let hours = str.match(/(\d+)\s*h/);
            let minutes = str.match(/(\d+)\s*m/);
            let secs = str.match(/(\d+)\s*s/);
            if (years) { text += years[1]+' '+declOfNum(parseInt(years[1]), ['год ', 'года ', 'лет ']) }
            if (months) { text += months[1]+' '+declOfNum(parseInt(months[1]), ['месяц ', 'месяца ', 'месяцев ']) }
            if (weeks) { text += weeks[1]+' '+declOfNum(parseInt(weeks[1]), ['неделю ', 'недели ', 'недель ']) }
            if (days) { text += days[1]+' '+declOfNum(parseInt(days[1]), ['день ', 'дня ', 'дней']) }
            if (hours) { text += hours[1]+' '+declOfNum(parseInt(hours[1]), ['час ', 'часа ', 'часов ']) }
            if (minutes) { text += minutes[1]+' '+declOfNum(parseInt(minutes[1]), ['минуту ', 'минуты ', 'минут ']) }
            if (secs) { text += secs[1]+' '+declOfNum(parseInt(secs[1]), ['секунду ', 'секунды ', 'секунд ']) }
            return text;
        }
        let time = getSeconds(time_formatted);
        if (time === 0) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете замутить человека на 0 секунд.`)});

        let user = message.mentions.members.first();
        if (!user) return message.channel.send({embed: embed_error(`${message.author}, извините, но пользователь, которого вы упомянули, не является участником сервера или не существует`)});
        // if (user.user.id === message.author.id) return message.channel.send({embed: embed_error(`${user.user}, извините, но вы не можете замутить самого себя.`)});
        if (user.user.bot) return message.channel.send({embed: embed_error(`${message.author}, извините, но вы не можете наказать бота`)});
        let reasontext = '';
        if (reason !== null && typeof reason !== undefined && reason !== '') reasontext = ` с причиной \`${reason}\``;
        if (reason === null || typeof reason === undefined || reason === '') reason = 'Причина не указана.';
        let accepting = message.channel.send(`Вы уверены, что хотите замутить пользователя \`${user.user.tag}\` на ${getTimeInWords(time_formatted)}${reasontext}?\n\n**Напишите \`да\`, чтобы подтведить.**`);
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
        collector.on('collect', msg => {
            if (['да', 'ага', 'кнш', 'конечно', 'конешно', 'давай', 'йес', 'yes', 'y', 'aga', 'go', 'da', 'го'].includes(msg.content.toLowerCase())) {
                message.channel.startTyping();
                message.delete();
                request(`http://${process.env.SITE_DOMAIN}/mute.php?id=${user.user.id}&time=${time*1000}&reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}`, function (error, response, body) {
                    try {
                    let data = JSON.parse(body);
                    let footer = 'Game🌀Space #'+data.id;
                    if (reason === null || typeof reason === 'undefined') reason = 'Причина не указана.';
                    let embed = new Discord.RichEmbed()
                        .setTitle('Мут')
                        .addField('Пользователь', `${user.user} (\`${user.user.tag}\`)`, true)
                        .addField('Модератор', `${message.author} (\`${message.author.tag}\`)`, true)
                        .addField('Длительность', getTimeInWords(time_formatted), true)
                        .setFooter(footer)
                        .setColor('C34E4E');
                    let dm_embed = new Discord.RichEmbed()
                        .setTitle('Мут')
                        .setDescription('Вы были замучены на сервере GameSpace')
                        .addField('Модератор', `${message.author} (\`${message.author.tag}\`)`, true)
                        .addField('Длительность', getTimeInWords(time_formatted), true)
                        .setFooter(footer)
                        .setColor('C34E4E');
                    if (reason !== null && typeof reason !== undefined && reason !== '') {embed.addField('Причина', `${reason}`);dm_embed.addField('Причина', `${reason}`);}
                    message.channel.send(`${user.user}`, {embed}).then(() => {message.channel.stopTyping(true)}).then(() => {if (message.author.id === user.user.id) message.channel.send(`${message.author}, не ну ты и долбоеб братишка, земля тебе пухом... ${client.emojis.get(emojis.facepalm)}`)});
                    message.guild.channels.get('426756919777165312').send({embed});
                    user.send({embed});
                    user.addRole('427148609776254986').catch(console.error);
                    console.log(time);
                    unmute(user, data.id, time*1000).catch(console.error);
                    } catch (Exception) {message.channel.send({embed: embed_error('Ошибка мута.')})}
                });
            }
            console.log(collector);
            collector.stop();
        });
    });
    add_command(['un-mute', 'unmute', 'анмут', 'анмутить', 'заанмутить', 'размут', 'размутить', 'разклеить_рот', 'отклеить_рот'], false, message, command, args, 'rules', ['MANAGE_MESSAGES'], function () {
        let member = message.mentions.members.first();
        if (!member) return message.channel.send({embed: embed_error('Данный пользователь не является участником сервера')});
        args.shift();
        let reason = args.join(' ');
        request(`http://${process.env.SITE_DOMAIN}/auto_unmute.php?reason=${encodeURIComponent(reason)}&secret=${encodeURIComponent(process.env.SECRET_KEY)}&user=${message.author.id}&id=${member.user.id}`, function (error, response, body) {
            message.channel.send(`Пользователь ${member} был размучен.`);
        });
        member.removeRole('427148609776254986').catch(console.error);
    });
    add_command(['splooter-nick'], false, message, command, args, 'roles', ['419562566512017415'], function () {
        message.delete();
        if (splooter) {
            splooter = false;
            message.channel.send('оффнул');
        } else {
            splooter = true;
            message.guild.members.get('329240046337261569').setNickname('splooter').catch();
            message.channel.send('врубил');
        }
    }, 'hid');
});

client.login(process.env.BOT_TOKEN).catch(err => {console.log(err)});
process.env.BOT_TOKEN = process.env.POSLANIYE;
