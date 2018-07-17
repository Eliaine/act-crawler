const http = require('http');
const url = require('url');
const query=require("./MysqlPool"); 
const CrawlerStart = require("./CrawlerStart");
var port = 10080;

if (process.argv.length != 3) {  
	console.log("Usage: server.js <portnumber>");  
	process.exit(-1);  
}

port = process.argv[2];

var start = new CrawlerStart();
start.initData();

var siteAddSql = 'replace into scraper_sitemaps(siteid,taskInfo) VALUES(?,?)';
const server = http.createServer((req, res) => {

	// 设置接收数据编码格式为 UTF-8  
    req.setEncoding('utf-8');  
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com  
    // 数据块接收中  
    req.addListener("data", function (postDataChunk) {  
        postData += postDataChunk;  
    }); 
    // 数据接收完毕，执行回调函数  
    req.addListener("end", function () {
		var result = {};
		try {
			const sitemap = JSON.parse(JSON.parse(postData));
			//console.log(sitemap);
		    const taskId = sitemap._id;
			//console.log(taskId);
			if(taskId!=null && taskId !=""){
				var insertParams = new Array();
				insertParams[0] = taskId;
				insertParams[1] = JSON.stringify(sitemap);
				query(siteAddSql, insertParams, function(err,results,fields){  
					console.log("save mysql site ..."+results);
				});
				result.code="1001";
				result.message= "接收成功，并加入到采集范畴";
			}else{
				result.code="1003";
				result.message= "传输的数据不存在taskId字段，请检查后再传";
			}
		}
		catch(err){
			 console.log(err);
			 result.code="1004";
			 result.message= "系统错误";
		}
		console.log(result);
        res.writeHead(200, {
            "Content-Type": "text/plain;charset=utf-8"  
        });  
        res.end(JSON.stringify(result));
    });  
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(port, () => {
  console.log('opened server on', server.address());
});
