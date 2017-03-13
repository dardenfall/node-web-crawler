var crawler = require('./crawler'); //Import our module
var argv = require('minimist')(process.argv.slice(2)); //Parse the node arguments
var url = argv._[0];

crawler.fetchAndAdd(url);
