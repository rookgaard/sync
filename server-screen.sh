#!/bin/sh

cd logs
screen -dmS db-server -L bash -c "npm run server"
