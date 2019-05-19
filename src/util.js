const exec = require('child_process').exec;
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const ShoppingCart = require("../src/ShoppingCart");
const ShoppingCartItem = require("../src/ShoppingCartItem");

// const dbUrl = "mongodb://127.0.0.1:27017/monolithDB";
const dbUrl = "mongodb://10.0.0.166:27017/cartDB";
const userUrl = "http://127.0.0.1:3001";
const productUrl = "http://127.0.0.1:3002";
const shoppingCartCollectionName="shoppingCart";

let hostname = "unknown_host";
let mongodbConn=null;


setHostname();
//wait one second until mongoDB has started properly, before retrieving DB connection
setTimeout(prepareDatabase,1000);

function getDatabaseConnection(callback) {
    if (mongodbConn == null) {
        MongoClient.connect(dbUrl, function (err, connection) {
            assert.equal(null, err);
            mongodbConn = connection;
            console.log("Retrieved new MongoDB Connection");
            callback(mongodbConn);
        });
    } else {
        callback(mongodbConn);
    }
}

function getDatabaseCollection(collectionName, callback){
    getDatabaseConnection(function(conn){
        var collection = conn.collection(collectionName);
        callback(collection);
    })
}

function prepareDatabase() {
    getDatabaseConnection(function(connection) {
            connection.dropDatabase();
            console.log("Dropped DB");
            mongodbConn = connection;
            //populateDB();
        }
    );
}

function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

function setHostname(){
    exec('hostname', function (error, stdOut) {
        hostname = stdOut.trim();
        console.log("Hostname set to: "+hostname);
    });
}
function getHostname(){
    return hostname;
}

function populateDB() {
    let cartCollection;
    let nextCartUserId=0;

//--------insert Shopping Carts--------
    getDatabaseCollection(shoppingCartCollectionName, function (collection) {
        cartCollection = collection;
        insertNextShoppingCart()
    });

    function insertNextShoppingCart(){
        if(nextCartUserId < 100){
            let randomProduct = Math.floor((Math.random() * 99)).toString();
            let randomQty = Math.floor((Math.random() * 10));
            let cartItem = new ShoppingCartItem(randomProduct,randomQty);
            let cart = new ShoppingCart(nextCartUserId.toString(),[cartItem]);
            cartCollection.insertOne({
                shoppingCart: cart
            }, function (err, res) {
                nextCartUserId++;
                insertNextShoppingCart();
            });
        }else{
            console.log("Shopping Carts inserted");
        }
    }
}


module.exports = {
    getDatabaseConnection: getDatabaseConnection,
    getDatabaseCollection: getDatabaseCollection,
    prepareDatabase: prepareDatabase,
    setHostname: setHostname,
    getHostname: getHostname,
    shoppingCartCollectionName: shoppingCartCollectionName,
    userUrl: userUrl,
    productUrl: productUrl
};
