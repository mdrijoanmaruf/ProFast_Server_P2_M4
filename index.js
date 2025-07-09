const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${pass}@cluster0.0ykpaho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const db = client.db('proFast');
    const parcelCollection = db.collection('parcels')
    // All API

    // Post API - Create a new parcel
    app.post('/parcels', async (req, res) => {
      try {
        const parcelData = req.body;
        const result = await parcelCollection.insertOne(parcelData);
        res.send(result);
      } catch (error) {
        res.status(500).send(error);
      }
    })

    // Get API - Fetch all parcel data of user
    app.get('/parcels' , async (req , res) => {
      try{
        const userEmail = req.query.email;
        const query = userEmail ? {userEmail : userEmail} : {};

        const options = {
          sort : {createdAt : -1},
        }

        const parcels = await parcelCollection.find(query , options).toArray();
        res.send(parcels)
      }
      catch(error) {
        console.error("Error Fetching parcels : " , error);
        res.status(500).send({massage : "Failed to get Parcels"})
      }
    })

    // Delete API - Delete a parcel 
    app.delete('/parcels/:id' , async (req , res) => {
      try{
        const id = req.params.id;

        const result = await parcelCollection.deleteOne({_id: new ObjectId(id)})
        
        if (result.deletedCount > 0) {
          res.send({
            success: true,
            message: "Parcel deleted successfully",
            deletedCount: result.deletedCount
          });
        } else {
          res.status(404).send({
            success: false,
            message: "Parcel not found"
          });
        }
      }
      catch(error) {
        console.error("Error deleting parcel : " , error)
        res.status(500).send({
          success: false,
          message: "Failed to delete parcel"
        })
      }
    })

    // Get API - Fetch parcel data by id
    app.get('/parcels/:id' , async (req , res) => {
      try {
        const id = req.params.id;
        const parcel = await parcelCollection.findOne({_id: new ObjectId(id)});

        if(!parcel){
          return res.status(404).send({message : "Parcel Not Found"})
        }
        res.send(parcel)
      }
      catch(error){
        console.log(error)
      }
    })


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ProFast Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
