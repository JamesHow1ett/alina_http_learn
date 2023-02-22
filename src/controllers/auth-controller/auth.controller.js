const redisClient = require("../../redis");

const userLoggin = (server) => async (request, reply) => {
  const { email, password } = request.body;

  const user = await redisClient.get(email);

  if (!user) {
    return reply.code(404).send({ message: "User not found." });
  }

  const userInfo = JSON.parse(user);

  if (userInfo.password !== password) {
    return reply.code(401).send({ message: "Bad credentials." });
  }

  const token = server.jwt.sign({ email });

  return reply.code(200).send({ data: { userInfo, token } });
};

const healthCheck = () => async (request, reply) => reply.code(200).send({ message: "OK" });

module.exports = {
  userLoggin,
  healthCheck,
};
