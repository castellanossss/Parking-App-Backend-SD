module.exports = {
    apps: [
        {
            name: "Backend",
            script: "./server.js",
            watch: true,
            max_memory_restart: "1000M",
            exec_mode: 'cluster',
            intances: 1,
            cron_restart: '59 23 * * *',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            }
        },
    ],
};
