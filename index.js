const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();


// MiddleWares 
app.use(cors());
app.use(express.json());

app.get('/', async(req, res)=> {
    res.send('Buy and Sell server is Running');
})

app.listen(port, () => console.log(`Buy and Sell server is Running ${port}`));