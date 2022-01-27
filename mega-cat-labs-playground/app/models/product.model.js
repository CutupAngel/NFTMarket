const { isInteger } = require("lodash");

module.exports = mongoose => {
    const Product = mongoose.model(
        'product', 
        mongoose.Schema(
            {
                name: String,
                description: String,
                contractAddress: String,
                // tokenId: { type: String, required: true},
                blockchain: String,
                // metadataStatus: String,
                properties: Array,
                image: String,
                templateId : Number,
                tokenId : Number
                // price: Number
            },
            {
                timestamps: true
            }
        )
    );
    return Product;
};