#!/bin/bash
for i in `seq 100 999`;
do
   echo $i
   wget http://vsbdb.com/wp-content/uploads/2016/05/mnb-$i.jpg
done 
