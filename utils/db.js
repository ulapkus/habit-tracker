import mongoose from "mongoose";

const Connect = async () => {
  try {
    console.log("trying to connect to MongoDB", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

export default Connect;
