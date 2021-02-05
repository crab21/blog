---
title: 「14」hexo-安装&插件
date: '2020/09/30 19:24:32'
updated: '2021/02/05 19:27:28'
tags:
  - hexo
abbrlink: ae4aba0d
---

hexo安装及其第三方插件包下载总结，以便后续CI一次到位。
<!--more-->
```go
 npm install -g hexo-cli
 npm install hexo-renderer-sass --save
 npm install hexo-generator-searchdb --save
 npm install hexo-generator-sitemap --save
 npm install hexo-generator-baidu-sitemap --save
 npm install request --save
 npm install xml-parser --save
 npm install yamljs --save
 npm install md5 --save
 npm install request --save
 npm install xml-parser --save
 npm install yamljs --save
 npm install cheerio --save
 npm install blueimp-md5 --save
 npm install hexo-abbrlink --save
 npm audit fix

 npm uninstall hexo-generator-index --save
 npm install hexo-generator-index-pin-top --save
 npm audit fix
 
 npm install hexo-neat --save
 npm audit fix
 npm install --save hexo-admin
 npm audit fix
 npm install hexo-deployer-git --save
 npm audit fix

 sudo npm install hexo-toc --save
 npm audit fix

//猫咪模型
 sudo npm install --save hexo-helper-live2d 
 npm audit fix
 sudo npm install --save live2d-widget-model-z16
```


>update: 2021-02-05 19:25:42

hexo next解析插件更换：
```go
npm un hexo-renderer-marked -S

npm un hexo-renderer-marked --save

再安装下面插件：


npm install --save markdown-it-abbr
npm install --save markdown-it-footnote
npm install --save markdown-it-ins
npm install --save markdown-it-sub
npm install --save markdown-it-sup
npm install --save markdown-it-anchor
npm install --save markdown-it-deflist
npm install --save markdown-it-mark
npm install --save markdown-it-container

npm install --save markdown-it-emoji
npm install --save markdown-it-attrs
npm install --save markdown-it-task-lists



最后更新下hexo更目录下的_config.yaml

# Markdown-it config
## Docs: https://github.com/celsomiranda/hexo-renderer-markdown-it/wiki
markdown:
  render:
    # Enable HTML tags in source
    html: true

    # Use '/' to close single tags (<br />). This is only for full CommonMark compatibility.
    xhtmlOut: true        

    # Convert '\n' in paragraphs into <br> 
    breaks: true      

    # CSS language prefix for fenced blocks. Can be useful for external highlighters.
    langPrefix: 'language-'  

    # Autoconvert URL-like text to links 
    linkify: true        

    # Enable some language-neutral replacement + quotes beautification
    typographer: false

    # Double + single quotes replacement pairs, when typographer enabled,
    # and smartquotes on. Could be either a String or an Array.
    #
    # For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    # and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '“”‘’'

  # Plugins
  plugins:
    - markdown-it-abbr
    - markdown-it-footnote
    - markdown-it-ins
    - markdown-it-sub
    - markdown-it-sup
    - markdown-it-anchor
    - markdown-it-deflist
    - markdown-it-mark
    - markdown-it-container

    - markdown-it-emoji
    - markdown-it-attrs
    - name: markdown-it-task-lists
      options:
        enabled: false
        label: true
        labelAfter: false
  
  # Automatic Headline ID's
  anchors:
    # Minimum level for ID creation. (Ex. h2 to h6)
    level: 2

    # A suffix that is prepended to the number given if the ID is repeated.
    collisionSuffix: 'v'           

    # If `true`, creates an anchor tag with a permalink besides the heading.
    permalink: false              

    # Class used for the permalink anchor tag.
    permalinkClass: header-anchor 

    # The symbol used to make the permalink
    permalinkSymbol: ¶

```


>未完待续......