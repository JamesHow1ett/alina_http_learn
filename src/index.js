// import fastifyJwt from "@fastify/jwt";
// import fastifyCors from "@fastify/cors";
// import redisClient from "./redis";

// import * as authController from "./controllers/auth-controller";
// import * as userController from "./controllers/user-controller";

const Fastify = require("fastify");
const fastifyJwt = require("@fastify/jwt");
const fastifyCors = require("@fastify/cors");
const redisClient = require("./redis");

const authController = require("./controllers/auth-controller/auth.controller");
const userController = require("./controllers/user-controller/user.controller");

/**
 * authenticate
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
async function verifyJwt(request, reply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.send(error);
  }
}

const originFn = (origin, callback) => {
  // FIXME: from postman request origin == undefined
  if (!origin) {
    callback(null, true);
    return;
  }

  const { hostname } = new URL(origin);
  if (hostname === "localhost") {
    callback(null, true);
    return;
  }

  // Generate an error on other origins, disabling access
  callback(new Error("Not allowed"), false);
};

const fastifyCorsOptions = {
  origin: originFn,
  methods: ["GET", "PUT", "POST"],
};

const serverConfig = {
  port: 4547,
  host: "0.0.0.0",
};

const server = Fastify({
  logger: true,
});

async function startServer() {
  server.register(fastifyJwt, {
    secret: "alinochka",
  });
  server.register(fastifyCors, fastifyCorsOptions);

  server.decorate("authenticate", verifyJwt);

  server.register(
    async (serv) => {
      serv.get("/heal", authController.healthCheck());

      serv.post("/login", authController.userLoggin(server));
    },
    { prefix: "api/auth" }
  );

  server.register(
    async (serv) => {
      serv.get("/get", { preHandler: [serv.authenticate] }, userController.getUser(server));

      serv.post("/register", userController.registerUser());

      serv.put("/update", { preHandler: [serv.authenticate] }, userController.updateUser(server));
    },
    { prefix: "api/user" }
  );

  try {
    await redisClient.connect();
    await server.listen(serverConfig);

    server.log.info(`Server running at http://localhost:${serverConfig.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();
