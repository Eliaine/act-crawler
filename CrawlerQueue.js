var CrawlerQueue = function () {
	this.jobs = [];
	this.scrapedSiteIds = {};
};

CrawlerQueue.prototype = {

	/**
	 * Returns false if page is already scraped
	 * @param job
	 * @returns {boolean}
	 */
	add: function (job) {
		this.scrapedSiteIds = {};
		if (this.canBeAdded(job)) {
			this.jobs.push(job);
			this._setUrlScraped(job._id);
			return true;
		}
		return false;
	},

	canBeAdded: function (job) {
		if (this.isScraped(job._id)) {
			return false;
		}
		return true;
	},

	getQueueSize: function () {
		return this.jobs.length;
	},

	isScraped: function (id) {
		return (this.scrapedSiteIds[id] !== undefined);
	},

	_setUrlScraped: function (id) {
		this.scrapedSiteIds[id] = true;
	},

	getNextJob: function () {

		// @TODO test this
		if (this.getQueueSize() > 0) {
			return this.jobs.pop();
		}
		else {
			return false;
		}
	}
};

module.exports = CrawlerQueue