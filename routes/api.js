'use strict';

async function getPrice(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  try {
    const res = await fetch(url);
    const info = await res.json();
    return {
      result: info.latestPrice, 
      pass: true
    };
  } catch (err) {
    return {
      result: "", 
      pass: false
    };
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
        let {price, pass} = await getPrice(stock);
        if (!pass) {
          output = {error: "One or more stock symbols could not be found"};
          break;
        }
        prices.push(price);
      }

      console.log(prices);
    });
    
};
