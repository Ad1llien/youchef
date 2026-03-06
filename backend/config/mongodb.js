// import mongoose from "mongoose";

// const connectDB = async () => {
//      mongoose.connection.on('connected', ()=> console.log("Database Connected"))
//    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
// };

// export default connectDB;
import dns from 'dns';

import dotenv from "dotenv";

import mongoose from "mongoose";

dotenv.config();
const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}`,
      {
        family: 4, // ensures IPv4 resolution
      }
    );
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
