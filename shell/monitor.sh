#!/bin/sh
while true
do
    pro=`ps -ef | grep sogou | grep -v grep | grep -v vim | awk '{print $2}'`
    for p in $pro
    do 
        if [[ `ps -p $p -o etimes=` -gt 200 ]]; then
            kill $p
        fi
    done
    sleep 30s
done
