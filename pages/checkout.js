import Head from 'next/head'
import { Button, InputNumber, Space, DatePicker, Card } from 'antd';

export default function Home() {
  return (
    <div className="container">
        <InputNumber
            style={{ width: 200 }}
            defaultValue="1"
            min="0"
        />
        <br/>
        <Button type="primary">Test Transaction</Button>
    </div>
  )
}