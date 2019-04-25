/**
 * 用户相关路由
 */
const express = require('express');
let router = express.Router();
let pool = require('../pool');

/**
 *验证电话号码是否已经存在
 *请求参数：
 phone-用户名
 *输出结果：
 * {"code":1,"msg":"exist"}
 * 或
 * {"code":2,"msg":"non-exist"}
 * 或
 * {code: 0, msg: 'non-phone'}
 */
router.get('/check/phone', (req, res) => {
  let output = {};
  let phone = req.query.phone;
  if (!phone) {
    output = {code: 0, msg: 'non-phone'};
    res.json(output);
  } else {
    let sql = 'select uid from mf_user where phone=?';
    pool.query(sql, [phone], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        output = {code: 1, msg: 'exist'};
      } else {
        output = {code: 2, msg: 'non-exist'};
      }
      res.json(output);
    });
  }
});

/**
 *验证用户名是否已经存在
 *请求参数：
 uname-用户名
 *输出结果：
 * {"code":1,"msg":"exist"}  存在
 * 或
 * {"code":2,"msg":"non-exist"}  不存在
 * 或
 * {code:0,msg:'non-uname'}  没有传uname
 */
router.get('/check/uname', (req, res) => {
  let output={};
  let uname = req.query.uname;
  if(!uname){
    output={code:0,msg:'non-uname'};
    res.json(output);
  }else{
    let sql='select uid from mf_user where uname=?';
    pool.query(sql,[uname],(err,result)=>{
      if(err) throw err;
      if(result.length>0){
        output={code:1,msg:'exist'};
      }else{
        output={code:2,msg:'non-exist'};
      }
      res.json(output);
    });
  }
});

/**
 *用户登录验证
 *请求参数：
 unameOrPhone-用户名或密码
 upwd-密码
 *输出结果：
 * {"code":1,"uid":1,"uname":"test","phone":"13012345678"}
 * 或
 * {"code":400}
 */
router.get('/login', (req, res) => {
  let output={};
  let unameOrPhone=req.query.unameOrPhone;
  let upwd=req.query.upwd;
  if(!unameOrPhone){
    res.json({code:404,msg:'non-unameOrPhone'});
  }else if(!upwd){
    res.json({code:404,msg:'non-upwd'});
  }else{
    let sql='select * from mf_user where (uname=? and upwd=?) or (phone=? and upwd=?)';
    pool.query(sql,[unameOrPhone,upwd,unameOrPhone,upwd],(err,result)=>{
      if(err) throw err;
      if(result.length==0){
        output={code:400};
      }else{
        let user=result[0];
        output={code:1,uid:user.uid,uname:user.uname,phone:user.phone};
      }
      res.json(output);
    })
  }
});

/**
 *注册新用户
 *请求参数：
 uname-用户名
 upwd-密码
 phone-电话号码
 *输出结果：
 * {"code":1,"uid":3,"uname":"test"}
 * 或
 * {"code":500}
 */
router.post('/register', (req, res) => {
  let uname=req.body.uname;
  let upwd=req.body.upwd;
  let phone=req.body.phone;
  if(!uname){
    res.json({code:501,msg:'non-uname'});
  }else if(!upwd){
    res.json({code:501,msg:'non-upwd'});
  }else if(!phone){
    res.json({code:501,msg:'non-phone'});
  }else{
    let sql='insert into mf_user values (null,?,?,?)';
    pool.query(sql,[uname,upwd,phone],(err,result)=>{
      if(err) throw err;
      if(result.affectedRows==1){
        output={code:1,uid:result.insertId,uname,phone};
      }else{
        output={code:400};
      }
      res.json(output);
    });
  }
});

module.exports = router;