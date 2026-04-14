module.exports = {
  apps: [
    {
      name: "movie-api",
      script: "./index.js",
      instances: 6, // Exactly 6 instances
      exec_mode: "cluster", // Enables the load balancer
      watch: true, // Restart on file changes (great for learning)
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
