<?php
    $url = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2016/index.html';
    $content = file_get_contents($url);
    preg_match_all('/<a href=\'(\d\d\.html)\'>([^<]+)/', $content, $matches);
    //var_dump($matches);
    foreach ($matches[1] as $index => $html) {
        echo $matches[2][$index] . "\n";
        $htmlUrl = str_replace('index.html', $html, $url);
        $content = file_get_contents($htmlUrl);
        preg_match_all('/<tr class=\'citytr\'><td><a href=\'(.*?)\'>(\d+)<\/a><\/td><td><a href=\'\1\'>([^<]+)<\/a><\/td><\/tr>/', $content, $matches1);
        foreach ($matches1[1] as $index1 => $html1) {
            echo "\t" . $matches1[3][$index1] . "\t" . $matches1[2][$index1] . "\n";
            $cityUrl =  str_replace($html, $html1, $htmlUrl);
            $content = file_get_contents($cityUrl);
            if (preg_match('/<tr class=\'countytr\'><td>(\d+)<\/td><td>([^<]*)<\/td><\/tr>/', $content, $temp1)) {
                echo "\t\t" . $temp1[2] . "\t" . $temp1[1] . "\n";
            }
            preg_match_all('/<tr class=\'countytr\'><td><a href=\'(.*?)\'>(\d+)<\/a><\/td><td><a href=\'\1\'>([^<]+)<\/a><\/td><\/tr>/', $content, $matches2);
            foreach ($matches2[1] as $index2 => $html2) {
                echo "\t\t" . $matches2[3][$index2] . "\t" . $matches2[2][$index2] . "\n";
                $townUrl = preg_replace('/[^\/]*\.html/', $html2, $cityUrl);
                $content = file_get_contents($townUrl);
                preg_match_all('/<tr class=\'towntr\'><td><a href=\'(.*?)\'>(\d+)<\/a><\/td><td><a href=\'\1\'>([^<]+)<\/a><\/td><\/tr>/', $content, $matches3);
                foreach ($matches3[1] as $index3 => $html3) {
                    echo "\t\t\t" . $matches3[3][$index3] . "\t" . $matches3[2][$index3] . "\n";
                }
            }
            //var_dump($matches2);
        }
    }
?>
