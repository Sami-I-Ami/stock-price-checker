const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

// Clear data before running tests
suite('Functional Tests', function() {
    test('Viewing one stock', function(done) {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isObject(res.body.stockData);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.exists(res.body.stockData.price);
                assert.exists(res.body.stockData.likes);
                done();
            })
    });
    test('Viewing one stock and liking it', function(done) {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isObject(res.body.stockData);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.exists(res.body.stockData.price);
                assert.equal(res.body.stockData.likes, 1);
                done();
            })
    });
    test('Viewing one stock and liking it again', function(done) {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isObject(res.body.stockData);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.exists(res.body.stockData.price);
                assert.equal(res.body.stockData.likes, 1);
                done();
            })
    });
    test('Viewing two stocks', function(done) {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0].stock, "GOOG");
                assert.exists(res.body.stockData[0].price);
                assert.equal(res.body.stockData[0].rel_likes, 1);
                assert.equal(res.body.stockData[1].stock, "MSFT");
                assert.exists(res.body.stockData[1].price);
                assert.equal(res.body.stockData[1].rel_likes, -1);
                done();
            })
    });
    test('Viewing two stocks and liking them', function(done) {
        chai
            .request(server)
            .keepOpen()
            .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0].stock, "GOOG");
                assert.exists(res.body.stockData[0].price);
                assert.equal(res.body.stockData[0].rel_likes, 0);
                assert.equal(res.body.stockData[1].stock, "MSFT");
                assert.exists(res.body.stockData[1].price);
                assert.equal(res.body.stockData[1].rel_likes, 0);
                done();
            })
    });
});
