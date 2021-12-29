#!/bin/sh

cd logs
screen -dmS db-client -L bash -c "./client-run.sh"
