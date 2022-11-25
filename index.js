const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();


// MiddleWares 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xngqds2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){

    try{
        const categoryNameAndItemCollection = client.db('buyAndSellBd').collection('categoryNameAndItem')

        app.get('/categories', async(req, res)=> {
            const query = {}
            const categories = await categoryNameAndItemCollection.find(query).toArray();
            res.send(categories);
        })
    }

    finally{

    }

}

run().catch(console.log);



app.get('/', async(req, res)=> {
    res.send('Buy and Sell server is Running');
})

app.listen(port, () => console.log(`Buy and Sell server is Running ${port}`));