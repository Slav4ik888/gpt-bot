import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import cfg from 'config';
import { ogg } from './utils/ogg.js';
import { openai } from './utils/openai.js';


console.log(cfg.get('TEST_ENV'));

const INITIAL_SESSION = {
  messages: []
};

const bot = new Telegraf(cfg.get('TELEGRAMM_BOT_TOKEN'));
bot.use(session());

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Жду вашего голосового или текстового сообщения');
});

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Жду вашего голосового или текстового сообщения');
});


bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    await ctx.reply(code('Сообщение принял, жду ответ от сервера...'))
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`))

    ctx.session.messages.push({ role: openai.roles.USER, content: text });
    await ctx.reply(code('Ждём ответ от GPT...'));

    const { content } = await openai.chat(ctx.session.messages);
    // Save context
    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content });

    await ctx.reply(content);
  }
  catch (e) {
    console.log('Error in voice message: ', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });
    await ctx.reply(code('Ждём ответ от GPT...'));

    const { content } = await openai.chat(ctx.session.messages);
    // Save context
    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content });

    await ctx.reply(content);
  }
  catch (e) {
    console.log('Error in text message: ', e.message);
  }
});



bot.launch();

// =================================================

console.log(`Starting ${cfg.get('APP_NAME')}...`);

process.once('SIGINT', () => {
  console.log('[SIGINT] stop bot!');
  bot.stop('SIGINT');
}); // If nodejs stopped => we will stop bot

process.once('SIGTERM', () => {
  console.log('[SIGTERM] stop bot!');
  bot.stop('SIGTERM');
});



// t.me/GPT_slv4ik888_bot
