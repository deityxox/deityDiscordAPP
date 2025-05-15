const { Client, IntentsBitField, ActivityType} = require('discord.js');

module.exports = (client) => {

    let status = [
        {
            name: "🦝",
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=RXKabdUBiWM',
        },
        {
            name: "🦝",
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=RXKabdUBiWM',
        },
    ]


        console.log(`✅ | botID = ${client.user.id} | botName = ${client.user.tag} | botDoğrulama = ${client.user.verified} | Bot aktif oldu.`)
    
        setInterval(() => {
            let random = Math.floor(Math.random() * status.length);
            client.user.setActivity(status[random]);
        }, 10000);

    
};