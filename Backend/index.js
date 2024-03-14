import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv'
import { dbConfig } from './utils/dbConfig.js';
import cors from 'cors';
import userRouter from './routes/UserRoutes.js';
import { assign } from 'nodemailer/lib/shared/index.js';
import AssignMarkRouter from './routes/cordinatorRoutes/AssignMarkRouter.js';
import AssignShedulerouter from './routes/cordinatorRoutes/AssignSheduleRouter.js';

const port = process.env.PORT || 510;
const app = express();
app.use(express.json());
dotenv.config();

app.use(morgan('dev'));
app.use(cors());
app.get('/', async (req,res)=>{
    res.status(200).json('Server is up and running');
})

//Admin Routes
app.use('/user',userRouter);
app.use('/assignMark',AssignMarkRouter);
app.use('/assignShedule',AssignShedulerouter);


dbConfig().then(()=>{
    app.listen(port,()=>{
        console.log(`Server is up and running on port ${port}`);
    })
}).catch((err)=>{
    console.log(err);
})

