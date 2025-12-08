import Users from "../../../models/User";
import Connect from "../../../utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  const { name, email, password, habits, days, colors } = await request.json();
  console.log("trying to connect");
  await Connect();
  console.log("connected");
  // const existingUser = await Users.findOne({ email });
  // if (existingUser) {
  //   return new NextResponse("Email is already in use", { status: 400 });
  // }

  const hashedPassword = await bcrypt.hash(password, 5);
  const newUser = new Users({
    name,
    email,
    password: hashedPassword,
    habits,
    days,
    colors,
  });

  try {
    await newUser.save();
    return new NextResponse("User is registered", { status: 200 });
  } catch (err) {
    console.error("Error saving user:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
