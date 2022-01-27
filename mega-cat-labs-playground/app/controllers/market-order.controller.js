const mongoose = require("mongoose");
const db = require("../models");
const MarketOrder = db.marketOrder;

async function create(req, res) {
  let order = req.body;

  order.userId = new mongoose.Types.ObjectId(order.userId);

  const referencedListings = order.listings.map((listing) => {
    return new mongoose.Types.ObjectId(listing);
  });
  order.listings = referencedListings;

  let dbMarketOrder = new MarketOrder(order);

  try {
    await dbMarketOrder.save();
    res.status(200).json({
      message: "Order successfully created!",
      data: dbMarketOrder
    });
  } catch (error) {
    res.status(400).json({
      error
    });
  }
};

async function index(req, res) {
  try {
    let orders = await MarketOrder
      .find()
      .populate('userId') // Hydrate user object.
      .populate('listings');
    res.status(200).json({
      message: 'Market Orders exist!',
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      error
    });
  }
}

module.exports = {
  create,
  index
};
