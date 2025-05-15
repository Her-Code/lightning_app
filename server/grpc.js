const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
require('dotenv').config();
const path = require('path');


// Load lnd rpc.proto file
const packageDefinition = protoLoader.loadSync(
    path.resolve(__dirname, '../protos/rpc.proto'),
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  );
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

// Load TLS cert
const lndCert = fs.readFileSync(process.env.LND_TLS_CERT);
const sslCreds = grpc.credentials.createSsl(lndCert);

// Macaroon Auth
const macaroon = fs.readFileSync(process.env.LND_MACAROON).toString('hex');
const metadata = new grpc.Metadata();
metadata.add('macaroon', macaroon);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_, callback) => {
    callback(null, metadata);
});

// Create combined credentials
const creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// Connect to lnd
const lnd = new lnrpc.Lightning(process.env.LND_GRPC_HOST, creds);

module.exports = lnd;

// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');
// const fs = require('fs');
// require('dotenv').config();

// // Load rpc.proto file (should be in the same directory)
// const packageDefinition = protoLoader.loadSync('rpc.proto', {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });
// const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

// // Load TLS certificate
// const lndCert = fs.readFileSync(process.env.LND_TLS_CERT);
// const sslCreds = grpc.credentials.createSsl(lndCert);

// // Load macaroon
// const macaroon = fs.readFileSync(process.env.LND_MACAROON).toString('hex');
// const metadata = new grpc.Metadata();
// metadata.add('macaroon', macaroon);

// // Create macaroon credentials
// const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_, callback) => {
//   callback(null, metadata);
// });

// // Combine credentials
// const creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// // Connect to LND
// const lnd = new lnrpc.Lightning(process.env.LND_GRPC_HOST, creds);

// module.exports = lnd;
