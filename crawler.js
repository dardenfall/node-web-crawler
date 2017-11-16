'use strict';

var fetch = require('node-fetch'); //mimics window.fetch style XMLHttpRequests
var cheerio = require('cheerio'); //jQuery-like html parser
var fs = require('fs');
var parentUrl;
var queue = [];
var statics = [];
var completedUrls = [];
var urlFailure = [];
var crawler = {};

crawler.setParent = function(parent) {
  parentUrl = parent;
};

crawler.saveJson = function(data) {
  fs.writeFile("statics.json", data, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("statics.json file saved");
  });
};

crawler.fetchAndAdd = function(url) {
  var self = this;
  if (!parentUrl) {
    parentUrl = url;
  }
  fetch(url.replace(/\/$/, ''))
    .then(function(res) {
        return res.text();
    }).then(function(body) {
        var $ = cheerio.load(body); //parse the body of the page
        console.log(queue.length, url); //Logging to show progress
        self.getAnchors($);
        self.getStatics($, url);
        var next = queue.shift();
        if (next) { //move to next url in queue
          completedUrls.push(url);
          self.fetchAndAdd(next);
        } else {
          self.saveJson(JSON.stringify(statics)); //print the results
          return;
        }
    })
    .catch(function(err){
      console.log(err);
    });
};

crawler.getAnchors = function($) {
  var self = this;
  $('a').toArray().map(a => {
    if(!a.attribs.href) { return;}
    var href = self.deLocalize(a.attribs.href, parentUrl);
    var sameUrl = href.startsWith(parentUrl); //verify the url is local (same domain, but not a sub-domain)
    var notInQueue = queue.indexOf(href) < 0; //verify it's not already in the queue or saved to the json
    var notAlreadyDone = completedUrls.indexOf(href) < 0;
    var notResource = !href.match(/(csv|pdf|xlsx|geojson|json)$/);
    if (sameUrl && notInQueue && notAlreadyDone && notResource) {
      queue.push(href);
    }
  });
  return queue;
};

crawler.getStatics = function($, url) {
  var self = this;
  var resourceArray = [];
  // Find all resources on page (images, css, js, etc.)
  if (completedUrls.indexOf(url) >= 0) {return;}
  var images = $('img').toArray();
  var scripts = $('script').toArray();
  var links = $('link').toArray();
  var resourceAnchors = $('a').toArray()
    .filter(a => {
      if (!a.attribs.href) {return false;}
      a.attribs.href.match(/(csv|pdf|xlsx|geojson|json)$/);
    });
  var resources = [...images, ...scripts, ...links, ...resourceAnchors];
  resources.map(resource => {
    var src = resource.attribs.src;
    var href = resource.attribs.href || resource.attribs['data-href'];
    if (resource.attribs.rel === "stylesheet" || resource.name === "a") {
      resourceArray.push(self.deLocalize(href, parentUrl));
    } else if (src) {
      resourceArray.push(self.deLocalize(src, parentUrl));
    }
  });
  statics.push({
    "url": url,
    "assets": resourceArray
  });
  //source srcset
  return resourceArray;
};

crawler.deLocalize = function(url, parent) {
  //if links are relative make them absolute
  var protocol = parent.toLowerCase().substring(0, 5) === "https" ? "https" : "http";
  var topLevel = parent.replace(/\/$/, '');
  var absUrl;
  if (url.match(/^\/{2}/)) { //if two slashes append protocol
    absUrl = protocol + ":" + url;
  } else if (url.match(/^\//)) { //If one slash append parentUrl
    absUrl = topLevel + url;
  } else { //otherwise assume absolute path
    absUrl = url;
  }
  //clean urls of #s and trailing slashes
  return absUrl.replace(/#.*/,'').replace(/\/$/, '');
};

module.exports = crawler;
