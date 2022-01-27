module.exports = (mongoose) => {
    const Collection = mongoose.model(
        "collection",
        mongoose.Schema(
            {
                name : {type : String},
                ownerAddress: { type: String },
                collectionId: { type: String },
                contractAddress: { type: String },
            },
            {
                timestamps: true,
            }
        )
    );
    return Collection;
};
