import express from 'express';

//Controllers
import { createUser, loginUser } from '../controllers/userController.js';

//Middlewares
const router=express.Router()

router.route('/').post(createUser);
router.post("/auth", loginUser);

export default router;