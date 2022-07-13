import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Button, InputNumber, Space, DatePicker, Card } from 'antd';
import ApplePayButton from './components/ApplePayButton';

const defaultAmount = 1;
let applePayInstance1;
export default function Home() {
  const [amount, setAmount] = useState(defaultAmount);

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const handleApplePayClick = () => {
    const paymentRequest = applePayInstance1.createPaymentRequest({
      total: {
        label: 'My Store',
        amount,
        type: 'final'
      },
      merchantCapabilities: ['supports3DS','supportsDebit', 'supportsCredit', 'supportsEMV'],
      supportedNetworks: ["visa", "masterCard", "amex", "discover", "chinaUnionPay"]
      // We recommend collecting billing address information, at minimum
      // billing postal code, and passing that billing postal code with
      // all Apple Pay transactions as a best practice.
      //requiredBillingContactFields: ["postalAddress"]
    });
    console.log(paymentRequest);
    console.log(paymentRequest.countryCode);
    console.log(paymentRequest.currencyCode);
    console.log(paymentRequest.merchantCapabilities);
    console.log(paymentRequest.supportedNetworks);
    var session = new ApplePaySession(3, paymentRequest);

    session.onvalidatemerchant = function (event) {
      console.log('onvalidatemerchant', event);
      applePayInstance1.performValidation({
        //validationURL: event.validationURL,
        validationURL: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession",
        //event.validationURL,
        merchantIdentifier: "merchant.com.braintree.BookingB2C.test",
        displayName: 'My Store'
      }, function (err, merchantSession) {
        if (err) {
          // You should show an error to the user, e.g. 'Apple Pay failed to load.'
          console.error('Error: Apple Pay failed to load.', err);
          return;
        }
        session.completeMerchantValidation(merchantSession);
      });
    };


    session.onpaymentauthorized = function (event) {
      console.log('onpaymentauthorized', event);
    
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
        console.log('event:', event);
    
        // After you have transacted with the payload.nonce,
        // call `completePayment` to dismiss the Apple Pay sheet.
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
      });
    };

    session.oncancel = function (event) {
      // Payment cancelled by WebKit
      console.log('apple pay session cancelled', event); // eslint-disable-line
    };

    session.begin();
  }

  function initializeApplePay() {
    if (!window.ApplePaySession) {
      console.error('This device does not support Apple Pay');
      return;
    }
    
    if (!ApplePaySession.canMakePayments()) {
      console.error('This device is not capable of making Apple Pay payments');
      return;
    }
    
    braintree.client.create({
      authorization: 'sandbox_w39fvdk4_th5v3d27kbgwmy93'
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
      });
    });
  }

  useEffect(() => {
    initializeApplePay();
  }, []);

  return (
    <div>
      
      <script src="https://js.braintreegateway.com/web/3.85.3/js/client.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/paypal-checkout.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/apple-pay.min.js"></script>
      <div className="container">
          <InputNumber
              style={{ width: 200 }}
              defaultValue={defaultAmount}
              min="0"
              value={amount}
              onChange={handleAmountChange}
          />
          <br/>
          {/* <Button type="primary" onClick={handleApplePayClick}>Apple Pay</Button> */}
          <ApplePayButton onClick={handleApplePayClick} />
          {/* <Button type="primary">Test Transaction</Button> */}
      </div>
    </div>
  )
}