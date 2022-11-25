const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();


// MiddleWares 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xngqds2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        const categoryNameAndItemCollection = client.db('buyAndSellBd').collection('categoryNameAndItem');
        const myOrderCollection = client.db('buyAndSellBd').collection('myOrders');
        const usersCollection = client.db('buyAndSellBd').collection('users');


        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoryNameAndItemCollection.find(query).toArray();
            res.send(categories);
        });

        app.get('/categoryItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await categoryNameAndItemCollection.findOne(query);
            res.send(result);
        })

        app.get('/myOrders', async(req, res)=> {
            const email = req.query.email;
            const query = {email: email};
            const myOrders = await myOrderCollection.find(query).toArray();
            res.send(myOrders);
        })

        app.post('/myOrders', async(req, res)=> {
            const myOrder = req.body;
            // console.log(myOrder);
            const result = await myOrderCollection.insertOne(myOrder);
            res.send(result);
        })

        app.post('/users', async(req, res)=> {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    }

    finally {

    }

}

run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Buy and Sell server is Running');
})

app.listen(port, () => console.log(`Buy and Sell server is Running ${port}`));