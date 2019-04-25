const mysql=require('mysql');
let pool=mysql.createPool({
  user:'root',
  password:'',
  database:'mfresh',
  port:3306,
  host:'127.0.0.1',
  connectionLimit:10
});
module.exports=pool;