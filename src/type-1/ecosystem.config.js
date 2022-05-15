module.exports = {
  apps: [
    {
      app: "coordinator",
      script: "src/coordinator.ts",
      instances: 1,
    },
    {
      app: "client",
      script: "src/client.ts",
      instances: 5,
    },
  ],
};
