
const mongoose = require('mongoose');

const CardSchema = mongoose.Schema({
        cardId: { type: String },
        cardNumber: { type: String },
        expMonth: { type: Number },
        expYear: { type: Number },
        csv: { type: String },
        userId: { type: String },
    },
    {
        timestamps: true,
    }
);

const Card = mongoose.model('card', CardSchema);
module.exports = Card;