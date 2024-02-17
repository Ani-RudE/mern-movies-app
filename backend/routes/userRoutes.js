import express from 'express';

//Controllers
import { createUser } from '../controllers/userController.js';

//Middlewares
const router=express.Router()

router.route('/').post(createUser);

export default router;