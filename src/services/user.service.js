import userModel from "../models/user.js";

export const createUser = async ({ username, password, email }) => {
  if (!username || !password || !email) {
    throw new Error("All fields are required [username,password,email]");
  }
  const isUserExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserExist) {
    throw new Error("User already exists");
  }
  const hashedPassword = await userModel.hashPassword(password);

  const user = new userModel({ username, password: hashedPassword, email });
  await user.save();
  delete user._doc.password;
  return user;
};

export const loginUser = async ({ email, password }) => {

  if (!email || !password) {
    throw new Error("All fields are required [email,password]");
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid Credentials");
  }
  delete user._doc.password;
  return user;
};
