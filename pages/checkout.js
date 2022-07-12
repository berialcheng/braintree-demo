import Head from 'next/head'
import { Button, InputNumber, Space, DatePicker, Card } from 'antd';

export default function Home() {

  function handleClick() {
    if (!window.ApplePaySession) {
      console.error('This device does not support Apple Pay');
    }
    
    if (!ApplePaySession.canMakePayments()) {
      console.error('This device is not capable of making Apple Pay payments');
    }
    
    braintree.client.create({
      authorization: 'CLIENT_AUTHORIZATION'
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
    
        // Set up your Apple Pay button here
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
          <Button type="primary">Test Transaction</Button>
      </div>
    </div>
  )
}