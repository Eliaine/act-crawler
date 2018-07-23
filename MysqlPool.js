
const mysql = require('mysql')
const pool = mysql.createPool({
	host : '192.168.2.35', //主机
	user : 'root', //MySQL认证用户名
	password : 'surfilter1218', //MySQL认证用户密码
	port: '3306', //端口号
	database : 'security'
})

// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])

let query = function( sql, values ) {
  // 返回一个 Promise
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
				resolve( rows );
          }
          // 结束会话
          connection.release()
        })
      }
    })
  })
}
  
module.exports=query; 
