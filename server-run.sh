#!/bin/sh

while true
do
	echo $(date +'%F %T.%N')
	node --trace-warnings server.js
	echo $(date +'%F %T.%N')
done
