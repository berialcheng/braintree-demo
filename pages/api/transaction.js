const braintree = require("braintree");

const gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'th5v3d27kbgwmy93',
  publicKey:    '5gxr2k9s8sfrvt9n',
  privateKey:   '1a6656f87fa1eeb51a31dd030c1f1f7b'
});

export default function handler(req, res) {
  gateway.transaction.sale({
    amount: "10.00",
    paymentMethodNonce: nonceFromTheClient,
    deviceData: deviceDataFromTheClient,
    options: {
      submitForSettlement: true
    },
    //billing: {
      //postalCode: postalCodeFromTheClient
    //}
  }, (err, result) => {
    if(err) {
      res.status(500).json(err)
    } else {
      res.status(200).json(result)
    }
  });
}