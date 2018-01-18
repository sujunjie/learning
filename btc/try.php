<?php
/**
 * 调用huobi websocket接口
 */
require('vendor/autoload.php');

use WebSocket\Client;

$client = new Client("wss://api.huobipro.com/ws");
$client->send(
    json_encode(
        array(
            'sub' => 'market.ethusdt.detail',
            'id' => '133',
        )
    )
);
$client->send(
    json_encode(
        array(
            'sub' => 'market.btcusdt.detail',
            'id' => '233',
        )
    )
);

while ($rec = $client->receive()) {
    $rec = gzdecode($rec);
    $rec = json_decode($rec, true);
    if (isset($rec['ping'])) {
        $client->send(
            json_encode(
                array(
                    'pong' => $rec['ping'],
                )
            )
        );
    } else {
        var_dump($rec);   
    }
}
?>
