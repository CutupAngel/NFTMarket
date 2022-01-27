const mongoose = require("mongoose");
const db = require("../models");
const Card = db.card;

exports.create = async (req, res) => {
  try {
    let card = new Card({
        cardId: req.body.cardId,
        cardNumber: req.body.cardNumber,
        expMonth: req.body.expMonth,
        expYear: req.body.expYear,
        csv: req.body.csv,
        userId: req.user._id,
    });
    await card.save();

    res.status(200).json({
      message: "Card saved successfully!",
      data: card,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: err,
    });
  }
};

// Get all cards of a usr
exports.index = async (req, res) => {
  try {
    let cards = await Card.find({userId: req.user._id});
    res.status(200).json({
      data: cards,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
