const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//aita middleware er jonne
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.80mhkmu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // get all product from from data base for assignment 12
    // =======================================================
    const allProductCollection = client.db("tech12").collection("techProduct");
    const allUsersCollection = client.db("tech12").collection("users");
    const allAdminCollection = client.db("tech12").collection("adminar");

    app.get('/techProduct', async (req, res) => {
      const page = parseInt(req.query.page); // Use 'req.query' to access query parameters
      const size = parseInt(req.query.size);
      console.log(page, size);
    
      const result = await allProductCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
    
      res.send(result);
    });


    // For upvote add
    app.post('/techProduct/:id', async (req,res) =>{
      const {id} = req.params;
      const {user,email} = req.body;
      const upvotedOn = new Date();
      console.log(id);
      console.log(req.body);
    
    try{
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const update = {
        $push:{
          upvote: {
            user: user,
            email: email,
            upvotedOn: upvotedOn,
          }
        }
      };
      const result = await allProductCollection.updateOne(filter, update, options);
      res.send(result);

    }
    catch(error){
      console.error("Error Adding Upvote:", error);
      res.status(500).send("Server Error");
    }
  });

// Get product details by ID
// ===================================
app.get('/techProduct/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await allProductCollection.findOne(query);
  res.send(result);
});


// add new review
// =======================================
 app.post('/techProduct/:id/addReview', async (req,res) => {
  const { id } = req.params;
  const { username, comment, rating, photoURL } = req.body;
  const timestamp = new Date();
  
  console.log(req.body);
  console.log(id);

try {
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true};
  const update = {
    $push: {
      reviews: {
        name: username,
        comment: comment,
        rating: rating,
        photoURL: photoURL,
        timestamp: timestamp
      }
    }
  };
  const result = await allProductCollection.updateOne(filter, update, options);
  res.send(result);

}
catch(error){
  console.error("Error Adding Upvote:", error);
  res.status(500).send("Server Error");
}
});

app.get('/productsCount', async(req, res) => {
  const count = await allProductCollection.estimatedDocumentCount();
res.send({count});
})

// Add new product
app.post('/techProduct', async(req, res) =>{
  const newProduct = req.body;
  console.log(newProduct);
  const result = await allProductCollection.insertOne(newProduct);
  res.send(result);
})

// delete products
// ============================
app.delete('/techProduct/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await allProductCollection.deleteOne(query);
  res.send(result);
})

// Update products 
// ===================================
app.put('/techProduct/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true};

  const updatedProduct = req.body;
  const product = {
      $set: {
        productName: updatedProduct.productName, 
        externalLinks: updatedProduct.externalLinks, 
        category: updatedProduct.category,
        tags: updatedProduct.tags, 
        productDetails: updatedProduct.productDetails, 
        OwnerEmail: updatedProduct.OwnerEmail,
        productOwner: updatedProduct.productOwner,
        image: updatedProduct.image
      }
  }
    const result = await allProductCollection.updateOne(filter, product, options)
    res.send(result);
})

//  add user to server
// ==========================
// app.post('/users', async(req, res) =>{
//   const newUser = req.body;
//   console.log(newUser);
//   const result = await allUsersCollection.insertOne(newUser);
//   res.send(result);
// })


// user related api
// ==============================
app.post('/users', async (req, res) => {
  const user = req.body;
  const query = {email: user.email}
  const existingUser = await allUsersCollection.findOne(query);
  if(existingUser){
    return res.send({message: 'user already exists', insertedId:null})
  }

  const result = await allUsersCollection.insertOne(user);
  res.send(result);
})

// get users data from server
// ===========================
app.get('/users', async(req, res) =>{
  const cursor = allUsersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// delete users data from server
// ===================================
app.delete('/users/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await allUsersCollection.deleteOne(query);
  res.send(result);
})

// get Admin api
// ============================
app.get('/adminar', async(req, res) =>{
  const cursor = allAdminCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// update user role 
// ============================
app.put('/users/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true};

  const updatedUser = req.body;
  const users = {
      $set: {
        role: updatedUser.role, 

      }
  }
    const result = await allUsersCollection.updateOne(filter, users, options)
    res.send(result);
})

// get an user by id
// ========================
app.get('/users/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await allUsersCollection.findOne(query);
  res.send(result);
});




// get productys by page number and size



//     const database = client.db("usersDB");
//     const userCollection = database.collection("users");

// app.get('/users', async(req, res) => {
//     const cursor = userCollection.find();
//     const result = await cursor.toArray();
//     res.send(result);
// })


//     app.post('/users', async(req, res) =>{
//         const user = req.body;
//         console.log('new user', user);
//         const result = await userCollection.insertOne(user);
//         res.send(result);
// });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


const productCollection = client.db("productsDB").collection("product");

    
    app.get('/product', async(req, res) =>{
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

app.get('/product/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await productCollection.findOne(query);
  res.send(result);
})



    app.post('/product', async(req, res) =>{
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })

app.put('/product/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true};

  const updatedProduct = req.body;
  const product = {
      $set: {
        name: updatedProduct.name, 
        brand: updatedProduct.brand, 
        price: updatedProduct.price,
        rating: updatedProduct.rating, 
        option: updatedProduct.option,
        description: updatedProduct.description, 
        image: updatedProduct.image
      }
  }
    const result = await productCollection.updateOne(filter, product, options)
    res.send(result);
})


app.get('/', (req, res) =>{
    res.send('SIMPLE CRUD IS RUNNING')
})

app.listen(port, () => {
    console.log(`SIMPLE CRUD iS running on port, ${port}`)
})