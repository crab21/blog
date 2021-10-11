---
title: 「81」kspan结合jaeger使用
date: 2021/10/11 19:22:29
tags:
    - jaeger
    - 监控
---


起始是对于kubernetes的监控需求，包括：pull、attached PVC 、created等events事件耗时。

那jaeger/tempo/Prometheus就可以满足这样的需求..........

但是呢，自己写太麻烦了。

Searching...... 

github有个成熟的kspan可以：👉🏻👉🏻👉🏻👉🏻

<!--more-->

[👉🏿👉🏿 kspan Github](kspanhttps://github.com/weaveworks-experiments/kspan)


不废话了，先来试试吧：

### kspan发布&部署

#### 1、构建&上传docker镜像

```
1、git clone https://github.com/weaveworks-experiments/kspan.git
2、docker build -t kspan-controller:v0.1 .
3、docker login xxxx                                  
4、docker tag kspan-controller:v0.1 xxxx/kspan-controller:v0.1
5、docker push xxxx/kspan-controller:v0.1
```

#### 2、预先准备 kubernetes 的RABC权限

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: manager-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: manager-role
subjects:
- kind: ServiceAccount
  name: default
  namespace: system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: manager-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: manager-role
subjects:
- kind: ServiceAccount
  name: default
  namespace: system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: manager-role
rules:
- apiGroups: ["*"]
  resources: ["*","replicasets","pods","apps"]
  verbs: ["get", "watch", "list"]
```


#### 3、预先准备 jaeger等

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: system
  name: kspan
  labels:
    app: kspan
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kspan
  template:
    metadata:
      labels:
        app: kspan
    spec:
      containers:
      - name: jaegertracing
        image: jaegertracing/opentelemetry-all-in-one
        ports:
        - containerPort: 16686
        - containerPort: 55680
```

#### 4、kspan controller-manager

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: controller-manager
  namespace: system
  labels:
    control-plane: controller-manager
spec:
  selector:
    matchLabels:
      control-plane: controller-manager
  replicas: 1
  template:
    metadata:
      labels:
        control-plane: controller-manager
    spec:
      containers:
      - args:
        - --otlp-addr=xxx.xxx.xxx.xxx:55680
        command:
        - /manager
        image: imrcrab/kspan-controller:v0.1
        name: manager
        resources:
          limits:
            cpu: 100m
            memory: 30Mi
          requests:
            cpu: 100m
            memory: 20Mi
      terminationGracePeriodSeconds: 10
```
### kspan测试和结果总结

#### 1、test: deployment one pod

#### 2、Summary

