'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// connect to DB
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// stock schema model
let stockSchema = new mongoose.Schema({
  stock: String,
  likes: Number,
  hashes: [String]
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

// hashing new ip for database
async function hashIP(ip, stock) {
  bcrypt.hash(ip, saltRounds, async (err, hash) => {
    if (err) return console.log(err);
    await Stock.findOneAndUpdate({stock}, {"$push": {"hashes": hash}}, {new: true});
  });
}

// finding if ip is in database
async function ipInDatabase(ip, stock) {
  const hashObj = await Stock.findOne({stock}, {hashes: 1, _id: 0});
  const hashes = hashObj.hashes;
  if (!hashes.length) {
    return false;
  }
  for (let hash of hashes) {
    if (await bcrypt.compare(ip, hash)) {
      return true;
    }
  }
  return false;
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
        let data = await Stock.findOne({stock});
        // make new data if not already existing
        if (!data) {
          let newStock = new Stock({
            stock,
            likes,
            hashes: []
          });
          await newStock.save();
        } else {
          likes = data.likes;
        }

        // add new like
        const inDatabase = await ipInDatabase(req.ip, stock);
        if (req.query.like == 'true' & !inDatabase) {
          await hashIP(req.ip, stock);
          await Stock.findOneAndUpdate({stock}, {$inc: {likes: 1}}, {new: true});
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
      } else {
        const like_diff = stockData[0].likes - stockData[1].likes;
        stockData[0] = {
          stock: stockData[0].stock,
          price: stockData[0].price,
          rel_likes: like_diff
        };
        stockData[1] = {
          stock: stockData[1].stock,
          price: stockData[1].price,
          rel_likes: like_diff * -1
        };
      }

      // output
      return res.json({stockData});
    });
    
};
