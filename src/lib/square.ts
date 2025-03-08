const { Client } = require('square');

if (!process.env.SQUARE_ACCESS_TOKEN) {
  throw new Error('Missing SQUARE_ACCESS_TOKEN')
}

// Square SDKをインスタンス化
export const square = new Client({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  accessToken: process.env.SQUARE_ACCESS_TOKEN
}) 