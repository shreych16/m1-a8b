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

const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let {Data} = require("./data");

app.get("/shops", function (req, res) {
    // console.log("Inside /shops get api");
    let arr1 = Data.shops;
    res.send(arr1);
  });

  app.post("/shops", function (req, res) {
    // console.log("Inside post of shops");
    let body = req.body;
    let maxid = Data.shops.reduce((acc,curr)=> (curr.shopid >= acc ? curr.shopid : acc),0);
    let newid = maxid+1;
    let newData = {shopid:newid, ...body};
    Data.shops.push(newData);
    res.send(newData);
  });

  app.get("/products", function (req, res) {
    // console.log("Inside /products get api");
    let arr1 = Data.products;
    res.send(arr1);
  });

  app.post("/products", function (req, res) {
    // console.log("Inside post of products");
    let body = req.body;
    let maxid = Data.products.reduce((acc,curr)=> (curr.productid >= acc ? curr.productid : acc),0);
    let newid = maxid+1;
    let newData = {productid:newid, ...body};
    Data.products.push(newData);
    res.send(newData);
  });

  app.put("/products/:id", function (req, res) {
    let id = +req.params.id;
    let body = req.body;
    let index = Data.products.findIndex((st)=> st.productid === id);
    if(index>=0){
    let updateProduct = {...body};
    Data.products[index] = updateProduct;
    res.send(updateProduct);
    }
    else 
        res.status(404).send("No Product Found");
  });

  app.get("/products/:id", function (req, res) {
    let id = +req.params.id;
    let product = Data.products.find(st=>st.productid===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.get("/purchases", function (req, res) {
    // console.log("Inside /purchases get api");
    let arr1 = Data.purchases;
    let sort = req.query.sort;
    let shop = req.query.shop;
    let product = req.query.product;
    
        arr1 = filterParam(arr1, "productid", product, Data.products);
        arr1 = filterParam2(arr1, "shopid", shop, Data.shops);
        if(sort==="QtyAsc") arr1.sort((st1,st2) => st1.quantity-st2.quantity);
        if(sort==="QtyDesc") arr1.sort((st1,st2) => st2.quantity-st1.quantity);
        if(sort==="ValueAsc") arr1.sort((st1,st2) => (st1.price*st1.quantity)-(st2.price*st2.quantity));
        if(sort==="ValueDesc") arr1.sort((st1,st2) => (st2.price*st2.quantity)-(st1.price*st1.quantity));
        res.send(arr1)
      
    
  });

  let filterParam = (arr, nam, values, arr2) => {
    if (!values) return arr;
    console.log(arr2);
    let valuesArr = values.split(",");
    console.log(valuesArr);
    let ar = arr2.filter((a1) => valuesArr.find((val) => val === a1.productname));
    console.log(ar);
    let arr1 = arr.filter((a1) => ar.find((val) => val.productid === a1[nam]));
    console.log(arr1);
    return arr1;
  };

  let filterParam2 = (arr, nam, values, arr2) => {
    if (!values) return arr;
    console.log(arr2);
    let valuesArr = values.split(",");
    console.log(valuesArr);
    let ar = arr2.filter((a1) => valuesArr.find((val) => val === a1.name));
    console.log(ar);
    let arr1 = arr.filter((a1) => ar.find((val) => val.shopid === a1[nam]));
    console.log(arr1);
    return arr1;
  };

  app.get("/purchases/shops/:id", function (req, res) {
    // console.log("Inside /purchases/shops/:id get api");
    let id = +req.params.id;
    let product = Data.purchases.filter(st=>st.shopid===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.get("/purchases/products/:id", function (req, res) {
    // console.log("Inside /purchases/products/:id get api");
    let id = +req.params.id;
    let product = Data.purchases.filter(st=>st.productid===id);
    if(product) res.send(product);
    else res.status(404).send("No product found");
  });

  app.get("/totalPurchases/shop/:id", function (req, res, next) {
    let id = +req.params.id;
    let filteredShops = Data.purchases.filter(st=>st.shopid===id);

    let aggregatedShops = filteredShops.reduce((result, purchase) => {
        const existingProducts = result.find(p => p.productid === purchase.productid && p.price === purchase.price);

        if (existingProducts) {
            existingProducts.totalQuantity += purchase.quantity;
            existingProducts.value += purchase.quantity * purchase.price;
        } else {
            result.push({
                productid: purchase.productid,
                totalquantity: purchase.quantity,
                value: purchase.quantity * purchase.price,
                price: purchase.price
            });
        }

        return result;
    }, []);

    const sorted = aggregatedShops.sort((a, b) => a.productid - b.productid);

    console.log(sorted);
    if(sorted) res.send(sorted);
    else res.status(404).send("Not found");
  });

  app.get("/totalPurchases/product/:id", function (req, res, next) {
    let id = +req.params.id;
    let filteredProducts = Data.purchases.filter(st=>st.productid===id);

    let aggregatedProducts = filteredProducts.reduce((result, purchase) => {
        const existingShops = result.find(p => p.shopid === purchase.shopid && p.price === purchase.price);

        if (existingShops) {
            existingShops.totalQuantity += purchase.quantity;
            existingShops.value += purchase.quantity * purchase.price;
        } else {
            result.push({
                shopid: purchase.shopid,
                totalquantity: purchase.quantity,
                value: purchase.quantity * purchase.price,
                price: purchase.price
            });
        }

        return result;
    }, []);

    const sorted = aggregatedProducts.sort((a, b) => a.shopid - b.shopid);

    console.log(sorted);
    if(sorted) res.send(sorted);
    else res.status(404).send("Not found");
  });


