const lnd = require('./grpc');

// Create Invoice
async function createInvoice(amountSats) {
    return new Promise((resolve, reject) => {
        const request = {
            memo: "Test Invoice",
            value: amountSats
        };
        lnd.AddInvoice(request, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// function subscribeToInvoices(io) {
//     const call = lnd.SubscribeInvoices({});
//     call.on('data', (invoice) => {
//         if (invoice.settled) {
//             console.log(`Invoice settled! ${invoice.memo}`);
//             if (io) {
//                 io.emit('invoicePaid', invoice);
//             }
//         }
//     });

//     call.on('error', console.error);
// }

function subscribeToInvoices(io) {
    const call = lnd.SubscribeInvoices({});
    call.on('data', (invoice) => {
        if (invoice.settled) {
            console.log(`Invoice settled! ${invoice.memo}`);
            if (io) {
                io.emit('invoicePaid', invoice); // emit to all clients
            }
        }
    });
    call.on('error', console.error);
}

module.exports = { createInvoice, subscribeToInvoices };
