'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

// connect to DB
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

// schema model
let stockSchema = new mongoose.Schema({
  stock: String,
  likes: Number
})

let Stock = mongoose.model('Stock', stockSchema);

// function to get stock price from url
async function getPrice(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  try {
    const res = await fetch(url);
    const info = await res.json();
    return info.latestPrice;
  } catch (err) {
    return false;
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      // get stocks
      let stocks = req.query.stock;

      // make sure stocks is inputted and make into array
      if (stocks === undefined) {
        return res.json({error: 'Missing stock symbol'})
      }
      if (!Array.isArray(stocks)){
        stocks = [stocks];
      }

      // go through each stock
      let stockData = [];
      for (let stock of stocks) {

        // find price
        let price = await getPrice(stock);
        if (!price) {
          return res.json({error: "One or more stock symbols could not be found"});
        }

        // find # of likes
        let likes = 0;
        Stock.findOne({stock}, (err, data) => {
          if (err) return console.log(err);
          // make new data if not already existing
          if (!data) {
            let newStock = new Stock({
              stock,
              likes
            });
            newStock.save((err) => {
              if (err) return console.log(err);
            });
          } else {
            likes = data.likes;
          }
        });

        // add new like
        if (req.query.like) {
          likes += 1;
        }

        // push to array
        stockData.push({
          stock,
          price,
          likes
        })
      }

      // format
      if (stockData.length == 1) {
        stockData = stockData[0];
      }

      // output
      return res.json({stockData});
    });
    
};
