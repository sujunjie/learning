#/bin/sh


#多行注释
:<<\###
ls
pwd
###


# BASH_SOURCE
echo ${BASH_SOURCE}
echo $(cd $(dirname ${BASH_SOURCE[0]}) && pwd)


# shell 字符串处理
str='/abc/def/g'
# 截取
echo ${str:0:3}  # /ab
# 尽可能少地去掉/以及其左侧字符
echo ${str#/}    # abc/def/g
# 尽可能多地去掉/以及其左侧字符
echo ${str##*/}  # g
# 尽可能多地去掉a以及其右侧字符
echo ${str%%a*}  # /



