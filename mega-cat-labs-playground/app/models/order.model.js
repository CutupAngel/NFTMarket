module.exports = (mongoose) => {
    const Order = mongoose.model(
        "order",
        mongoose.Schema(
            {
                sellerAddress: { type: String },
                buyerAddress: { type: String },
                nftId: { type: String },
                nftName: { type: String },
                nftImage: { type: String },
                tokenId: { type: String },
                nftPrice: { type: Number }
            },
            {
                timestamps: true,
            }
        )
    );

    return Order;
};
