---
title: Git GPG签署工作
date: 2020-09-02 22:29:40
keywords: git,git签署证书,git常用
tags:
    - Git
---

### GPG场景

 Git 虽然是密码级安全的，但它不是万无一失的。 如果你从因特网上的其他人那里拿取工作，并且想要验证提交是不是真正地来自于可信来源， Git 提供了几种通过 GPG 来签署和验证工作的方式。

 最终效果：如下图所示

 ![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902123343.png)

### 安装过程

windows安装地址： [点击下载](https://www.gnupg.org/)

mac os为例：
<!-- more -->
#### 安装GPG
```
brew install gpg

查看结果：
± gpg --version                                                                                                                                                                                                                                     ⏎

gpg (GnuPG) 2.2.22
libgcrypt 1.8.6
Copyright (C) 2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: /Users/gogoowang/.gnupg
支持的算法：
公钥： RSA, ELG, DSA, ECDH, ECDSA, EDDSA
密文： IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
    CAMELLIA128, CAMELLIA192, CAMELLIA256
散列： SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
压缩：  不压缩, ZIP, ZLIB, BZIP2

```

#### 生成密钥
```
gpg --full-generate-key
```

需要填写的地方：
![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902123803.png)


#### 查看密钥完整信息

```
gpg --list-secret-keys --keyid-format LONG
```

>secret keys（红圈地方后续用到，留意下）：

![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902124016.png)

#### 根据secret keys生成PGP

```
gpg --armor --export  7BB8CF3593CA174C
```

生成的PGP结果，后续需要将此结果导入到Github账号的配置信息中
![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902124305.png)

#### Github账号中设置

![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902124443.png)

![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902124527.png)


>将上述生成的PGP填入，点击[Add GPG Key]即可


#### 配置本地GPG签名信息
依次执行下面命令
```
1、git config --global user.signingkey 7BB8CF3593CA174C  #此处的7BB8CF3593CA174C为生成的secret keys
2、git config commit.gpgsign true
3、git config --global commit.gpgsign true
```

#### Git PGP生效

>再次提交commit即可生效。产生如下图的签名效果：
![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200902123343.png)

#### End