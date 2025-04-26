import express from 'express';
const app = express();
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser'
import aiRoutes from './routes/ai.route.js'
import postRoutes from  './routes/post.route.js'
import path from 'path';
// app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs')
   

app.use('/',userRoutes);
app.use('/users',userRoutes);
app.use('/ai',aiRoutes) 
app.use('/post',postRoutes)
app.use('/posts',postRoutes);
  

export default app;