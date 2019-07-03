# vg.tracker_scraper

Gets information from the 4chan API for /vg/ and writes to a postgreSQL database. Made with the intention of creating a frontend to visualize data about /vg/ generals.

What data?

* thread title
* thread_identifier, i.e /tf2g/
* thread_number
* replies
* unique_ips
* average post per unique IP
* duration
* average post per hour
* creation time
* snapshot time, time the thread was queried at
* catalogue time, time the catalogue was queried at

