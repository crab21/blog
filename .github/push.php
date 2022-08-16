<?php

// 获取 sitemap 地址和推送地址
$opt = getopt('s:p:');
if (empty($opt['s']) || empty($opt['p'])) {
    throw new \Exception('关键参数不能为空');
}

// 从 sitemap 中解析出网址列表
function get_site_urls($sitemap_url)
{
    $content = file_get_contents($sitemap_url);
    if (empty($content)) {
        return [];
    }

    $xml = simplexml_load_string($content);
    if (!$xml) {
        return [];
    }
    
    $urls = [];
    foreach ($xml->url as $url) {
        $urls[] = (string) $url->loc;
    }

    return $urls;
}

// 将网址列表推送到百度
function push_to_baidu($push_url, $urls)
{
    $ch = curl_init();
    $options = [
        CURLOPT_URL => $push_url,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_POSTFIELDS => implode("\n", $urls),
        CURLOPT_HTTPHEADER => ['Content-Type: text/plain'],
    ];
    curl_setopt_array($ch, $options);
    return curl_exec($ch);
}

// 获取需要推送的网址列表
$urls = get_site_urls($opt['s']);
if (empty($urls)) {
    throw new \Exception('网址列表为空');
}

// 调用推送函数
echo push_to_baidu($opt['p'], $urls).PHP_EOL;
