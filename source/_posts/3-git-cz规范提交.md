---
title: 「3」git cz规范提交
date: '2020/08/31 20:14:33'
updated: '2020/08/31 20:14:33'
keywords: 'git,git commit,git提交规范'
tags:
  - Git
abbrlink: 458b44c2
---

### 定义

[官方 specification](https://github.com/commitizen/cz-cli)
简单的说为了代码提交更加规范

### 场景
git commit使用
https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png

### 使用步骤
* 安装nodejs，版本建议最新.[官网](https://nodejs.org/zh-cn/) 
* 打开你的命令行：
<!-- more -->
```
        输入：npm install -g commitizen
        windows应该是cmd吧。
        mac用终端或者iterm2都可以。
```
>提示以下信息即成功。
```
        -> % sudo npm install -g commitizen
        Password:
        npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
        npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
        /usr/local/bin/cz -> /usr/local/lib/node_modules/commitizen/bin/git-cz
        /usr/local/bin/git-cz -> /usr/local/lib/node_modules/commitizen/bin/git-cz
        /usr/local/bin/commitizen -> /usr/local/lib/node_modules/commitizen/bin/commitizen
        + commitizen@4.2.1
        updated 1 package in 8.132s
```
3、进入git项目中，执行下面命令初始化环境。
```commitizen init cz-conventional-changelog --save --save-exact```

4、在提交代码时使用
>git cz 替换 git commit命令

### 注意事项

* 安装方式可选择全局安装
```
npm install -g commitizen cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

```