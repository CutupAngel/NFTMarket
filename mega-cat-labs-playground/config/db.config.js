require('dotenv').config();

module.exports = {
url: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.ldaei.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
bkcnStagingUrl: `mongodb://${process.env.BKCN_STAGING_USER}:${process.env.BKCN_STAGING_PASS}@127.0.0.1:27000/?serverSelectionTimeoutMS=2000`
}