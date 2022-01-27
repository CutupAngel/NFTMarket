# Mega Cat Labs Playground

This project is the backend API for Mega Cat Labs Marketplace.

## Getting Started

1. Start backend server (in separate terminal)
```javascript

// 1A Use Staging MongoDB
// Do nothing; its already setup for this.

// 1B (Optional) Setup local MongoDB
mkdir db && mkdir logs
mongod --fork --logpath ./logs/log --dbpath ./db

// Run Backend REST API
npm run start

// Run Backend against Mega Cat Lab's staging environment
npm run staging

// Run backend against BookCoin's staging environment
npm run bkcn-staging
```

## Deploying to Heroku
```
git push heroku main
```