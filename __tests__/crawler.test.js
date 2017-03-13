'use strict';
const fs = require('fs');
const path = require('path');
const crawler = require('../crawler');
const cheerio = require('cheerio');
const parentUrl = 'https://william.kamovit.ch/';

beforeAll(() => {
  return crawler.setParent(parentUrl);
});

test('Checks URL deLocalizer', () => {
  expect(crawler.deLocalize('//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css', parentUrl))
    .toBe('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css');
  expect(crawler.deLocalize('/img/logo.png', parentUrl))
    .toBe('https://william.kamovit.ch/img/logo.png');
  expect(crawler.deLocalize('https://william.kamovit.ch/js/index.bundle.js', parentUrl))
    .toBe('https://william.kamovit.ch/js/index.bundle.js');
  expect(crawler.deLocalize('/img/logo.png#sdjsadlkj2323jkljsd', parentUrl))
    .toBe('https://william.kamovit.ch/img/logo.png');
});

test('Get the anchor urls from sample page', () => {
  var $ = cheerio.load(fs.readFileSync(path.join(__dirname,'example.html')));
  expect(crawler.getAnchors($).length).toBe(9);
});

test('Get static elements from page', () => {
  var $ = cheerio.load(fs.readFileSync(path.join(__dirname,'example.html')));
  expect(crawler.getStatics($, parentUrl).length).toBe(10);
});
