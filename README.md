# vgstats.xyz

This project is divided into three repos:
* vg.stats.scraper: this one
* vg.stats.API: https://github.com/ntklgka/vg.stats.API
* vg.stats.website: https://github.com/ntklgka/vg.stats.website

# Coming Soon (well some day, probably)
* an archive
* a "Records" tab where we can see which threads achieve the highest/lowest records
* graphs to visualize each thread's data over time

# vg.stats.scraper

Gets information from the 4chan API and writes to a postgreSQL database. Made using NodeJS.

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

