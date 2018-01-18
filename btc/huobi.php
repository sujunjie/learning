<?php
/**
 * 
 */

define('CASPERJS', '/usr/bin/casperjs');
define('REDIS_KEY', 'btc_huobi_price');

$casperjsOp = ' --cookies-file=/tmp/phantom/cookies.txt --ssl-protocol=ANY --ignore-ssl-errors=true --web-security=no --disk-cache=yes ';
$jsFile = 'huobi.js';

$cmd = CASPERJS . $casperjsOp . $jsFile;
exec($cmd, $arrOutput, $status);
$result =  $arrOutput[0];
if (preg_match_all('/<em class="base_currency">(.*?)<\/em><\/span>.*?<span price="price">(.*?)<\/span>/', $result, $m)) {
    $arrPrice = array_combine($m[1], $m[2]);
    if (!empty($arrPrice)) {
        $arrJson = array(
            'dateTime' => date('Y-m-d H:i:s'),
            'data' => $arrPrice,
        );
        $strJson = json_encode($arrJson);
        insertIntoRedis($strJson);
    }
} else {
    trigger_error($result, E_USER_ERROR);
}

function insertIntoRedis($value) {
    $redis = new Redis();
    $redis->connect('127.0.0.1', '6379');
    $ret = $redis->set(REDIS_KEY, $value);
    if (!$ret) {
        trigger_error('insert into redis failed, value: ' . $value);
    }
}
?>
