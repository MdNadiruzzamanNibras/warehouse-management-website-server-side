const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJwt (req, res, next){
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    console.log('insidejwt', authHeader);
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded
    next()
})
}

app.get('/', (req,res)=>{
    res.send('warehouse server running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydash.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db('warehouse').collection('inventory')
        app.post('/login', async(req,res)=>{
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN,{
                expiresIn:'1d'
            })
            res.send({accessToken})
        })


        app.get('/inventory', async(req,res)=>{
            const qurey  = {}
            const cursor =  inventoryCollection.find(qurey)
            const inventories = await cursor.toArray()
            res.send(inventories)
        })
        app.post('/inventory', async(req,res)=>{
            const newInventory = req.body
            console.log(newInventory);
            const result = await inventoryCollection.insertOne(newInventory)
            res.send(result)
        })
        app.get('/myItem',verifyJwt, async(req,res)=>{
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if(email === decodedEmail)
            console.log(email);
           { const qurey = {email: email}
            const cursor = inventoryCollection.find(qurey)
            const myItem = await cursor.toArray()
            res.send(myItem)}
        })

        app.get('/inventory/:id', async(req,res)=>{
            const id = req.params.id
            const qurey = {_id: ObjectId(id)}
            const inventory = await inventoryCollection.findOne(qurey)
            res.send(inventory)
        })
        app.delete('/inventory/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        
        })
        app.delete('/myItem/:id', async(req,res)=>{
            const id = req.params.id
            console.log(id);
            const query = {_id: ObjectId(id)}
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        
        })

    }
    finally{

    }

}
run().catch(console.dir)
app.listen(port, ()=>{
    console.log('warehouse the server', port)
})