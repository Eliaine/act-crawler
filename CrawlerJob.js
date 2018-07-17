var webscraper = require("act-crawler-slave");
var query=require("./MysqlPool"); 
var CrawlerQueue = require('./crawlerQueue');
var CrawlerStart = require("./CrawlerStart");
var dataAddSql = 'insert into scraper_result(siteid,content,createTime) VALUES(?,?,now())';
var taskUpdateSql = 'update scraper_sitemaps set lastCrawlerTime=now() where siteid = ?';

var CrawlerJob = function (id,sitemap, options,jstart) {
	this._id = id;
	this.sitemap = sitemap;
	this.options = options;
};


CrawlerJob.prototype = {
	execute: function (callback) {
		var job = this;
		var sitemap = this.sitemap;
		var options = this.options;
		
		var updateParams = new Array();
		updateParams[0] = sitemap._id;
		query(taskUpdateSql, updateParams, function(err,results,fields){  
			console.log("update mysql sitemap ..."+results);
		});
		console.log("start to crawler job ..."+sitemap._id);
		webscraper(sitemap, options)
			.then(function (scraped) {
				console.log("finished task scrape !"+sitemap._id);
				var insertParams = new Array();
				insertParams[0] = sitemap._id;
				insertParams[1] = JSON.stringify(scraped);
				query(dataAddSql, insertParams, function(err,results,fields){  
					console.log("save mysql content ..."+results);
				});
				callback();
			});
	}
};

module.exports = CrawlerJob