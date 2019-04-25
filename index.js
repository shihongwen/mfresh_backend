const http=require('http');
const express=require('express');
//服务器
let app=express();
http.createServer(app).listen(8080);

// 中间件
let bodyParser=require('body-parser');
let cookieParser=require('cookie-parser');
let cors=require('cors');
app.use(bodyParser({extended:false}));
app.use(cookieParser());
app.use(cors({
  origin:'*',
  credentials:true
}));

// 路由
app.use('/cart',require('./routes/cart'));
app.use('/news',require('./routes/news'));
app.use('/user',require('./routes/user'));
app.use('/product',require('./routes/product'));