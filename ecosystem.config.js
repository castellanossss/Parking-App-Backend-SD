module.exports = {
    apps: [
        {
            name: "Backend",
            script: "./server.js",
            watch: true,
            max_memory_restart: "1000M",
            cron_restart: '59 23 * * *',
            env: {
                NODE_ENV: 'development',
                IMAGES_SERVER_URL: ''
            },
            env_production: {
                NODE_ENV: 'production',
                IMAGES_SERVER_URL: ''
            }
        },
    ],
};
