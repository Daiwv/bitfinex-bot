const BFX = require('bitfinex-api-node')

const API_KEY = ''
const API_SECRET = ''

const opts = {
  version: 2,
  transform: true
}

const bws = new BFX(API_KEY, API_SECRET, opts).ws

bws.on('open', () => {
  bws.subscribeTicker('IOTUSD')
  bws.subscribeOrderBook('IOTUSD')
  bws.subscribeTrades('IOTUSD')

})

bws.on('orderbook', (pair, book) => {
  // console.log('Order book:', book)
})

bws.on('trade', (pair, trade) => {
  // console.log('Trade:', trade)
})

bws.on('ticker', (pair, ticker) => {
  console.log('Ticker:', ticker)
})

bws.on('error', console.error)
