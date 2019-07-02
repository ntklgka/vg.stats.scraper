/*
can't get unique IPs from querying catalogue, so I use catalogue 
to get thread number and query the thread instead
*/

/*TO DO:

*/

require('dotenv').config()
const request = require('request');
var moment = require('moment-timezone');
var momentDurationFormatSetup = require("moment-duration-format");
const { Pool } = require('pg');

const pool = new Pool(
{ 
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
})

let sql_string = [""
,"INSERT INTO threads(thread_name, thread_identifier,"
, "thread_number, replies, unique_ips, avg_ppip, duration," 
, "avg_pphr, creation_time, snapshot_time, catalogue_time)"
, "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);"].join("");

request('https://a.4cdn.org/vg/catalog.json', function (error, response, body) {

	let catalogue_Date = new Date(); // time the catalogue was queried at
	let catal_moment = moment(catalogue_Date,"YYYY-MM-DDTHH:mm:ss").tz("EST5EDT");
	let catal_date = catal_moment.format("DD/MM/YY HH:mm:ss");

	let counter = 0;
	let catalogue = JSON.parse(body); //gets catalogue
	let timeout = 0;

	for(let i = 0; i < catalogue.length; i++) { // loops through the number of pages
    	let page = catalogue[i]; //sets to specific page

    	for(let j = 0; j < page.threads.length; j++){ // loops through the number of threads in each page

	    	let thread = page.threads[j]; // sets specific thread number

	    	let title = JSON.stringify(thread.sub); //get title
			title = title.replace(/"/g,""); // removes double quotes from title
			let thread_no = thread.no; // get thread number
			let replies = thread.replies; // get number of replies

			let thread_url = 'https://a.4cdn.org/vg/thread/' + thread_no + '.json'; //creates thread url for request

			//10 seconds between requests
			setTimeout(function() {
				request(thread_url, function (error, response, body) {
					let threadJSON = JSON.parse(body); // gets current thread

					let unique_ips = threadJSON.posts['0'].unique_ips; //gets unique ips

					if(!isNaN(parseInt(unique_ips))){ //check if thread is archived or not, can't get unique IPS from archived threads 

						let ppIP = Math.round(replies/unique_ips * 10) / 10; // gets posts per unique IP
						let initialDate = threadJSON.posts['0'].now; //gets date of OP
						//let lastPostTime = threadJSON.posts[replies].now; //gets time of last post
						let threadDateNow = new Date(); //time the thread was queried at

						//string formatting for OP Date
						let init_date = initialDate.slice(0, initialDate.indexOf("("));
						let init_time = initialDate.slice(initialDate.indexOf(")") + 1);
						let full_init_date = init_date + " " + init_time;
						let b = moment(full_init_date, "MM/DD/YY HH:mm:ss");
						let OPtime = b.format("DD/MM/YY HH:MM:SS");

						//string formmating and convert current date to EST/EDT
						let a = moment(threadDateNow,"YYYY-MM-DDTHH:mm:ss").tz("EST5EDT");
						let ESTEDTcurrTime = a.format("DD/MM/YY HH:mm:ss");

						//calculate thread duration from difference between current time and OP
						let ms = moment(ESTEDTcurrTime,"DD/MM/YYYY HH:mm:ss").diff(moment(OPtime,"DD/MM/YY HH:mm:ss"));
						let d = moment.duration(ms);
						let dur = d.format("hh:mm:ss");

						let real_dur = "";

						//if thread has less than an hour add 00 to hours
						if(dur.length == 5){
							real_dur = "00:" + dur;
						}
						else{
							real_dur = dur;
						}

						//calculates posts per hour
						let hours_dur = d.format("hh");
						let pphr = Math.round(replies/hours_dur * 10) / 10;

						let threadIdentifier;
						//get the thread identifier i.e. /tf2g/
						if (title.includes("/")){
							let temp_string = title.slice(title.indexOf("/") + 1);
							let temp_string2 = temp_string.slice(0, temp_string.indexOf("/"));
							threadIdentifier = "/" + temp_string2 + "/";
						} else {
							threadIdentifier = title;
						}


						console.log("");
						console.log("--------------------------------------");
						console.log(title);
						console.log("Thread Identifier: " + threadIdentifier);
						console.log("Thread number: " + thread_no);
						console.log("Replies: " + replies);
						console.log("Unique IPS: " + unique_ips);
						console.log("Average posts per IP: " + ppIP);
						console.log("Thread duration: " + real_dur);
						console.log("Average posts per hour: " + pphr);
						console.log("OP at: " + OPtime);
						console.log("Snapshot at: " + ESTEDTcurrTime);
						console.log(counter);
						console.log("--------------------------------------");
						counter++;


						pool.connect(function(err, client, done) {
	  						if (err) {
	    						return console.error('error fetching client from pool', err);
	  						}
	  						client.query(sql_string, [title, threadIdentifier, thread_no, replies, unique_ips, ppIP, real_dur, pphr, OPtime, ESTEDTcurrTime, catal_date], function (err, result) {
	    						done();

	    						if (err) {
	     							return console.error('error happened during query', err);
	    						}
	  						})
						})
					}
				});
			}, timeout );
			timeout += 10000;
    	}
	}
});