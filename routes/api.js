'use strict';

async function getPrice(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  try {
    const res = await fetch(url);
    const info = await res.json();
    return info.latestPrice;
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stocks = req.query.stock;
      if (!Array.isArray(stocks)){
        stocks = [stocks];
      }

      let prices = [];
      for (let stock of stocks) {
        let price = await getPrice(stock)
        prices.push(price);
      }

      console.log(prices);
    });
    
};
