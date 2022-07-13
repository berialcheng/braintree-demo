const braintree = require("braintree");
const stream = require("stream");

const gateway = new braintree.BraintreeGateway({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'th5v3d27kbgwmy93',
  publicKey:    '5gxr2k9s8sfrvt9n',
  privateKey:   '1a6656f87fa1eeb51a31dd030c1f1f7b'
});

export default async function handler(req, res) {
    return new Promise((resolve, reject) => {
        const stream = gateway.transaction.search((search) => {}, (err, response) => {
            var list = []
            var eachTransactions = new Promise((resolve, reject) => {
                response.each((err, transaction) => {
                    list.push(transaction)  
                })
            })
            console.log(list)
            if(err) {
                res.status(500).json(err)
                reject("FAILURE")
            } else {
                res.status(200).json(response)
                resolve("SUCCESS")
            }
        });
    })
}