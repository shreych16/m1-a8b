let express = require("express");
let app = express();
const cors = require("cors");
app.use(express.json());
// app.use(cors)
app.options("*", cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow_Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept "
  );
  next();
});

const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let {Data} = require("./data.js");

app.get("/shops", function (req, res) {
    // console.log("Inside /shops get api");
    let arr1 = Data.shops;
  
    res.send(arr1);
  });

  app.post("/shops", function (req, res, next) {
    // console.log("Inside post of shops");
    let body = req.body;
    Data.shops.push(body);
    res.send(body);
  });

  app.get("/products", function (req, res, next) {
    // console.log("Inside /products get api");
    let arr1 = Data.products;
  
    res.send(arr1);
  });

  app.post("/products", function (req, res, next) {
    // console.log("Inside post of products");
    let body = req.body;
    Data.products.push(body);
    res.send(body);
  });

  app.put("/products/:id", function (req, res, next) {
    let productId = req.params.productId;
    let body = req.body;
    let index = Data.products.findIndex((st)=> st.productId === productId);
    if(index>=0){
    let updateProduct = {...body};
    Data.products[index] = updateProduct;
    res.send(updateProduct);
    }
    else 
        res.status(404).send("No Product Found");
  });

  app.get("/products/:id", function (req, res, next) {
    let id = req.params.productId;
    let product = Data.products.find(st=>st.productId===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.get("/purchases", function (req, res, next) {
    // console.log("Inside /purchases get api");
    let arr1 = Data.purchases;
    let sort = req.query.sort;
    let shop = req.query.shop;
    let product = req.query.product;
    
    
        arr1 = filterParam(arr1, "productid", product);
        arr1 = filterParam(arr1, "shopid", shop);
        if(sort==="QtyAsc") arr1.sort((st1,st2) => st1.quantity-st2.quantity);
        if(sort==="QtyDesc") arr1.sort((st1,st2) => st2.quantity-st1.quantity);
        if(sort==="ValueAsc") arr1.sort((st1,st2) => (st1.price*st1.quantity)-(st2.price*st2.quantity));
        if(sort==="ValueDesc") arr1.sort((st1,st2) => (st2.price*st2.quantity)-(st1.price*st1.quantity));
        res.send(arr1)
      
    
  });

  let filterParam = (arr, name, values) => {
    if (!values) return arr;
    let valuesArr = values.split(",");
    let arr1 = arr.filter((a1) => valuesArr.find((val) => +(val) === a1[name]));
    return arr1;
  };

  app.get("/purchases/shops/:id", function (req, res, next) {
    // console.log("Inside /purchases/shops/:id get api");
    let id = +req.params.id;
    let product = Data.purchases.find(st=>st.shopId===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.get("/purchases/products/:id", function (req, res, next) {
    // console.log("Inside /purchases/products/:id get api");
    let id = +req.params.id;
    let product = Data.purchases.find(st=>st.productid===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.post("/purchases", function (req, res, next) {
    // console.log("Inside post of purchases");
    let body = req.body;
    Data.products.push(body);
    res.send(body);
  });



