@extends('layouts.app')

@section('styles')
    <style>
        #rate_usdt_cny, #rate_krw_cny {
            border-radius: 3px;
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 1px solid #ccc;
            margin-right: 4px;
            font-size: 12px;
            width: 30px;
            line-height: 1.5;
            padding: 1px;
        }
        #rate_krw_cny {
            width: 120px;
        }
    </style>
@endsection

@section('content')
    <div class="container">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4>各币种huobi价和bithumb价对比</h4>
            </div>
            <table class="table table-striped table-hover">
                <tr class="info">
                    <th>币种</th>
                    <th>huobi价（usdt）</th>
                    <th>huobi价（CNY）<br><span class="small">当前汇率：<input id="rate_usdt_cny"><input id="btn_rate_usdt_cny" class="btn btn-default btn-xs" style="vertical-align:baseline" type="button" value="设置"></span></th>
                    <th>bithumb价（韩元）</th>
                    <th>bithumb价（CNY）<br><span class="small">当前汇率：<input id="rate_krw_cny"><input id="btn_rate_krw_cny" class="btn btn-default btn-xs" style="vertical-align:baseline" type="button" value="设置"></span></th>
                    <th>bithumb价 / huobi价（CNY）</th>
                </tr>
                <tr>
                    <td>BTC</td>
                    <td id="h_btc"></td>
                    <td id="h_btc_cny"></td>
                    <td id="b_btc"></td>
                    <td id="b_btc_cny"></td>
                    <td id="btc_b_div_h"></td>
                </tr>
                <tr>
                    <td>ETH</td>
                    <td id="h_eth"></td>
                    <td id="h_eth_cny"></td>
                    <td id="b_eth"></td>
                    <td id="b_eth_cny"></td>
                    <td id="eth_b_div_h"></td>
                </tr>
                <tr>
                    <td>DASH</td>
                    <td id="h_dash"></td>
                    <td id="h_dash_cny"></td>
                    <td id="b_dash"></td>
                    <td id="b_dash_cny"></td>
                    <td id="dash_b_div_h"></td>
                </tr>
                <tr>
                    <td>LTC</td>
                    <td id="h_ltc"></td>
                    <td id="h_ltc_cny"></td>
                    <td id="b_ltc"></td>
                    <td id="b_ltc_cny"></td>
                    <td id="ltc_b_div_h"></td>
                </tr>
                <tr>
                    <td>ETC</td>
                    <td id="h_etc"></td>
                    <td id="h_etc_cny"></td>
                    <td id="b_etc"></td>
                    <td id="b_etc_cny"></td>
                    <td id="etc_b_div_h"></td>
                </tr>
                <tr>
                    <td>XRP</td>
                    <td id="h_xrp"></td>
                    <td id="h_xrp_cny"></td>
                    <td id="b_xrp"></td>
                    <td id="b_xrp_cny"></td>
                    <td id="xrp_b_div_h"></td>
                </tr>
                <tr>
                    <td>BCH</td>
                    <td id="h_bch"></td>
                    <td id="h_bch_cny"></td>
                    <td id="b_bch"></td>
                    <td id="b_bch_cny"></td>
                    <td id="bch_b_div_h"></td>
                </tr>
                <tr>
                    <td>ZEC</td>
                    <td id="h_zec"></td>
                    <td id="h_zec_cny"></td>
                    <td id="b_zec"></td>
                    <td id="b_zec_cny"></td>
                    <td id="zec_b_div_h"></td>
                </tr>
                <tr>
                    <td>QTUM</td>
                    <td id="h_qtum"></td>
                    <td id="h_qtum_cny"></td>
                    <td id="b_qtum"></td>
                    <td id="b_qtum_cny"></td>
                    <td id="qtum_b_div_h"></td>
                <tr>
                    <td>EOS</td>
                    <td id="h_eos"></td>
                    <td id="h_eos_cny"></td>
                    <td id="b_eos"></td>
                    <td id="b_eos_cny"></td>
                    <td id="eos_b_div_h"></td>
                </tr>
            </table>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="https://cdn.jsdelivr.net/pako/1.0.3/pako.min.js"></script>
    <script>
        /**
         * 设置cookie
         */
        function setCookie(name, value) {
            var Days = 365;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days*24*60*60*1000);
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
        }

        /**
         * 获取cookie
         */
        function getCookie(name) {
            var arr,
                reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                return unescape(arr[2]);
            } else {
                return null;
            }
        }
    
        /**
         * 计算bithumb价 / huobi价（CNY）
         */
        function getBdivH(bType) {
            var priceHuobi = $('#h_' + bType.toLowerCase() + '_cny').text();
            var priceBithumb = $('#b_' + bType.toLowerCase() + '_cny').text();
            if ('' != priceHuobi && '' != priceBithumb) {
                var BdivH = priceBithumb / priceHuobi;
                $('#' + bType.toLowerCase() + '_b_div_h').text(BdivH.toFixed(6));
            }
        }
    
        $(function(){
            // usdt兑人民币汇率
            var rateUsdtCNY = getCookie('rate_usdt_cny');
            if (null !== rateUsdtCNY) {
                $('#rate_usdt_cny').val(rateUsdtCNY);
            }
            $('#btn_rate_usdt_cny').click(function() {
                setCookie('rate_usdt_cny', $('#rate_usdt_cny').val());
                rateUsdtCNY = $('#rate_usdt_cny').val();
            });

            // 韩元兑人民币汇率
            var rateKrwCNY = getCookie('rate_krw_cny');
            if (null !== rateKrwCNY) {
                $('#rate_krw_cny').val(rateKrwCNY);
            }
            $('#btn_rate_krw_cny').click(function() {
                setCookie('rate_krw_cny', $('#rate_krw_cny').val());
                rateKrwCNY = $('#rate_krw_cny').val();
            });

            // huobi websocket接口
            var wsHbUrl = 'wss://api.huobipro.com/ws';
            // 需要订阅的topic
            var topics = {
                'market.btcusdt.detail': 'h_btc',
                'market.ethusdt.detail': 'h_eth',
                'market.dashusdt.detail': 'h_dash',
                'market.ltcusdt.detail': 'h_ltc',
                'market.etcusdt.detail': 'h_etc',
                'market.xrpusdt.detail': 'h_xrp',
                'market.bchusdt.detail': 'h_bch',
                'market.zecusdt.detail': 'h_zec',
                'market.qtumusdt.detail': 'h_qtum',
                'market.eosusdt.detail': 'h_eos',
            };
            var ws = new WebSocket(wsHbUrl);
            ws.onopen = function() {    
                for (var topic in topics) {
                    subTopic(topic);
                }
            }
            ws.onmessage = function(msg) {  
                var reader = new FileReader();
                reader.readAsArrayBuffer(msg.data);
                reader.onload = function(evt) {
                    var target = evt.target || evt.srcElement;
                    if(target.readyState == FileReader.DONE){ 
                        var binData = new Uint8Array(target.result);
                        var json = pako.inflate(binData, {to: 'string'});
                        var data = JSON.parse(json);
                        dealData(data);
                    }
                }
            }

            /**
             * 订阅指定的topic
             */
            function subTopic(topic) {
                ws.send(
                    JSON.stringify(
                        {
                            'sub': topic,
                            'id': Math.round(Math.random() * 10000)
                        }
                    )
                );
            }            

            /**
             * 处理websocket接口返回数据
             */
            function dealData(data) {
                // console.log(data);
                // ping
                if (data['ping']) {
                    ws.send(
                        JSON.stringify(
                            {
                                'pong': data['ping']
                            }
                        )
                    );
                // 业务数据处理
                } else {
                    if (data['ch'] && data['ch'] in topics) {
                        var domId = topics[data['ch']];
                        $('#' + domId).html(data['tick']['close']);
                        if (rateUsdtCNY !== null) {
                            $('#' + domId + '_cny').html((data['tick']['close'] * rateUsdtCNY).toFixed(6));
                            getBdivH(domId.substring(2));
                        }
                    }
                } 

            }


            /**
             * bithumb站点价格获取
             */
            function showBithumbData() {
                $.getJSON(
                    '/b/ajax.php',
                    function(json) {
                        if (json.status == '0000') {
                            for (bType in json.data) {
                                if (bType == 'date'
                                    || bType == 'XMR'
                                    || bType == 'BTG'    
                                ) {
                                    continue;
                                }
                                $('#b_' + bType.toLowerCase()).html(json['data'][bType]['closing_price']);
                                if (rateKrwCNY !== null) {
                                    $('#b_' + bType.toLowerCase() + '_cny').html((json['data'][bType]['closing_price'] * rateKrwCNY).toFixed(6));
                                    getBdivH(bType);
                                }
                            }
                        }
                    }
                );
            }
            showBithumbData();
            setInterval(showBithumbData, 2000);
        });
    </script>
@endsection
