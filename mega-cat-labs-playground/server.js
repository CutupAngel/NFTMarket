require("dotenv").config();
const minimist = require("minimist");
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const tunnel = require('tunnel-ssh');
const mongoose = require('mongoose');
const app = express();
const User = require("./app/controllers/user.controller.js");
const Auth = require("./app/controllers/auth.controller.js");
const Product = require("./app/controllers/product.controller");
const Order = require("./app/controllers/order.controller");
const Offer = require("./app/controllers/offer.controller");
const MarketOrder = require("./app/controllers/market-order.controller");
const Card = require("./app/controllers/cards.controller");
const Role = require("./app/controllers/role.controller");
const isSuperAdmin = require("./app/middlewares/superAdmin");

const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const auth = require("./app/middlewares/auth");

//Cors Options
var corsOptions = {
    origin: "http://locahost:4200",
};

let options = minimist(process.argv);

//Connect to DB
const db = require("./app/models");
const localDevelopmentUrl =
    "mongodb://127.0.0.1:27017/megacat_db?directConnection=true&serverSelectionTimeoutMS=2000";
let stagingDevelopmentUrl = db.url;
const bookCoinStagingDevelopmentUrl = db.bkcnStagingUrl;

const environment = options['environment'] ? options['environment'] : 'development';
const useBookCoinStaging = environment == 'bkcn-staging';

if(useBookCoinStaging) {
    stagingDevelopmentUrl = bookCoinStagingDevelopmentUrl;
    establishSSHConnection();
} else {
    connectToMongoose();
}

function establishSSHConnection() {
    const fileLocation = './keys/bitnami-aws-483128128486.pem';
    const privateKey = fs.readFileSync(fileLocation);
    var config = {
        username: 'bitnami',
        privateKey: privateKey,
        host: '3.80.133.49',
        port:22,
        dstHost:'127.0.0.1',
        dstPort:27017,
        localHost:'127.0.0.1',
        localPort: 27000
      };

    var server = tunnel(config, function (error, server) {
        if(error){
            console.log("SSH connection error: " + error);
        }
        connectToMongoose();
    });
}

function connectToMongoose() {
    db.mongoose
    .connect(localDevelopmentUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => {
        console.log("Connected to the DB!");
        testDbConnection();
        startApp();
    })
    .catch((err) => {
        console.log("Cannot connect to the database", err);
        process.exit();
    });
}

function testDbConnection() {
    mongoose.connection.db.listCollections().toArray(function (err, names) {
        console.log('displaying collections from mongodb database')
        console.log(names); // [{ name: 'dbname.myCollection' }]
        module.exports.Collection = names;
    });
}

function startApp() {
    console.log('Firing up App!');
    // app.use(cors(corsOptions));
    // app.options('*', cors());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Methods",
            "POST, GET, PUT, DELETE, OPTIONS"
        );
        res.header(
            "Access-Control-Allow-Headers",
            "X-API-TOKEN, Content-Type, Authorization, Content-Length, X-Requested-With"
        );
        if ("OPTIONS" == req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(fileUpload());

    //Middleware for Token Authentication
    let authenticatedToken = (req, res, next) => {
        let header = req.headers.authorization;
        if (header) {
            let token = header.split(" ")[1];
            jwt.verify(token, "mega-cat-secret", (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    };

    //Routes
    app.get("/", (req, res) => {
        res.send({
            message: "Are you looking for what I think you're looking for? *cat wink behind frosted goggles*",
        });
    });

    app.post("/user/register", User.create);
    app.post("/auth/login", Auth.login);
    app.post("/auth/loginUserFirebase", Auth.loginUserFirebase);
    app.post("/auth/createUserFirebase", Auth.createUserFirebase);
    app.post("/auth/loginWithJwt", Auth.loginWithJwt);
    app.post("/auth/lookupEmail", Auth.lookupEmail);
    app.post("/user", authenticatedToken, User.findOne);
    app.post("/user/updateAvatar", auth, User.updateAvatar);
    app.post("/user/removeAvatar", auth, User.removeAvatar);
    app.post("/user/updateEmail", auth, User.updateEmail);
    app.post("/cards/create", auth, Card.create);
    app.get("/cards/index", auth, Card.index);
    app.post("/user/updatePassword", auth, User.updatePassword);
    app.post("/user/updateProfile", auth, User.updateProfile);
    app.get("/product/getNFtMedata/:id", Product.getNFtMedata);
    app.get("/product/nft/:contractAddress/:tokenId", Product.getNftMetadataByContract);
    app.get("/product/getStats", Product.getStats);
    app.post("/product/offerTxApprove", Product.offerTxApprove);
    app.post("/product/offerSignature", Product.offerSignature);
    app.post("/product/createSaleOffer", Product.createSaleOffer);
    app.get("/product/listSaleOffers", Product.listSaleOffers);
    app.get("/product/offer/:offerId", Product.getSpecificSaleOffer);
    app.post("/product/create", Product.create);
    app.post("/product/editOffer", Product.editOffer);
    app.post("/product/cancelOffer", Product.cancelOffer);
    app.post("/product/updateMeta",Product.editMetadata);
    app.post("/product/createCollection", Product.createCollection);
    app.post("/product/getCollections",Product.getCollections);
    app.get("/product/list", Product.findAll);
    app.post("/product/:id", Product.update);
    app.get("/product/:id", Product.findOne);
    app.get("/product/token/:id", Product.findByTokenId);
    app.delete("/product/:id", Product.delete);
    app.get("/product/getNFTsBasedOnWalletAddress/:walletAddress", Product.getNFTsBasedOnWalletAddress);
    app.post("/order/create", Order.create);
    app.get("/order/index", Order.index);
    app.post("/offer/create", Offer.create);
    app.get("/offer", Offer.index);
    app.post("/marketorder/create", MarketOrder.create);
    app.get("/marketorder", MarketOrder.index);

    app.post("/role/admin",[authenticatedToken,isSuperAdmin], Role.setAsAdmin);
    app.post("/role/user",[authenticatedToken, isSuperAdmin], Role.setAsUser);
    app.get("/role/getAdmins", [authenticatedToken,isSuperAdmin], Role.getAllAdmins);
    app.post("/role/getUsers", [authenticatedToken, isSuperAdmin], Role.getAllUsers);
    app.get("/payouts/pending", [authenticatedToken, isSuperAdmin], Role.getAllPendingPayouts);
    app.post("/payouts/approve",[authenticatedToken, isSuperAdmin], Role.approvePayout);
    app.post("/payouts/walletAddress", [authenticatedToken, isSuperAdmin], Role.getPayoutsByAddress);

    var nftRouter = require("./app/controllers/nft-manager.js");
    app.use("/blockchain", nftRouter);

    //Listen to requests
    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}
