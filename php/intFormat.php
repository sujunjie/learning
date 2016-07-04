<?php
/*
 * 利用正则表达式的环视功能格式化整型数字为xx,xxx,xxx,xxx这种格式
 *
 */
echo preg_replace('/(?<=\d)(?=(\d\d\d)+$)/', ',', $argv[1]);
?>
