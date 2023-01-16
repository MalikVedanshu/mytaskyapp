import config from 'config';
import mongoose from "mongoose";

async function dbConnect() {

await mongoose.connect(config.get("mongo_uri"))
    try {
        console.log('DB taskapp is connected')
    }
    catch(err) {
        console.log('error while connecting to db');
    }
}

dbConnect();