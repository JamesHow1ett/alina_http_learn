const redisClient = require("../../redis");

const registerUser = () => async (request, reply) => {
  const userData = request.body;

  const hasUser = await redisClient.get(userData.email);

  if (hasUser) {
    return reply.code(400).send({ message: "User already exists." });
  }

  await redisClient.set(userData.email, JSON.stringify(userData));

  return reply.code(200).send({ data: userData });
};

const getUser = (server) => async (request, reply) => {
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.code(401).send({ message: "Authorization required." });
  }

  const decodeToken = server.jwt.decode(token);

  if (!decodeToken) {
    return reply.code(403).send({ message: "Forbidden." });
  }

  const user = await redisClient.get(decodeToken.email);

  if (!user) {
    return reply.code(404).send({ message: "User not found." });
  }

  return reply.code(200).send({ data: JSON.parse(user) });
};

const updateUser = (server) => async (request, reply) => {
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.code(401).send({ message: "Authorization required." });
  }

  const decodeToken = server.jwt.decode(token);

  if (!decodeToken) {
    return reply.code(403).send({ message: "Forbidden." });
  }

  const user = await redisClient.get(decodeToken.email);

  if (!user) {
    return reply.code(404).send({ message: "User not found." });
  }

  const userData = request.body;

  const userDetails = JSON.parse(user);
  const newUserData = {
    ...userDetails,
    ...userData,
  };

  await redisClient.set(userDetails.email, JSON.stringify(newUserData));

  return reply.code(200).send({ data: newUserData });
};

module.exports = {
  registerUser,
  getUser,
  updateUser,
};
