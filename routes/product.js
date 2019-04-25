/**
 * 产品相关路由
 */
const express=require('express');
const pool=require('../pool');
let router=express.Router();

/**
 *根据产品ID返回产品详情
 *请求参数：
 pid-产品ID，必需
 *输出结果：
 {
    "pid": 1,
    "title1":"xxx",
    ...
  }
 */
router.get('/detail/:pid',(req,res) => {
  let pid=req.params.pid;
  let sql="select * from mf_product where pid=?";
  pool.query(sql,[pid],(err,result) => {
    if(err) throw err;
    if(result.length>0){
      res.json(result[0]);
    }else{
      res.json({});
    }
  });
});

/**
 *分页获取产品信息
 *请求参数：
 pageNum-需显示的页号；默认为1
 type-可选，默认为1
 *输出结果：
 {
    totalRecord: 37,
    pageSize: 5,
    pageCount: 7,
    pageNum: 1,
    type: 1,
    data: [{},{} ... {}]
  }
 */
router.get('/select',(req,res) => {
  let pageNum=req.query.pageNum;
  let type=req.query.type;
  if(!pageNum){
    pageNum=1;
  }else{
    pageNum=parseInt(pageNum);
  }
  if(!type){
    type=1;
  }else{
    type=parseInt(type);
  }
  let output={
    totalRecord:0,
    pageSize:5,
    pageCount:0,
    pageNum,
    type:1,
    data:[]
  }
  let totalLoad=false;
  let dataLoad=false;
  let sql="select count(*) as c from mf_product where type=?";
  pool.query(sql,[type],(err,result) => {
    if(err) throw err;
    output.totalRecord=result[0].c;
    if(output.totalRecord==0){
      output.pageCount=0;
    }else{
      output.pageCount=Math.ceil(output.totalRecord/output.pageSize);
    }
    totalLoad=true;
    if(dataLoad){
      res.json(output);
    }
  });
  sql="select * from mf_product where type=? limit ?,?";
  let start=(output.pageNum-1)*output.pageSize;
  let size=output.pageSize;
  pool.query(sql,[type,start,size],(err,result) => {
    if(err) throw err;
    output.data=result;
    dataLoad=true;
    if(totalLoad){
      res.json(output);
    }
  });
});

module.exports=router;