const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'th5v3d27kbgwmy93',
  publicKey:    '5gxr2k9s8sfrvt9n',
  privateKey:   '1a6656f87fa1eeb51a31dd030c1f1f7b'
});

export default async function handler(req, res) {
  return new Promise((resolve, reject) => {
    // const amount = req.body.amount
    // const paymentMethodNonce = req.body.paymentMethodNonce
    // const deviceData = req.body.deviceData

    gateway.transaction.sale({
      amount: req.body.amount,
      paymentMethodNonce: req.body.paymentMethodNonce,
      deviceData: req.body.deviceData,
      options: {
        submitForSettlement: req.body.submitForSettlement || true
      },
      //billing: {
        //postalCode: postalCodeFromTheClient
      //}
    }, (err, result) => {
      if(err) {
        res.status(500).json(err)
        reject("FAILURE")
      } else {
        res.status(200).json(result)
        resolve("SUCCESS")
      }
    });
  })
}