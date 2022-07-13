import Head from 'next/head';
import { useState, useEffect } from 'react';
import { InputNumber, Alert } from 'antd';
import ApplePayButton from './components/ApplePayButton';

const defaultAmount = 1;
const exampleApplePayConfig = {
  countryCode: 'US',
  paymentSummaryItems: [{ type: 'final', label: 'Total' }],
  supportedNetworks: ['AMEX', 'VISA', 'MASTERCARD', 'DISCOVER', 'MAESTRO'],
  token: 'sandbox_w39fvdk4_th5v3d27kbgwmy93',
  merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit', 'supportsEMV'],
  merchantIdentifier: 'merchant.com.braintree.BookingB2C.test',
};
let applePayInstance1;
export default function Home() {
  const [amount, setAmount] = useState(defaultAmount);
  const [{ message, type }, setAlertMessage] = useState({});

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const handlePost = async (payload) => {
    console.log('data', payload);
    const response = await window.fetch('/api/transaction', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const { status } = response;
    if (status >= 300 || status < 200) {
      setAlertMessage({
        type: 'error',
        message: 'Oops! something went wrong. Please try again later.',
      });
      return;
    }
    try {
      const responseData = await response.json();
      console.log(responseData);
      const { message, success } = (responseData || {});
      if (!success) {
        setAlertMessage({
          type: 'error',
          message,
        });
        return;
      }
      setAlertMessage({
        type: 'success',
        message: 'Congrats! The payment is successful via Apple Pay.',
      });
    } catch (error) {
      setAlertMessage({
        type: 'error',
        message: 'Oops! something went wrong. Please try again later.',
      });
    }
  }

  const handleApplePayClick = () => {
    const paymentRequest = applePayInstance1.createPaymentRequest({
      total: {
        label: 'My Store',
        amount,
        type: 'final'
      },
      merchantCapabilities: exampleApplePayConfig.merchantCapabilities,
      supportedNetworks: exampleApplePayConfig.supportedNetworks,
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
        merchantIdentifier: exampleApplePayConfig.merchantIdentifier,
        displayName: 'My Store'
      }, function (err, merchantSession) {
        if (err) {
          // You should show an error to the user, e.g. 'Apple Pay failed to load.'
          console.error('Error: Apple Pay failed to load.', err);
          setAlertMessage({
            type: 'error',
            message: 'Apple Pay failed to load.',
          });
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
          setAlertMessage({
            type: 'error',
            message: 'Failed to tokenize Apple Pay.',
          });
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
        if (!payload.nonce) { return; }
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        handlePost({
          amount,
          paymentMethodNonce: payload.nonce,
          deviceData: 'test__',
        })
      });
    };

    session.oncancel = function (event) {
      // Payment cancelled by WebKit
      console.log('apple pay session cancelled', event); // eslint-disable-line
      setAlertMessage({
        type: 'warning',
        message: 'Apple Pay session was cancelled. Please try again later.',
      });
    };

    session.begin();
  }

  function initializeApplePay() {
    if (!window.ApplePaySession) {
      console.error('This device does not support Apple Pay');
      setAlertMessage({
        type: 'warning',
        message: 'This device does not support Apple Pay. Please try to visit via Safari.',
      });
      return;
    }

    if (!ApplePaySession.canMakePayments()) {
      console.error('This device is not capable of making Apple Pay payments');
      setAlertMessage({
        type: 'warning',
        message: 'This device is not capable of making Apple Pay payments.',
      });
      return;
    }

    braintree.client.create({
      authorization: exampleApplePayConfig.token,
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
    <div className="app">
      <script src="https://js.braintreegateway.com/web/3.85.3/js/client.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/paypal-checkout.min.js"></script>
      <script src="https://js.braintreegateway.com/web/3.85.3/js/apple-pay.min.js"></script>
      <div className="container">
          <InputNumber
              addonBefore="$"
              style={{ width: 200 }}
              defaultValue={defaultAmount}
              min="0"
              value={amount}
              onChange={handleAmountChange}
          />
          <div className="lpm-instruction-container">
            <h2 className="lpm-instruction-title">Here's what happens next</h2>
            <ul className="lpm-instructions">
              <li>You'll be redirected to Apple Pay.</li>
              <li>Make sure you complete all the steps with Apple Pay.</li>
              <li>You'll receive confirmation after you've paid.</li>
            </ul>
          </div>
          {(message) && (
            <div className="lpm-message-container">
              <Alert
                message={message}
                type={type}
                closable
              />
            </div>
          )}
          <ApplePayButton onClick={handleApplePayClick} />
      </div>
    </div>
  )
}