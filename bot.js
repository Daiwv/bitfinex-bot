const ws = require('ws')
const crypto = require('crypto')
const bfx = new ws('wss://api.bitfinex.com/ws/2')
const request = require('request');

// Replace with your own api key and secret
let api_key = ''
let api_secret = ''

// robin
//the formula for margin BTC is :   marginBTC = (IOTAUSD/BTCUSD)/IOTABTC
//which means going into btc into dollar gives you more money than paying out iota into usd

// Ensure your nonce is always increasing
let nonce = Date.now()

// Payload to be sent to authenticate
let payload = {
  apiKey: api_key,
  event: 'auth',
  authPayload: 'AUTH' + nonce,
  authNonce: +nonce
}
payload.authSig = crypto.createHmac('sha384', api_secret)
  .update(payload.authPayload)
  .digest('hex')

// On open event, send authentication message
bfx.on('open', () => {
  bfx.send(JSON.stringify(payload))
  console.log("login")
})


var previousGap
var cid = 499934570293945

bfx.on('message', (message, buffer) => {
  msg = JSON.parse(message)
  if (msg.event === 'auth' && msg.status === 'OK') {
    // bfx.send(books)
    console.log("bot starting")
    setInterval(
      bot,
    1000);
  }
})

function bot() {
  request.get(
    `https://api.bitfinex.com/v2/tickers?symbols=tIOTETH`,
    (error, response, body) => {
        if (error) {
          console.log(error);
        }
        else if (response) {
          var array = JSON.parse(body)
          // console.log(body)
          var bidPrice = array[0][1]
          var bidAmount = array[0][2]
          var askPrice = array[0][3]
          var askAmount = array[0][4]
          var priceGap = (askPrice - bidPrice)*100

          console.log("ETH GAP PER MIOTA : " + priceGap);

          if (priceGap > 0.0006) {
            placeOrders(bidPrice, askPrice)

          }
        }
        // console.log("BID: " + array[0][1])
        // console.log("AMOUNT: " + array[0][2])
        // console.log("ASK: " + array[0][3])
        // console.log("AMOUNT: " + array[0][4])
        // console.log("-------------------------")
        previousGap = priceGap
    }
  )
}

function placeOrders(bidPrice, askPrice) {
  console.log("placing orders")
  //
  let buyOrder = JSON.stringify([
    0,
    'on',
    null,
    {
      gid: 1,
      cid: cid,
      type: "EXCHANGE LIMIT",
      symbol: "tIOTETH",
      amount: "1",
      price: bidPrice + 0.0000001,
      hidden: 0
    }
  ])

  let sellOrder = JSON.stringify([
    0,
    'on',
    null,
    {
      gid: 1,
      cid: cid+1,
      type: "EXCHANGE LIMIT",
      symbol: "tIOTETH",
      amount: "-1",
      price: askPrice - 0.0000001,
      hidden: 0
    }
  ])

console.log(cid)
bfx.send(buyOrder)
console.log("BUY ORDER sent")
console.log(buyOrder)

// console.log(cid+1)
// bfx.send(sellOrder)
// console.log("SELL ORDER sent")
// console.log(sellOrder)

cid = cid + 2

}
