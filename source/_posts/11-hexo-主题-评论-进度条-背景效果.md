---
title: 「11」hexo 主题&评论&进度条&背景效果
date: 2020/09/23 01:10:02
updated: 2020/09/23 01:10:02
keywords: hexo,hexo主题,hexo评论,next主题评论,hexo阅读进度条
tags:
    - hexo
    - hexo插件
---

晚上折腾了下博客，稍微装饰了下，主要还是加了个评论吧，其它非常秀的插件就没有接入了，懒得折腾，好好写博客，内容才是精华。
记录下折腾史：

### gitalk评论插件

#### 步骤：
##### 申请id和secret
![](https://raw.githubusercontent.com/crab21/Images/master/blog/36f31671-8ada-4cbe-b60b-d1595dd701ee.png)

<!-- more -->

#### 配置文件：

```
gitalk:
  enable: true
  github_id: crab21 # GitHub repo owner
  repo: blog # Repository name to store issues
  client_id: XXX # GitHub Application Client ID
  client_secret: XXX # GitHub Application Client Secret
  admin_user: crab21 # GitHub repo owner and collaborators, only these guys can initialize gitHub issues
  distraction_free_mode: true # Facebook-like distraction free mode
  perPage: 15 #每页多少个评论
  pagerDirection: last  #排序方式是从旧到新（first）还是从新到旧（last）
  createIssueManually: true #如果当前页面没有相应的 isssue ，且登录的用户属于 admin，则会自动创建 issue。如果设置为 true，则显示一个初始化页面，创建 issue 需要点击 init 按钮。
  distractionFreeMode: true #是否启用快捷键(cmd|ctrl + enter) 提交评论.

  # Gitalk's display language depends on user's browser or system environment
  # If you want everyone visiting your site to see a uniform language, you can set a force language value
  # Available values: en | es-ES | fr | ru | zh-CN | zh-TW
  language:
```

### pac阅读进度百分比
1、github地址： https://github.com/HubSpot/pace，可以看下介绍
2、修改值：
    修改主题下面的_config.yml：
    ```go
    pace:
        enable: true
        # Themes list:
        # big-counter | bounce | barber-shop | center-atom | center-circle | center-radar | center-simple
        # corner-indicator | fill-left | flat-top | flash | loading-bar | mac-osx | material | minimal
        theme: minimal
    ```

### reading_progress

github地址：https://github.com/theme-next/theme-next-reading-progress

包含使用说明和具体的步骤，就不搬运了，及时调整。

### 文章字数和阅读时间统计：

hexo配置文件中修改：
    `symbols_count_time` 为true.

### back2top
开启模式
```
back2top:
  enable: true
  # Back to top in sidebar.
  sidebar: true
  # Scroll percent label in b2t button.
  scrollpercent: true
```
### 持续更新...

### END
