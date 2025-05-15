module.exports = {
  name: 'ping',
  description: 'Uygulama ve discord sunucusu arasındaki gecikme değerlerini gösterir!',
  devOnly: true,
 // testOnly: Boolean,
 // deleted: Boolean,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `.\n:wireless: Uygulama Gecikmesi : **${ping}ms**  \n\n:wireless: Sunucu Gecikmesi : **${client.ws.ping}ms**`
    );
  },
};