const braintree = require("braintree");

const gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'th5v3d27kbgwmy93',
  publicKey:    '5gxr2k9s8sfrvt9n',
  privateKey:   '1a6656f87fa1eeb51a31dd030c1f1f7b'
});


export default function handler(req, res) {
    const stream = gateway.transaction.search((search) => {}, (err, response) => {
        response.each((err, transaction) => {
            console.log(transaction);
        });
    });
    res.status(200).json(stream)
}