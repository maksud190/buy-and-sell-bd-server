const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();


// MiddleWares 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xngqds2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err);
            return res.status(403).send({ message: 'Your access forbidden' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {

    try {
        const categoryNameAndItemCollection = client.db('buyAndSellBd').collection('categoryNameAndItem');
        const myOrderCollection = client.db('buyAndSellBd').collection('myOrders');
        const usersCollection = client.db('buyAndSellBd').collection('users');
        const sellersCollection = client.db('buyAndSellBd').collection('sellers');


        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoryNameAndItemCollection.find(query).toArray();
            res.send(categories);
        });

        app.post('/categories', async (req, res) => {
            const addProduct = req.body;
            // console.log(myOrder);
            const result = await categoryNameAndItemCollection.insertOne(addProduct);
            res.send(result);
        })

        app.get('/categoryItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await categoryNameAndItemCollection.findOne(query);
            res.send(result);
        })

        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;

            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'Your access forbidden' });
            // }

            const query = { email: email };
            const myOrders = await myOrderCollection.find(query).toArray();
            res.send(myOrders);
        })

        app.get('/myOrders/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await myOrderCollection.findOne(query);
            res.send(result);
        })

        app.post('/myOrders', async (req, res) => {
            const myOrder = req.body;
            // console.log(myOrder);
            const result = await myOrderCollection.insertOne(myOrder);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // app.put('/users/admin/:id', verifyJWT, async (req, res) => {

        //     const decodedEmail = req.decoded.email;
        //     const query = { email: decodedEmail };
        //     const user = await usersCollection.findOne(query);
        //     if (user?.role !== 'admin') {
        //         return res.status(403).send({ message: 'Your access forbidden' });
        //     }

        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.delete('/users/:id', verifyJWT, async(req, res)=> {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/sellers', async (req, res) => {
            const query = {};
            const users = await sellersCollection.find(query).toArray();
            res.send(users);
        })

        app.post('/sellers', verifyJWT, async (req, res) => {
            const user = req.body;
            const result = await sellersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isUser: user?.uid === "225544" });
        })

        app.delete('/sellers/:id', verifyJWT, async(req, res)=> {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await sellersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token });
            }

            res.status(403).send({ accessToken: '' })
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