/*
ntklgka 2019
https://github.com/ntklgka 
*/

require('dotenv').config();
const request = require('request');
var moment = require('moment-timezone');
var momentDurationFormatSetup = require("moment-duration-format");
const { Pool } = require('pg');
const { performance } = require('perf_hooks');

const pool = new Pool(
{ 
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
})

let sql_string = [""
,"INSERT INTO threads1(thread_name, thread_identifier,"
, "thread_number, replies, unique_ips, avg_ppip, duration," 
, "avg_pphr, creation_time, snapshot_time, catalogue_time)"
, "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);"].join("");


function doThing() {
	request('https://a.4cdn.org/vg/catalog.json', function (error, response, body) {

		let catalogue_Date = new Date(); // time the catalogue was queried at
		let catal_moment = moment(catalogue_Date,"YYYY-MM-DDTHH:mm:ss").tz("EST5EDT");
		let catal_date = catal_moment.format("DD/MM/YY HH:mm:ss");
		
		let timeout = 0;
		let threadcount = 0;
		let infoArray = [[]];
		let thread_ctr = 0;
		let archive_ctr = 0;
		let error_ctr = 0;
		
		let catalogue = JSON.parse(body); //gets catalogue

		for(let i = 0; i < catalogue.length; i++) { // loops through the number of pages
			let page = catalogue[i]; //sets to specific page
			
			threadcount = threadcount + page.threads.length; //number of threads in catalogue (useful bcs stickies bump it by one)
			console.log("############ Total threads: " + threadcount + " #############")
			
			for(let j = 0; j < page.threads.length; j++){ // loops through the number of threads in each page

				let thread = page.threads[j]; // sets specific thread number

				let title = JSON.stringify(thread.sub); //get title
				title = title.replace(/"/g,""); // removes double quotes from title
				let thread_no = thread.no; // get thread number
				//let replies = thread.replies + 1; // get number of replies (+1 for OP)

				let thread_url = 'https://a.4cdn.org/vg/thread/' + thread_no + '.json'; //creates thread url for request

				//10 seconds between requests
				setTimeout(function() {
					request(thread_url, function (error, response, body) {
						
						if (error || response.statusCode != 200){
							error_ctr++;
							console.log("Threads: " + thread_ctr + " Deleted: " + error_ctr + " Archived: " + archive_ctr);
						}
						else{
							let threadJSON = JSON.parse(body); // gets current thread
							let archived = threadJSON.posts['0'].archived;
							
							if (archived == 1){
								archive_ctr++;
								console.log("Threads: " + thread_ctr + " Deleted: " + error_ctr + " Archived: " + archive_ctr);
							}
							else{
                                                                let replies = threadJSON.posts['0'].replies + 1;
             							let unique_ips = threadJSON.posts['0'].unique_ips; //gets unique ips
								let ppIP = Math.round(replies/unique_ips * 10) / 10; // gets posts per unique IP
								let initialDate = threadJSON.posts['0'].now; //gets date of OP
								//let lastPostTime = threadJSON.posts[replies].now; //gets time of last post

								//string formatting for OP Date
								let init_date = initialDate.slice(0, initialDate.indexOf("("));
								let init_time = initialDate.slice(initialDate.indexOf(")") + 1);
								let full_init_date = init_date + " " + init_time;
								let b = moment(full_init_date, "MM/DD/YY HH:mm:ss", "EST5EDT");
								let OPtime = b.format("DD/MM/YY HH:mm:ss");

								//string formmating and convert current date to EST/EDT
								let a = moment().tz("EST5EDT");
								let ESTEDTcurrTime = a.format("DD/MM/YY HH:mm:ss");

								//calculate thread duration from difference between current time and OP
								let ms = moment(ESTEDTcurrTime,"DD/MM/YYYY HH:mm:ss").diff(moment(OPtime,"DD/MM/YY HH:mm:ss"));
								let d = moment.duration(ms);
								let dur = d.format("HH:mm:ss");

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
								if (hours_dur == "00"){ hours_dur = 1;}
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
								
								
								//turn into ISO date format
								let chip = moment(OPtime, "DD/MM/YY HH:mm:ss");
								let ISOPdate = chip.format("YYYY-MM-DD HH:mm:ss");
								
								let chip1 = moment(ESTEDTcurrTime, "DD/MM/YY HH:mm:ss");
								let ISOESTcurrTime = chip1.format("YYYY-MM-DD HH:mm:ss");
								
								let chip2 = moment(catal_date, "DD/MM/YY HH:mm:ss");
								let ISOcatal_date = chip2.format("YYYY-MM-DD HH:mm:ss");
								
								infoArray[thread_ctr] = [title, threadIdentifier, thread_no, replies,
								unique_ips, ppIP, real_dur, pphr, ISOPdate, ISOESTcurrTime, ISOcatal_date];
								
								thread_ctr++;
								
								console.log("");
								console.log("--------------------------------------");
								console.log(title);
								console.log("Thread Identifier: " + threadIdentifier);
								console.log("Thread number: " + thread_no);
								console.log("Replies: " + replies);
								console.log("Unique IPS: " + unique_ips);
								console.log("Average posts per IP: " + ppIP);
								console.log("Duration: " + real_dur);
								console.log("Average posts per hour: " + pphr);
								console.log("OP date: " + OPtime);
								console.log("ISO OP date: " + ISOPdate);
								console.log("Snapshot at: " + ESTEDTcurrTime);
								console.log(ISOPdate + " " + ISOESTcurrTime + " " + ISOcatal_date);
								console.log("Threads: " + thread_ctr + " Deleted: " + error_ctr + " Archived: " + archive_ctr);
								console.log("--------------------------------------");
							}		
						}
						
						if(thread_ctr + error_ctr + archive_ctr == threadcount){
							t0 = performance.now();
							
							for(let k = 0; k < infoArray.length; k++){
								pool.connect(function(err, client, done) {
									if (err) {
										return console.error('error fetching client from pool', err);
									}
								client.query(sql_string, [infoArray[k][0], infoArray[k][1], infoArray[k][2], infoArray[k][3],
								infoArray[k][4], infoArray[k][5], infoArray[k][6], infoArray[k][7], infoArray[k][8], infoArray[k][9],
								infoArray[k][10]], function (err, result) {
										done();

										if (err) {
											return console.error('error happened during query', err);
										}
									})
								}) 
							}
							var t1 = performance.now();
							console.log("Inserting into db took " + (t1 - t0) + " milliseconds.");
						}
					});
				}, timeout );
				timeout += 10000;
			}
		}	
	});
}

doThing();
setInterval(doThing, 1800000);
