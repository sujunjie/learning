#!/bin/bash
# Usage: shchedule_merge.sh [yyyymmdd]
#
# @author sujunjie@baidu.com                                                                                                                                                                 
# @date 2015/3/2
#
# 脚本exit状态码含义如下：
# 0：   正常退出；
# 1:    pv streaming 失败；
# 2:    click streaming 失败；
# 3:    merge streaming 失败；
# 4:    结果文件getmerge 失败；
# 5:    结果文件split失败；
# 6:    建表失败;
# 7:    load入库有失败;


#检查运行错误，当$1不为0时exit $2
function check_error() {
    if [[ $1 -ne 0 ]]; then
        echo "\$1 is $1"
        exit $2
    fi
}

#创建hadoop作业输入文件列表
function create_input_file() {
    DAYS=$1
    PRE_DAYS=$2
    DATA_TYPE=$3
    file_name=$4
    data_day=$(($DAYS + $PRE_DAYS))
    cat /dev/null > $file_name
    while (($data_day > $PRE_DAYS))
    do
        date=`date "+%Y%m%d" -d"-${data_day}days $base_date"`
        echo '/sujunjie/output_'$DATA_TYPE'_'$date >> $file_name
        let "data_day--"
    done
}

cur_dir=$(dirname $(readlink -f $BASH_SOURCE))
source $cur_dir'/../../../conf/shell.sh'

#脚本输出信息重定向到日志
if [[ ! -d ${APP_LOG_PATH}$(date +'%Y%m%d') ]]; then
    mkdir -p ${APP_LOG_PATH}$(date +'%Y%m%d')
    chmod 755 ${APP_LOG_PATH}$(date +'%Y%m%d')
fi
exec >>${APP_LOG_PATH}$(date +'%Y%m%d')/task.log 2>&1

echo $(date +'[%Y-%m-%d %H:%M:%S]')" start $0"

#指定基准日期，缺省时为脚本执行时的日期
base_date=${1:-`date "+%Y%m%d"`}
#聚合多少天数据，目前为60天
DAYS=60
#由于pv、click数据非实时生成，为保证脚本成功执行，需往前取几天，默认从基准日期前4天往前取$DAYS天数据
PRE_DAYS=3

#结果存放目录
dir_res=$APP_OUTPUT_DATA_PATH'official/result_merge/'${base_date}'/'
#清空历史结果数据
rm -rf ${dir_res}
mkdir -p ${dir_res}
chmod 755 ${dir_res}

#ecomon集群客户端
HADOOP_JOB_NAME_PV="merge_ps_query_url_pv"
HADOOP_JOB_NAME_CLICK="merge_ps_query_url_click"
HADOOP_JOB_NAME_MERGE="merge_ps_query_url"
HADOOP_JOB_PRIORITY="VERY_HIGH"
HADOOP_JOB_INPUT_PV=$dir_res"input_pv"
HADOOP_JOB_INPUT_CLICK=$dir_res"input_click"
HADOOP_JOB_OUTPUT_PV="/sujunjie/output_merge_pv_"$base_date
HADOOP_JOB_OUTPUT_CLICK="/sujunjie/output_merge_click_"$base_date
HADOOP_JOB_OUTPUT_RESULT="/sujunjie/output_result_"$base_date

##1、pv
create_input_file $DAYS $PRE_DAYS 'pv' $HADOOP_JOB_INPUT_PV 
$HADOOP_MULAN_BIN fs -rmr $HADOOP_JOB_OUTPUT_PV
$HADOOP_MULAN_BIN streaming \
    -Dmapred.job.name="${HADOOP_JOB_NAME_CLICK}" \
    -Dmapred.job.priority="${HADOOP_JOB_PRIORITY}" \
    -Dstream.memory.limit=4000 \
    -Dmapred.map.tasks=200 \
    -Dmapred.job.map.capacity=200 \
    -Dmapred.reduce.tasks=200 \
    -Dmapred.job.reduce.capacity=200 \
    -inputpathes "${HADOOP_JOB_INPUT_PV}" \
    -output "${HADOOP_JOB_OUTPUT_PV}" \
    -mapper "python-2.7.3/python-2.7.3/bin/python ./common.py" \
    -reducer "python-2.7.3/python-2.7.3/bin/python ./common.py P" \
    -file "${cur_dir}/common.py" \
    -cacheArchive "/python-2.7.3.tar.gz#python-2.7.3"
check_error $? 1

