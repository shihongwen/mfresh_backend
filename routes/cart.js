/**
 * 购物车相关所有路由
 * */
const express = require('express');
const pool = require('../pool');
let router = express.Router();
/**
 * 向购物车中添加商品
 * 请求参数：
 * uid-用户ID，必需
 * pid-产品ID，必需
 * 输出结果：
 *  {"code":1,"msg":"succ", "productCount":1}
 *  或
 *  {"code":400}
 */
router.post('/detail/add', (req, res) => {
  let output = {};
  let uid = req.body.uid;
  let pid = req.body.pid;
  let cid = '';
  let productCount = 0;
  //查看cart表中是否有userId为uid且status为0的记录
  let sql = 'select cid from mf_cart where userId=? and status=0';
  pool.query(sql, [uid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {//有记录，处理cid对应的cart_detail 表中的产品记录
      cid = result[0].cid;
      //查询cart_detail是否有对应记录
      sql = 'select * from mf_cart_detail where cartId=? and productId=?';
      pool.query(sql, [cid, pid], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {//有对应数据
          let productCount = parseInt(result[0].count) + 1;
          sql = 'update mf_cart_detail set count=? where cartId=? and productId=?';
          pool.query(sql, [productCount, cid, pid], (err, result) => {
            if (err) throw err;
            if (result.affectedRows == 1) {
              output = {code: 1, msg: 'succ', productCount};
              res.json(output);
            } else {
              res.json({code: 400});
            }
          });
        } else {//没有对应数据，新增
          updateCartDetail(cid, pid);
        }
      });
    } else {//没有记录,新增记录
      sql='insert into mf_cart values(null,?,0)';
      pool.query(sql,[uid],(err,result)=>{
        if(err) throw err;
        if(result.affectedRows==1){
          cid=result.insertId;
          // 为 mf_cart_detail表新增数据
          updateCartDetail(cid,pid);
        }else{
          res.json({code:400});
        }
      })
    }
  });

  //为 mf_cart_detail表新增数据
  function updateCartDetail(cid, pid) {
    let sql = 'insert into mf_cart_detail values(null,?,?,1)';
    pool.query(sql, [cid, pid], (err, result) => {
      if (err) throw err;
      if (result.affectedRows == 1) {
        res.json({code: 1, msg: 'succ', productCount: 1});
      } else {
        res.json({code:400});
      }
    });
  }
});

/**
 * 根据购物车详情记录编号删除该购买记录
 * 请求参数：
 * did-详情记录编号
 * 输出结果：
 *  {"code":1,"msg":"succ"}
 *  或
 *  {"code":400}
 */
router.post('/detail/delete/', (req, res) => {
  let did=req.body.did;
  let sql=`delete from mf_cart_detail where did=?`;
  pool.query(sql,[did],(err,result)=>{
    if(err) throw err;
    if(result.affectedRows==1){
      res.json({code:1,msg:'succ'});
    }else{
      res.json({code:400});
    }
  });
});

/**
 * 查询指定用户的购物车内容
 * 请求参数：
 *uid-用户ID，必需
 *输出结果：
 {
    "uid": 1,
    "products":[
      {"pid":1,"title1":"xxx","pic":"xxx","price":1599.00,"count":3},
      {"pid":3,"title1":"xxx","pic":"xxx","price":1599.00,"count":3},
      ...
      {"pid":5,"title1":"xxx","pic":"xxx","price":1599.00,"count":3}
    ]
  }
 */
router.get('/detail/select/:uid', (req, res) => {
  let output={cid:'',products:[]};
  let uid = req.params.uid;
  let sql = `select pid,title1,pic,price,count,did,cartId as cid 
              from mf_product,mf_cart_detail,mf_cart 
              where pid=productId and cartId=cid and status=0 and userId=?`;
  pool.query(sql, [uid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      output.cid=result[0].cid;
      output.products=result;
      res.json(output);
    } else {
      res.json(output);
    }
  });
});

/**
 *根据购物车详情记录编号修改该商品购买数量
 *请求参数：
 did-详情记录编号
 pid-商品编号
 count-更新后的购买数量
 *输出结果：
 * {"code":1,"msg":"succ"}
 * 或
 * {"code":400}
 */
router.post('/detail/update', (req, res) => {
  let did=req.body.did;
  let pid=req.body.pid;
  let count=req.body.count;
  let sql='update mf_cart_detail set count=? where did=? and productId=?';
  pool.query(sql,[count,did,pid],(err,result)=>{
    if(err) throw err;
    if(result.affectedRows==1){
      res.json({code:1,msg:'succ'});
    }else{
      res.json({code:400});
    }
  });
});

/**根据购物车记录编号进行结算
 * 请求参数：
 * cid：购物车记录编号
 * uid：用户编号
 * 返回值：
 * 成功：{code:1,msg:'succ'}
 * 失败：{code:400}
 */
router.post('/checkout',(req,res)=>{
  let cid=req.body.cid;
  let uid=req.body.uid;
  let sql='update mf_cart set status=1 where cid=? and userId=?';
  pool.query(sql,[cid,uid],(err,result)=>{
    if(err) throw err;
    if(result.affectedRows==1){
      res.json({code:1,msg:'succ'});
    }else{
      res.json({code:400});
    }
  });
})
module.exports = router;