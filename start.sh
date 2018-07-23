#!/bin/bash

cd `dirname $0`
TIMER_HOME=`pwd`
#cd ..

DEPLOY_DIR=`pwd`
MAINCLASS=CrawlerServer

nohup node CrawlerServer.js 12181 &



while [ -z "$PROCESS" ]; do
    sleep 2
    PROCESS=`ps axfww | grep "$MAINCLASS" | grep -v grep`
done

echo OK!
PIDS=`ps --no-heading -C node -f --width 1000 | grep "$MAINCLASS" | awk '{print $2}'`
echo "PID: $PIDS"
