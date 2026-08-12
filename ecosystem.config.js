module.exports = {
  apps: [
    {
      name: "voicepilot-frontend",
      cwd: "./apps/web",
      script: "../../node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "voicepilot-api",
      cwd: "./apps/api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8000
      }
    }
  ]
};

