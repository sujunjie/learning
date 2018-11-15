#!/bin/sh
num=${1:-4}
second=${2:-600}
for i in `seq $num`
do
  echo -ne "
i=0;
while true
do
i=i+1;
done" | /bin/sh &
  pid_array[$i]=$! ;
done

sleep $second

for i in "${pid_array[@]}"; do
  kill $i;
done
