import Head from 'next/head'
import { Button, InputNumber, Space, DatePicker, Card } from 'antd';

let paymentRequest;
let applePayInstance1;
export default function Home() {
  

  function handleApplePayClick () {
    var session = new ApplePaySession(3, paymentRequest);

    session.onvalidatemerchant = function (event) {
      applePayInstance1.performValidation({
        validationURL: event.validationURL,
        displayName: 'My Store'
      }, function (err, merchantSession) {
        if (err) {
          // You should show an error to the user, e.g. 'Apple Pay failed to load.'
          return;
        }
        session.completeMerchantValidation(merchantSession);
      });
    };


    session.onpaymentauthorized = function (event) {
      console.log('Your shipping address is:', event.payment.shippingContact);
    
      applePayInstance1.tokenize({
        token: event.payment.token
      }, function (tokenizeErr, payload) {
        if (tokenizeErr) {
          console.error('Error tokenizing Apple Pay:', tokenizeErr);
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          return;
        }
    
        // Send payload.nonce to your server.
        console.log('nonce:', payload.nonce);
    
        // If requested, address information is accessible in event.payment
        // and may also be sent to your server.
        console.log('billingPostalCode:', event.payment.billingContact.postalCode);
    
        // After you have transacted with the payload.nonce,
        // call `completePayment` to dismiss the Apple Pay sheet.
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
      });
    };

    session.begin();
  }

  function handleClick() {
    if (!window.ApplePaySession) {
      console.error('This device does not support Apple Pay');
    }
    
    if (!ApplePaySession.canMakePayments()) {
      console.error('This device is not capable of making Apple Pay payments');
    }
    
    braintree.client.create({
      authorization: 'sandbox_v2kb9c6b_zgvjvhdq4mxznj66'
    }, function (clientErr, clientInstance) {
      if (clientErr) {
        console.error('Error creating client:', clientErr);
        return;
      }
    
      braintree.applePay.create({
        client: clientInstance
      }, function (applePayErr, applePayInstance) {
        if (applePayErr) {
          console.error('Error creating applePayInstance:', applePayErr);
          return;
        }
        applePayInstance1 = applePayInstance;
    
        paymentRequest = applePayInstance.createPaymentRequest({
          total: {
            label: 'My Store',
            amount: '19.99'
          },
        
          // We recommend collecting billing address information, at minimum
          // billing postal code, and passing that billing postal code with
          // all Apple Pay transactions as a best practice.
          requiredBillingContactFields: ["postalAddress"]
        });
        console.log(paymentRequest.countryCode);
        console.log(paymentRequest.currencyCode);
        console.log(paymentRequest.merchantCapabilities);
        console.log(paymentRequest.supportedNetworks);
        
       
      });
    });
  }

  return (
    <div>
      
      <script src="https://js.braintreegateway.com/web/3.85.3/js/client.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/paypal-checkout.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/apple-pay.min.js"></script>
      <div className="container">
          <InputNumber
              style={{ width: 200 }}
              defaultValue="1"
              min="0"
          />
          <br/>
          <Button type="primary" onClick={handleClick}>Initialization</Button>
          <Button type="primary" onClick={handleApplePayClick}>Apple Pay</Button>
          <Button type="primary">Test Transaction</Button>
      </div>
    </div>
  )
}