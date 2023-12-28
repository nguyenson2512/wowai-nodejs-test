const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const PROTO_PATH = "./machine-learning-service.proto";

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
  defaults: true,
  oneofs: true,
});

const MachineLearningService =
  grpc.loadPackageDefinition(packageDefinition).MachineLearningService;

const client = new MachineLearningService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

module.exports = client;
