const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const client = require("./client");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
require("dotenv").config();
const uploadMiddleware = require("./middlewares/upload.middleware");

//gRPC Server
const PROTO_PATH = "./machine-learning-service.proto";
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
  defaults: true,
  oneofs: true,
});
const mlServiceProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
const coordinates = [];
let processingStatus;

server.addService(mlServiceProto.MachineLearningService.service, {
  storeStatus: (call, callback) => {
    processingStatus = call.request.token;
    callback(null, { status: processingStatus });
  },
  predict: (call, callback) => {
    const coordinate = call.request.coordinate;
    //store coordinate
    coordinates.push(coordinate);
    callback(null, {
      result: "predict response and store coordinate successfully",
    });
  },
  uploadFile: (call, callback) => {
    call.request.fileMetadata.forEach((file) => {
      const filePath = `uploads/${file.filename}`;
      fs.rename(file.path, filePath, (err) => {
        if (!err) {
          callback(null, {
            message: "Upload failed",
          });
        }
      });
    });
    callback(null, {
      message: "Upload file(s) successfully",
    });
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
);

//Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("view"));

app.post("/predict", (req, res) => {
  const coordinate = req.body;
  client.predict({ coordinate }, (err, data) => {
    if (!err) {
      res.status(200).json({ data });
    }
  });
});

app.post("/store-status", (req, res) => {
  const token = req.body.token;
  client.storeStatus({ token }, (err, data) => {
    if (!err) {
      res.status(200).json(data);
    }
  });
});

app.post("/upload", uploadMiddleware, (req, res) => {
  const files = req.files;
  client.uploadFile({ fileMetadata: files }, (err, data) => {
    if (!err) {
      res.status(200).json(data);
    }
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
