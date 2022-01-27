const mongoose = require('mongoose');
const db = require("../models");
const Order = db.orders;
const Payout = db.payout;
const { buyOffer } = require("../utils/venlyUtils");
require('dotenv').config();
const Offer = db.offer;

exports.create = async (req, res) => {
    let atLeastOneFailure = false;
    try {
      let items = JSON.parse(req.body.items);

      const allOffers = Promise.all(items.map(async (item)=> {
           // TODO: Wrap all items up into single Order...
             console.log('item', item);
            let order = new Order({
                nftId: item._id,
                nftName: item.name,
                nftPrice: item.price,
                nftImage: item.image,
                tokenId: item.tokenId,
                sellerAddress: item.sellerAddress,
                buyerAddress: req.body.walletAddress
            });
            await order.save(); 
           let data = {
             offerId: item._id,
             walletAddress : req.body.walletAddress,
             username : req.body.userName,
           }

           const promise = buyOffer(data);
           const platformFee = process.env.PLATFORM_FEE;
           console.log("order id for payout is: "+order._id);
           let payout = new Payout({
            nftId : item._id,
            nftName : item.name,
            nftPrice : item.price,
            platformFee : (platformFee * 100),
            payoutAmount : (item.price - (item.price * platformFee)),
            sellerAddress : item.sellerAddress,
            nftImage : item.image,
            offerId : item._id,
            order : new mongoose.Types.ObjectId(order._id)
           });
           await payout.save();
           return promise;
         }));

      let buyOffers = await allOffers;

      buyOffers.forEach((offerResult) => {
        if(!offerResult.success) {
          atLeastOneFailure = true;
        }
      });

      if(atLeastOneFailure) {
        res.status(400).json({
          message: "One or more items failed.",
          data: buyOffers
        });
      } else {
        res.status(200).json({
          message: "Order successfully created and offers available",
          data: buyOffers
        });
      }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

// Get all orders of a usr
exports.index = async (req, res) => {
    try {
        let orders = await Order.find();
        res.status(200).json({
            data: orders,
        });
    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
};
