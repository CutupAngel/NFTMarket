const db = require("../models");
const { uploadFile, getUrl } = require("./../utils/fileUpload");
const mongoose = require("mongoose");
const Product = db.products;
const User = db.users;
const Collection = db.collections;
const MEGACAT_STUDIOS_SELLER_ID = 'b53930fb-5cb3-4e2c-81a4-f50226e4ef67';

const {
    createTokenType,
    createToken,
    getTokensByWalletAddress,
    getAllNFTsForWalletAddress,
    createOfferSale,
    getPrepareTransaction,
    addOfferTxApprove,
    addOfferSignature,
    getNFTsByStatus,
    retrieveNftMetadata,
    retrieveNftMetadataByAddressAndId,
    editMetadata,
    createCollection,
    getCollectionAddress,
    editOffer,
    cancelOffer
} = require("../utils/venlyUtils");
const axios = require("axios");
const { collections } = require("../models");
const { Iot } = require("aws-sdk");
require("dotenv").config();

// Create and Save a new Product
exports.create = async (req, res) => {
    try {
        const images = [];
        let image = null;

        if(req.files.images.length == undefined){
            const result = await uploadFile(req.files.images);
            image = result.Location;
        }else{
            for (let i = 0; i < req.files.images.length; i++) {
                const result = await uploadFile(req.files.images[i]);
                image = result.Location;
                let media = {
                    'type': 'image',
                    'value': result.Location
                }
                images.push(media);
            }
        }



        let productData = {
            name: req.body.name,
            description: req.body.description,
            image: image,
            attributes: JSON.parse(req.body.properties),
            media: images
        };
        let templateId;
        if(req.body.collectionId){
            templateId = await createTokenType(productData, req.body.collectionId);
        }else {
            templateId = await createTokenType(productData, null);
        }

        if(templateId == null) {
          res.status(500).json({
            error: "Failed to create template for NFT; cannot mint the actual NFT.",
          });
        }

        let data = {
            id: templateId,
            walletAddress: req.body.walletAddress,
            supply : req.body.supply
        };
        let NFTProduct;
        if(req.body.collectionId){
             NFTProduct = await createToken(data, req.body.collectionId);
        }else {
             NFTProduct = await createToken(data,null );
        }



        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            properties: JSON.parse(req.body.properties),
            image: image,
            templateId : templateId,
            tokenId : NFTProduct[0].tokenIds[0],
            venly: NFTProduct[0]
        });

        // TODO: Add creator information.
        let createdProduct = await product.save();


        res.status(200).json({
            message: "Product was successfully created!",
            data: NFTProduct,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};


exports.createCollection = async (req,res) => {
    try {
        console.log(req.body);
        const images = [];
        let image = null;

        if(req.files.images.length == undefined){
            const result = await uploadFile(req.files.images);
            image = result.Location;
        } else {
            for (let i = 0; i < req.files.images.length; i++) {
                const result = await uploadFile(req.files.images[i]);
                image = result.Location;
                let media = {
                    'type': 'image',
                    'value': result.Location
                }
                images.push(media);
            }
        }

        let data = {
            name : req.body.name,
            description : req.body.description,
            chain: "MATIC",
            symbol : req.body.symbol,
            image : image,
            media : [{
                type : "image",
                value : image
            }],
            externalUrl : image
        };
        let contractData = await createCollection(data);
        let contractAddress = await getCollectionAddress(contractData.id);
        let collection = new Collection ({
            name : req.body.name,
            ownerAddress : req.body.walletAddress,
            collectionId : contractData.id,
            contractAddress : contractAddress
        });
        await collection.save();

        let responseBody = {
          collection: contractData,
          additional: contractAddress
        }

        res.status(200).send(responseBody);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error,
        });
    }
}

