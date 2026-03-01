import { Router, Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma";

import  { AuthRequest, isAuthenticated } from './../middleware/jwt.middleware'

const router = Router();
const saltRounds = 10;



// POST /auth/signup  - Creates a new user in the database
router.post('/signup', (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // Check if email or password or name are provided as empty string 
  if (email === '' || password === '' || name === '') {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }
  
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }


  // Check the users collection if a user with the same email already exists
  prisma.user.findUnique({ where: { email } })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then` 
      return prisma.user.create({data: { email, password: hashedPassword, name }});
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      if (createdUser) {

          const { email, name, id } = createdUser;
          
          // Create a new object that doesn't expose the password
          const user = { email, name, id };
          
          // Send a json response containing the user object
          res.status(201).json({ user: user });
        }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" })
    });
});


// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  prisma.user.findUnique({where: { email } })
    .then((foundUser) => {
    
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." })
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { id, email, name } = foundUser;
        
        // Create an object that will be set as the token payload
        const payload = { id, email, name };

        // Create and sign the token
        const authToken = jwt.sign( 
          payload,
          process.env.TOKEN_SECRET!,
          { algorithm: 'HS256', expiresIn: "6h" }
        );

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }

    })
    .catch(err => {
  console.error('Login error:', err); // Add this line
  res.status(500).json({ message: "Internal Server Error" })
});

});


// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req: AuthRequest , res, next) => {

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

router.get("/user/:id", isAuthenticated, (req, res, next) => {
  const userId = req.params.id;
  
  

} )
router.put("/user/:id", isAuthenticated, (req, res, next) => {
  const userId = req.params.id;

  // Check if the user is updating their own profile
  if (userId !== req.body._id!) {
    res.status(403).json({ message: "You can only update your own profile" });
    return;
  }

  const { password, name } = req.body;

  const updateData: any = {};

  if (name) {
    updateData.name = name;
  }

  if (password) {
    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    updateData.password = bcrypt.hashSync(password, salt);
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ message: "Provide at least one field to update (name or password)" });
    return;
  }

  prisma.user.update({where:{id:userId as string}, data: updateData})
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Deconstruct to omit password
      const { email, name: userName, id } = updatedUser;
      const user = { email, name: userName, id };

      res.status(200).json({ user: user });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});


export default router;