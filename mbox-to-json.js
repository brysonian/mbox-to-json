#!/usr/bin/env node

var MailParser  = require('mailparser').MailParser;
var fs					= require('fs');
var Mbox        = require('node-mbox');
var argv				= require('yargs')
									.alias('i', 'input')
									.alias('o', 'output')
									.demand(['i'])
									.argv;

function main() {
	var messages = [];
	var total = Infinity;
	var mbox = new Mbox();
	var messageCount = 0;
	mbox.on('message', function(msg) {
	  // parse message using MailParser
	  var mailparser = new MailParser({ streamAttachments : true });
	  mailparser.on('end', function(mail) {
		  messages.push(mail);
	  	if (messages.length == messageCount) {
	  		console.log('Finished parsing messages');
	  		if (argv.o)
	  			saveAsJSON(messages);
	  		else
	  			console.log(messages);
	  	}
	  });
	  mailparser.write(msg);
	  mailparser.end();
	});

	mbox.on('end', function(parsedCount) {
		console.log('Completed Parsing mbox File.');
		messageCount = parsedCount;
	});

	if (fs.existsSync(argv.input)) {
		var handle = fs.createReadStream(argv.input);
		//handle.setEncoding('ascii');
		handle.pipe(mbox);
	}
}

function saveAsJSON(obj) {
	fs.writeFile(argv.output, JSON.stringify(obj), function(err) {
		if(err)
			return console.log(err);
	});
}
main();