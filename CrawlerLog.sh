#!/bin/bash
#进程监听脚本
#单位(s)
INTERVAL=86400

this_path=$(cd `dirname $0`;pwd)

cd $this_path
#echo $this_path

source /etc/profile

while true
do

current_date=`date -d "-1 day" "+%Y%m%d"`
#echo $current_date  
split -b 65535000 -d -a 4 $this_path/nohup.out   $this_path/log/log_${current_date}_

cat /dev/null > nohup.out

sleep $INTERVAL

done

exit 0
