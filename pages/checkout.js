import Head from 'next/head';
import { useState, useEffect } from 'react';
import { InputNumber, Alert } from 'antd';
import client from 'braintree-web/client';
import applePay from 'braintree-web/apple-pay';
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
const ShowcaseNotice = (
  <div>
    1. Please visit the website via <strong>Safari</strong> browser. <br />
    2. To make a successful payment, please log into your iOS/MacOS device with <a href="https://developer.apple.com/apple-pay/sandbox-testing/" target="_blank" rel="noopener noreferrer">Apple Pay sandbox tester account</a>.
  </div>
);

let applePayInstance1;
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const [{ message, type }, setAlertMessage] = useState({});

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const handlePost = async (payload) => {
    console.log('data', payload);
    const response = await window.fetch('/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    client.create({
      authorization: exampleApplePayConfig.token,
    }, function (clientErr, clientInstance) {
      if (clientErr) {
        console.error('Error creating client:', clientErr);
        return;
      }

      applePay.create({
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
    setMounted(true);
    initializeApplePay();
  }, []);

  if (!mounted) { return null; }

  return (
    <div className="app">
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
            <li>Apple Pay payment sheet will be invoked.</li>
            <li>Make sure you complete all the steps with Apple Pay (on iPhone device nearby).</li>
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
      <div className="notice-container">
        <Alert
          message="Things you should know"
          description={ShowcaseNotice}
          type="info"
        />
      </div>
    </div>
  )
}