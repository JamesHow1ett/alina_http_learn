// import { createClient } from "redis";
const redis = require("redis");

const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
// export default client;

module.exports = client;