##2、click
create_input_file $DAYS $PRE_DAYS 'click' $HADOOP_JOB_INPUT_CLICK
$HADOOP_MULAN_BIN fs -rmr $HADOOP_JOB_OUTPUT_CLICK
$HADOOP_MULAN_BIN streaming \
    -Dmapred.job.name="${HADOOP_JOB_NAME_CLICK}" \
    -Dmapred.job.priority="${HADOOP_JOB_PRIORITY}" \
    -Dstream.memory.limit=4000 \
    -Dmapred.map.tasks=200 \
    -Dmapred.job.map.capacity=200 \
    -Dmapred.reduce.tasks=200 \
    -Dmapred.job.reduce.capacity=200 \
    -inputpathes "${HADOOP_JOB_INPUT_CLICK}" \
    -output "${HADOOP_JOB_OUTPUT_CLICK}" \
    -mapper "python-2.7.3/python-2.7.3/bin/python ./common.py" \
    -reducer "python-2.7.3/python-2.7.3/bin/python ./common.py C" \
    -file "${cur_dir}/common.py" \
    -cacheArchive "/python-2.7.3.tar.gz#python-2.7.3"
check_error $? 2

##3、merge
$HADOOP_MULAN_BIN fs -rmr $HADOOP_JOB_OUTPUT_RESULT
$HADOOP_MULAN_BIN streaming \
    -Dmapred.job.name="${HADOOP_JOB_NAME_MERGE}" \
    -Dmapred.job.priority="${HADOOP_JOB_PRIORITY}" \
    -Dstream.memory.limit=4000 \
    -Dmapred.map.tasks=200 \
    -Dmapred.job.map.capacity=200 \
    -Dmapred.reduce.tasks=200 \
    -Dmapred.job.reduce.capacity=200 \
    -input "${HADOOP_JOB_OUTPUT_PV}" \
    -input "${HADOOP_JOB_OUTPUT_CLICK}" \
    -output "${HADOOP_JOB_OUTPUT_RESULT}" \
    -mapper "python-2.7.3/python-2.7.3/bin/python ./map_merge.py" \
    -reducer "python-2.7.3/python-2.7.3/bin/python ./reduce_merge.py" \
    -file "${cur_dir}/map_merge.py" \
    -file "${cur_dir}/reduce_merge.py" \
    -cacheArchive "/python-2.7.3.tar.gz#python-2.7.3"
check_error $? 3

$HADOOP_MULAN_BIN fs -getmerge $HADOOP_JOB_OUTPUT_RESULT ${dir_res}/query_url_pv_click.txt
check_error $? 4

#拆分成10M左右小文件，防止大文件load引起数据库主从延迟
cd ${dir_res}
split -l150000 -a4 -d query_url_pv_click.txt query_url_pv_click_$base_date
check_error $? 5

#建表
new_table_name='pv_click'$(date +"%Y%m01" -d "next month")
create_table_sql="create table IF NOT EXISTS $new_table_name(
    id bigint(20) unsigned NOT NULL auto_increment COMMENT '主键',
    query varchar(100) NOT NULL COMMENT 'query词',
    url varchar(512) NOT NULL COMMENT 'query对应url',
    query_url_pv int(10) NOT NULL COMMENT 'query+url的pv',
    query_url_click int(10) NOT NULL COMMENT 'query+url的点击',
    PRIMARY KEY (official_query_price_id),
    KEY idx_query (query),
    KEY idx_url (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='xxoo';"
echo $(date +'[%Y-%m-%d %H:%M:%S]')" $create_table_sql"
$MYSQL_DF_INDUSTRY_M DF_Industry -e "$create_table_sql"
check_error $? 6

#遍历split出的小文件，load入库，失败的小文件最多重试$max_retry次，最大重试次数之后仍失败以非0退出
cur_times=0
max_retry=5
while split_files=`ls query_url_pv_click_${base_date}*` && (($cur_times <= $max_retry))
do
    for file in ${split_files}
    do
        load_data_sql="load data local infile '${dir_res}/$file' into table $new_table_name character set utf8 fields terminated by '\\t' (query, url, query_url_pv, query_url_click)"
        echo $(date +'[%Y-%m-%d %H:%M:%S]')" $load_data_sql"
        $MYSQL_DF_INDUSTRY_M DBNAME --local-infile=1 -e "$load_data_sql"
        if [[ $?'x' = '0x' ]]; then
            rm ${dir_res}/$file
        fi
        sleep 2s
    done
    let "cur_times++"
done
if split_files=`ls query_url_pv_click_${base_date}*`; then
    exit 7
fi

echo $(date +'[%Y-%m-%d %H:%M:%S]')" end $0"
