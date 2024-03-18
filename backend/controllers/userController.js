import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";x

//Getting the credentials from the user
const createUser = asyncHandler(async (req, res) => {
     const {username, email, password} = req.body;

     //Checking the credentials
     if (!username || !email || !password)
     {
          throw new Error("Please fill all the fields!")
     }

     const userExists = await User.findOne({email})

     //Checking if the user already exists in the database
     if (userExists) res.status(400).send("User already exists");

     //Hash the user password
     const salt=await bcrypt.genSalt(10)
     const hashedPassword=await bcrypt.hash(password, salt)
     const newUser = new User({username, email, password: hashedPassword})

     try{
          await newUser.save()
          createToken(res, newUser._id)

          res.status(201).json({
               _id: newUser._id,
               username: newUser.username,
               email: newUser.email,
               isAdmin: newUser.isAdmin,
          });
     }
     catch (error)
     {
          res.status(400)
          throw new Error("Invalid user data")
     }
});

const loginUser = asyncHandler(async (req, res) => {
     const {email, password} = req.body //Getting the Email and Password

     const existingUser = await User.findOne({email}); //Checking if we already have that Email registered
     console.log(existingUser);

     if (existingUser) //If the Email is available
     {
          const isPasswordValid = await bcrypt.compare(password, existingUser.password) //Checking for password validation

          if (isPasswordValid) //If the password is valid
          {
               createToken(res, existingUser._id)
               
               res.status(201).json({
                    _id: existingUser._id,
                    username: existingUser.username,
                    email: existingUser.email,
                    isAdmin: existingUser.isAdmin,
               });
          }
          else
          {
               res.status(401).json({message: "Invalid Password!"});
          }
     }
     else
     {
          res.status(401).json({message: "User Not Found!"});
     }
});

const logoutCurrentUser = asyncHandler(async (req, res) => 
{
     res.cookie('jwt', '', {
          httpOnly: true,
          expires: new Date(0)
     })

     res.status(200).json({message: "Logged Out Successfully!"})
});

const getAllUsers = asyncHandler(async (req, res) => 
{
     const users = await User.find({}); //Getting list of all the users, can be accessed only by admin
     res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
     const user=await User.findById(req.user._id);
     console.log(user);

     if (user)
     {
          res.json(
          {
               _id: user._id,
               username: user.username,
               email: user.email,
          });
     } 
     else
     {
          res.status(404);
          throw new Error("User not found.");
     }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
     const user =  await User.findById(req.user._id)

     if (user)
     {
          user.username = req.body.username || user.username;
          user.email = req.body.email || user.email;

          if (req.body.password)
          {
               const salt = await bcrypt.genSalt(10);
               const hashedPassword = await bcrypt.hash(req.body.password, salt);
               user.password = hashedPassword;
          }

          const updatedUser = await user.save();

          res.json(
          {
               _id: updatedUser._id,
               username: updatedUser.username,
               email: updatedUser.email,
               isAdmin: updatedUser.isAdmin,
          });
     }
     else
     {
          res.status(404);
          throw new Error("User not found");
     }
})

export {createUser, loginUser, logoutCurrentUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile };
