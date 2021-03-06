const webscraper = require("act-crawler-slave");
const CrawlerQueue = require('./CrawlerQueue');
const CrawlerJob = require('./CrawlerJob');
const schedule = require("node-schedule"); 
const query=require("./MysqlPool");  
const options = {delay: 10, pageLoadDelay: 10, browser: 'headless'} // optional delay, pageLoadDelay and browser

var CrawlerStart = function () {
	
}

CrawlerStart.prototype = {
  initData: function (){
	console.log("init crawlerStart data...");
	this.crawlerJobStatus = false;
	this.waitCount = 0;
	this.queue = new CrawlerQueue();
	//定时获取数据库中的网站任务，每隔5分钟执行一次
	this.rule_getJob = new schedule.RecurrenceRule();  
	//定时获取队列中的采集任务，每一分钟执行一次
	this.rule_startJob = new schedule.RecurrenceRule();  
	var times_getJob    = [3,8,13,18,23,28,33,38,43,48,53,58];  
	var scheduleTimes = new Array();
	for(var i=1;i<60;i++){
		scheduleTimes.push(i);
	}
	//console.log(scheduleTimes);
	this.rule_getJob.minute  = times_getJob;
	this.rule_startJob.minute  = scheduleTimes;
	this.getTaskSql = 'select * from scraper_sitemaps where status=1 order by lastCrawlerTime asc limit 10';
	this.taskUpdateSql = 'update scraper_sitemaps set status=0 where id = ? and dayTask=0';
	this.initCrawlerJob();
  },
  initCrawlerJob: function (){
	var start = this;
	schedule.scheduleJob(this.rule_getJob, function(){
	   console.log("init rule_getJob...");
	   var jobCount = start.queue.getQueueSize();
	   if(jobCount == 0){
			start.getCrawlerJob();
	   }
	}); 
	schedule.scheduleJob(this.rule_startJob, function(){
		var curStatus = start.crawlerJobStatus;
		var waitCount = start.waitCount;
		console.log("init rule_startJob..."+curStatus+","+waitCount);
	   if(curStatus === false){
			start.startCrawlerJob();
			start.waitCount = 0;
	   }else{
		if(waitCount > 10){
			start.startCrawlerJob();
                        start.waitCount = 0;	
		}else{
			start.waitCount = waitCount + 1;
		}

	   }
	});
  },
  getCrawlerJob:function(){
	var start = this;
	console.log("start to mysql getCrawlerJob");
	query(start.getTaskSql, function(err,results,fields){
		var resultJson = JSON.parse(JSON.stringify(results));
		resultJson.forEach(function (site) {
			var sitemap = JSON.parse(site.taskInfo);
			var taskId = sitemap._id;
			var dayS = site.dayTask;
			var dataId = site.id;
			var siteId = site.siteid;
			if(dayS == 0){
				var updateParams = new Array();
				updateParams[0] = dataId;
				query(start.taskUpdateSql, updateParams, function(err,results,fields){  
					console.log("update mysql sitemap ..."+results);
				});
			}
			
			if(taskId!=null && taskId !=""){
				 var randomNumDelay = Math.ceil(Math.random() * 60)+10;
				 options.delay = randomNumDelay;
				 var firstJob = new CrawlerJob(sitemap._id,sitemap,options);
				 start.queue.add(firstJob);
			}
		});
	});
  },
  startCrawlerJob: function (){
	var start = this;
	var job = this.queue.getNextJob();
	if (job === false) {
		console.log("no job");
		start.getCrawlerJob();
		start.crawlerJobStatus = false;
		return;
	}else{
		start.crawlerJobStatus = true;
		job.execute(function(job) {
			console.log("end job");
			start.crawlerJobStatus = false;
			start.startCrawlerJob();
		});
	}
  }
}

module.exports = CrawlerStart
