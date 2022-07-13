import Head from 'next/head';

const ApplePayButton = ({ onClick }) => (
    <div
      className="apple-pay-button apple-pay-button-black"
      onClick={onClick}
    />
);

export { ApplePayButton };