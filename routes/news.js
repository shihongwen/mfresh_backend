/**
 * 新闻相关路由
 */
const express=require('express');
const pool=require('../pool');
let router=express.Router();

/**
 *按发布时间逆序返回新闻列表
 *请求参数：
 pageNum-需显示的页号；默认为1
 *输出结果：
 {
    totalRecord: 58,
    pageSize: 5,
    pageCount: 5,
    pageNum: 1,
    data: [{},{} ... {}]
  }
 */
router.get('/select',(req,res) => {
  let pageNum=req.query.pageNum;
  if(!pageNum){
    pageNum=1;//默认情况为1
  }else{
    pageNum=parseInt(pageNum);
  }
  let output={//定义返回数据
    totalRecord:0,
    pageSize:5,
    pageCount:0,
    pageNum,
    data:[]
  }
  let totalLoad=false;
  let dataLoad=false;
  let sql="select count(*) as c from mf_news";
  pool.query(sql,(err,result) => {
    if(err) throw err;
    output.totalRecord=result[0].c;
    if(output.totalRecord==0){
      output.pageCount=0;
    }else{
      output.pageCount=Math.ceil(output.totalRecord/output.pageSize);
    }
    totalLoad=true;
    if(dataLoad)
      res.json(output);
  });
  sql="select nid,title,pubTime "+
      "from mf_news "+
      "order by pubTime desc limit ?,?";
  let start=(output.pageNum-1)*output.pageSize;
  let size=output.pageSize;
  pool.query(sql,[start,size],(err,result) => {
    if(err) throw err;
    output.data=result;
    dataLoad=true;
    if(totalLoad)
      res.json(output);
  });
});

/**
 *根据新闻ID返回新闻详情
 *请求参数：
 nid-新闻ID，必需
 *输出结果：
 {
    "nid": 1,
    ...
  }
 */
router.get('/detail/:nid',(req,res) => {
  let nid=req.params.nid;
  let sql="select * from mf_news where nid=?";
  pool.query(sql,[nid],(err,result) => {
    if(err) throw err;
    if(result.length>0){
      res.json(result[0]);
    }else{
      res.json({});
    }
  });
});

module.exports=router;