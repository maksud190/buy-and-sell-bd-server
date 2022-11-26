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


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('Unauthorized Access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Your access forbidden'});
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

        app.get('/myOrders', verifyJWT, async(req, res)=> {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'Your access forbidden'});
            }

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
        
        app.get('/jwt', async(req, res)=> {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            
            res.status(403).send({accessToken: ''})
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