exports.getCollections = async (req,res) => {
    console.log("in get collections");
    try {
        let collections = await Collection.find({ownerAddress : req.body.walletAddress});
        if(collections){
            res.status(200).json({
                collections: collections,
            });
        }else {
            res.status(400).json({
                error: "no collections found",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error,
        });
    }
}

exports.editMetadata = async (req,res) => {
    try {
        let product = await Product.findOne({templateId : req.body.id});
        const images = [];
        let image = null;

        if(req.files.images.length == undefined){
            const result = await uploadFile(req.files.images);
            image = result.Location;
        }else{
            for (let i = 0; i < req.files.images.length; i++) {
                const result = await uploadFile(req.files.images[i]);
                image = result.Location;
                let media = {
                    'type': 'image',
                    'value': result.Location
                }
                images.push(media);
            }
        }



        let productData = {
            name: req.body.name,
            description: req.body.description,
            image: image,
            attributes: JSON.parse(req.body.properties),
            media: images
        };
        let data = {
            templateId : req.body.id,
            product : productData
        };
        let meta = await editMetadata(data);
        if(product){
            product.name = req.body.name;
            product.description = rew.body.description;
            product.image = image,
            product.attributes = JSON.parse(req.body.properties);
            product.save();
        }

        res.status(200).json({
            message: "Metadata successfully updated!",
            data: meta,
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
}

// Find a single Product with an id
exports.findByTokenId = async (req, res) => {
    try {
        let product = await Product.findOne({tokenId : req.body.id});
        if(product){
            res.status(200).json({
                data: product,
            });
        }else {
            res.status(400).json({
                error: "product details not found",
            });
        }

    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
};

// Retrieve all Products from the database.
exports.findAll = async (req, res) => {
    const filterQuery = {};
    if (req.query.date != "null") {
        filterQuery.createdAt = req.query.date;
    }
    if (req.query.price != "null") {
        filterQuery.price = req.query.price;
    }

    const searchQuery = {};
    if (req.query.search) {
        searchQuery.name = { $regex: req.query.search, $options: "i" };
    }

    try {
        let products = await Product.find(searchQuery).sort(filterQuery);
        res.status(200).json({
            data: products,
        });
    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
};

// Find a single Product with an id
exports.findOne = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        res.status(200).json({
            data: product,
        });
    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
};

// Update a Product by the id in the request
exports.update = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        let url = product.image;
        if (req.files) {
            const result = await uploadFile(req.files.image);
            url = await getUrl(req.files.image);
        }
        let updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                tokenId: req.body.tokenId,
                metadataStatus: req.body.metadataStatus,
                properties: JSON.parse(req.body.properties),
                image: url,
                price: req.body.price,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.id,
            });
        } else {
            res.status(200).json({
                data: updatedProduct,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

// Delete a Product with the specified id in the request
exports.delete = async (req, res) => {
    try {
        let product = await Product.findByIdAndRemove(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.id,
            });
        }
        res.send({ message: "Product deleted successfully!" });
    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
};

// Get all NFTS based on wallet address.
exports.getNFTsBasedOnWalletAddress = async (req, res) => {
    try {
        // let nfts = await getTokensByWalletAddress(req.params.walletAddress);
        let nfts = await getAllNFTsForWalletAddress(req.params.walletAddress); 
        res.status(200).json({
            data: nfts,
        });
    } catch (error) {}
};

exports.createSaleOffer = async (req, res) => {
    try {
        const { tokenId, address, sellerAddress, price } = req.body;
        let data = {
            tokenId,
            address,
            sellerAddress,
            price,
        };
        let result = await createOfferSale(data);
        let transactionData = await getPrepareTransaction(result.result.id);
        let resData = {
            transaction: transactionData.result,
            offerId: result.result.id,
        };

        res.status(200).json({
            message: "Offer was successfully created!",
            data: resData,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

exports.listSaleOffers = async (req, res) => {
    try {
        let offers = null;

        const statusFilter = 'SOLD,READY,FINALIZING_OFFER,AWAITING_FINALIZING_OFFER'
        await axios.get(
          `${process.env.MARKET_API_ENDPOINT}/offers?sellerId=${MEGACAT_STUDIOS_SELLER_ID}&status=${statusFilter}`,
          { headers: { "Content-Type": "application/json" } })
            .then((response) => {
                offers = response.data.result;
            })
            .catch((error) => console.log("error", error));

        res.status(200).json({
            message: "Offers was successfully get!",
            data: offers,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

exports.getSpecificSaleOffer = async (req, res) => {
    try {
        let offer = null;
        await axios
            .get(
                `https://api-staging.arkane.market/offers/${req.params.offerId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                offer = response.data.result;
            })
            .catch((error) => console.log("error", error));

        res.status(200).json({
            message: "Offer was successfully get!",
            data: offer,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

exports.offerTxApprove = async (req, res) => {
    try {
        let data = {
            offerId: req.body.offerId,
            transactionHash: req.body.hash,
        };
        let result = await addOfferTxApprove(data);
        res.status(200).json({
            message: "Tax approved successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            error: error,
        });
    }
};

exports.offerSignature = async (req, res) => {
    try {
        let data = {
            offerId: req.body.offerId,
            dataToSign: req.body.dataToSign,
        };
        let result = await addOfferSignature(data);
        res.status(200).json({
            message: "Offer signature added successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            error: error,
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        let newNFTs = await getNFTsByStatus('NEW');
        let listedForSaleNFTs = await getNFTsByStatus('READY');
        let soldNFTs = await getNFTsByStatus('SOLD');
        let users = await User.count();
        let result = {
            new: newNFTs.length,
            sale: listedForSaleNFTs.length,
            sold: soldNFTs.length,
            users: users
        }
        res.status(200).json({
            message: "Stats fetched successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            error: error,
        });
    }
}

exports.getNFtMedata = async (req, res) => {
    try {
        let result = await retrieveNftMetadata(req.params.id);
        res.status(200).json({
            message: "Metadata get successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            error: error,
        });
    }
};

exports.getNftMetadataByContract = async (req, res) => {
    try {
        let result = await retrieveNftMetadataByAddressAndId(req.params.contractAddress, req.params.tokenId);
        res.status(200).json({
            message: "Metadata get successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            error: error,
        });
    }
};

exports.editOffer = async (req, res) => {
    if(!req.body.price && !req.body.offerId){
        return res.status(400).json({
            error: "Invalid request parameters",
        });
    }
    try {
        let response = await editOffer({
            offerId : req.body.offerId,
            price : req.body.price.toString()
        });
        if(!response.success) {
            return res.status(400).json ({error : "failed to edit offer"});
        }else {
            return res.status(200).json({data : response});
        }
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};

exports.cancelOffer = async (req, res) => {
    if(!req.body.offerId){
        return res.status(400).json({
            error: "Invalid request parameters",
        });
    }
    try {
        let response = await cancelOffer({
            offerId : req.body.offerId,
        });
        if(!response.success) {
            return res.status(400).json ({error : "failed to cancel offer"});
        }else {
            return res.status(200).json({data : response});
        }
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};

