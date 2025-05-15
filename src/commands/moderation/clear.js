const { ChannelType ,PermissionsBitField, EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ChatInputCommandInteraction, ALLOWED_EXTENSIONS } = require('discord.js');
const Transcripts = require("discord-html-transcripts");
  
  module.exports = {
    name: 'clear',
    description: 'Kanallardaki istenmeyen mesajları belirtilen sayı üzerinden silme işlemi yapar',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
      {
        name: 'mesaj_sayısı',
        description: 'Silinecek Mesaj Sayısı (1-99 Arası kullanım önerilir)',
        required: true,
        type: ApplicationCommandOptionType.Number,
        min_value: 1,
        max_value:100,
      },
      {
        name: 'silme_nedeni',
        description: 'Sunucu Taraflı Silinen Mesajların Logları için Silme Nedeni',
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: 'kullanıcı',
        description: 'Mesajları silinecek kullanıcı.(Seçim yoksa son atılan mesajdan belirtilen sayı kadar mesaj silinir)',
        type: ApplicationCommandOptionType.User,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

        /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
  
    callback: async (_client, interaction) => {


      const Amount = interaction.options.getNumber("mesaj_sayısı");
      const Reason = interaction.options.getString("silme_nedeni");
      const Target = interaction.options.getUser("kullanıcı");

      const channelMessages = await interaction.channel.messages.fetch();

      
      const categoryName = 'deity Admin';
      // Önce kategoriyi bulmaya çalış
let category = interaction.guild.channels.cache.find(channel => channel.name === categoryName && channel.type === ChannelType.GuildCategory);

// Eğer kategori bulunamazsa, yeni bir kategori oluştur
if (!category) {
    try {
        category = await interaction.guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone, // Herkes rolünü alır
                    deny: [PermissionsBitField.Flags.ViewChannel], // Herkese kategoriyi görmeyi yasaklar
                },
                {
                    id: interaction.guild.roles.cache.find(role => role.permissions.has([PermissionsBitField.Flags.ManageGuild])).id, // Admin rolünü alır
                    allow: [PermissionsBitField.Flags.ViewChannel], // Adminlere kategoriyi görme izni verir
                }
            ],
            reason: 'Admin logları için kategori oluşturuldu ve sadece adminler görebilir.'
        });
        console.log(`Kategori ${categoryName} başarıyla oluşturuldu.`);
    } catch (error) {
        console.error('Kategori oluşturulurken bir hata oluştu:', error);
    }
}






      const logChannelName = 'deity-clearlogs';

      // Kanalı bulmaya çalış
      let logChannel = interaction.guild.channels.cache.find(channel => channel.name === logChannelName);
      
      // Eğer kanal bulunamazsa, yeni bir kanal oluştur
      if (!logChannel) {
          try {
              logChannel = await interaction.guild.channels.create({
                  name: logChannelName,
                  type: ChannelType.GuildText, // Metin kanalı türü belirtildi
                  parent: category ? category.id : null, // Kanalı kategori içinde oluşturur
                  permissionOverwrites: [
                      {
                          id: interaction.guild.roles.everyone, // Herkes rolünü alır
                          deny: [PermissionsBitField.Flags.ViewChannel], // Herkese kanalı görmeyi yasaklar
                      },
                      {
                          id: interaction.guild.roles.cache.find(role => role.permissions.has([PermissionsBitField.Flags.ManageGuild])).id, // Admin rolünü alır
                          allow: [PermissionsBitField.Flags.ViewChannel], // Adminlere kanalı görme izni verir
                      }
                  ],
                  reason: 'Log kanalı oluşturuldu çünkü mevcut değildi ve sadece adminler görebilir.'
              });
              console.log(`Kanal ${logChannelName} başarıyla oluşturuldu ve sadece adminler görebiliyor.`);
          } catch (error) {
              console.error('Kanal oluşturulurken bir hata oluştu:', error);
          }
      }


      const responseEmbed = new EmbedBuilder().setColor('Purple');
      const logEmbed = new EmbedBuilder().setColor('DarkPurple')
      .setAuthor({name: " 🧹 Sohbet Temizleme Komutu Kullanıldı 🧹 "});

      let logEmbedDescription = [
          `• İşlem Yapan: ${interaction.member}`,
          `• İşlem Yapılan: ${Target || "Seçilmedi"}`,
          `• İşlem Nedeni: ${Reason}`,
          `• Kanal: ${interaction.channel}`
      ];

      if(Target) {
          let i = 0;
          let messagesToDelete = [];
          channelMessages.filter((message) => {
              if(message.author.id === Target.id && Amount > i) {
                  messagesToDelete.push(message);
                  i++
              }
          });

          const Transcript = await Transcripts.generateFromMessages(messagesToDelete, interaction.channel);

          interaction.channel.bulkDelete(messagesToDelete, true).then((messages) =>{
              interaction.reply({
                  embeds: [responseEmbed.setDescription(` 🧹 ${Target} Kullanıcısından \`${messages.size}\` adet mesaj silindi. `)],
                  ephemeral: true
              });

              logEmbedDescription.push(`• Toplam Silinen Mesaj: ${messages.size}`);
              logChannel.send({
                  embeds: [logEmbed.setDescription(logEmbedDescription.join("\n"))],
                  files: [Transcript]
              });
          });
      } else {
          const Transcript = await Transcripts.createTranscript(interaction.channel, { limit: Amount, returnType: 'attachment', filename: 'transcript.html',saveImages:'false',footerText: "{number} tane mesaj silindi",poweredBy: false,hydrate: true});

          interaction.channel.bulkDelete(Amount, true).then((messages) => {

              interaction.reply({
                  embeds: [responseEmbed.setDescription(` 🧹 \`${messages.size}\` adet mesaj silindi.`)],
                  ephemeral: true
              });
  
              logEmbedDescription.push(`• Total Messages: ${messages.size}`);
              logChannel.send({
                  embeds: [logEmbed.setDescription(logEmbedDescription.join("\n"))],
                  files: [Transcript]
              });
          });

      }
  }
}