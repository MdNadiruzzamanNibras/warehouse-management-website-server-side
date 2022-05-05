const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express());


app.get('/', (req,res)=>{
    res.send('warehouse server running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydash.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db('warehouse').collection('inventory')

        app.get('/inventory', async(req,res)=>{
            const qurey  = {}
            const cursor =  inventoryCollection.find(qurey)
            const inventories = await cursor.toArray()
            res.send(inventories)
        })

        app.get('/inventory/:id', async(req,res)=>{
            const id = req.params.id
            const qurey = {_id: ObjectId(id)}
            const inventory = await inventoryCollection.findOne(qurey)
            res.send(inventory)
        })
    }
    finally{

    }

}
run().catch(console.dir)
app.listen(port, ()=>{
    console.log('warehouse the server', port)
})