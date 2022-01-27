const dbConfig = require('../../config/db.config.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.bkcnStagingUrl = dbConfig.bkcnStagingUrl;
db.products = require('./product.model')(mongoose);
db.orders = require('./order.model')(mongoose);
db.collections = require('./collection')(mongoose);
db.users = require('./user.model.js');
db.offer = require('./offer.model');
db.marketOrder = require('./market-order.model');
db.card = require('./card.model');
db.payout = require('./payout')(mongoose);
module.exports = db;
