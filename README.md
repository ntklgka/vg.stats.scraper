# vg.stats.scraper

Gets information from the 4chan API for /vg/ and writes to a postgreSQL database. Made with the intention of creating a frontend to visualize data about /vg/ generals.

What data?

* thread title
* thread identifier, i.e /tf2g/
* thread number
* replies
* unique ips
* average posts per unique IP
* duration
* average posts per hour
* creation time
* snapshot time, time the thread was queried at
* catalogue time, time the catalogue was queried at

