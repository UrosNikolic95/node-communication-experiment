module.exports = {
  apps: [
    // {
    //   app: "coordinator",
    //   script: "src/type-1/coordinator.type-1.ts",
    //   instances: 1,
    // },
    // {
    //   app: "client",
    //   script: "src/type-1/client.type-1.ts",
    //   instances: 5,
    // },
    {
      app: "client",
      script: "src/type-2/client.type-2.ts",
      instances: 5,
    },
  ],
};
