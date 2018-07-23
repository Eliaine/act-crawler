#!/bin/bash

cd `dirname $0`
TIMER_HOME=`pwd`
#cd ..

DEPLOY_DIR=`pwd`
MAINCLASS=CrawlerServer


PIDS=`ps --no-heading -C node -f --width 1000 | grep "$MAINCLASS" | awk '{print $2}'`
echo "PID: $PIDS"
kill -9 $PIDS
