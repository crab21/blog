---
title: 「90」kubebuilder
date: 2022/03/29 22:13:29
tags:
    - k8s
    - operator
    - kubebuilder
---



作为k8s 官方提供的扩展能力，介绍的就不多说了，看这里 [ ☞ Kubebuilder Quick Start](https://book.kubebuilder.io/quick-start.html)

开干吧：

<!--more-->

### 依赖

### init project初始化

```go
mkdir project

cd project

kubebuilder init --domain imrcrab.com --repo github.com/crab21/k8s-op --skip-go-version-check
```

>完成后就可以看到这样的目录结构{可能后续版本变化，结构也会变化}：

```markdown
# tree -L 10
.
├── config
│   ├── default
│   │   ├── kustomization.yaml
│   │   ├── manager_auth_proxy_patch.yaml
│   │   └── manager_config_patch.yaml
│   ├── manager
│   │   ├── controller_manager_config.yaml
│   │   ├── kustomization.yaml
│   │   └── manager.yaml
│   ├── prometheus
│   │   ├── kustomization.yaml
│   │   └── monitor.yaml
│   └── rbac
│       ├── auth_proxy_client_clusterrole.yaml
│       ├── auth_proxy_role_binding.yaml
│       ├── auth_proxy_role.yaml
│       ├── auth_proxy_service.yaml
│       ├── kustomization.yaml
│       ├── leader_election_role_binding.yaml
│       ├── leader_election_role.yaml
│       ├── role_binding.yaml
│       └── service_account.yaml
├── Dockerfile
├── go.mod
├── go.sum
├── hack
│   └── boilerplate.go.txt
├── main.go
├── Makefile
└── PROJECT

6 directories, 24 files
```

### create API

>创建一个g: batch     v:v1    kind: CronJob的API

```markdown
kubebuilder create api --group batch --version v1 --kind CronJob
```

>完成后的目录结构{可能会随版本变化而变化}

```markdown
─# tree -L 10
.
├── api
│   └── v1
│       ├── cronjob_types.go
│       ├── groupversion_info.go
│       └── zz_generated.deepcopy.go
├── bin
│   └── controller-gen
├── config
│   ├── crd
│   │   ├── kustomization.yaml
│   │   ├── kustomizeconfig.yaml
│   │   └── patches
│   │       ├── cainjection_in_cronjobs.yaml
│   │       └── webhook_in_cronjobs.yaml
│   ├── default
│   │   ├── kustomization.yaml
│   │   ├── manager_auth_proxy_patch.yaml
│   │   └── manager_config_patch.yaml
│   ├── manager
│   │   ├── controller_manager_config.yaml
│   │   ├── kustomization.yaml
│   │   └── manager.yaml
│   ├── prometheus
│   │   ├── kustomization.yaml
│   │   └── monitor.yaml
│   ├── rbac
│   │   ├── auth_proxy_client_clusterrole.yaml
│   │   ├── auth_proxy_role_binding.yaml
│   │   ├── auth_proxy_role.yaml
│   │   ├── auth_proxy_service.yaml
│   │   ├── cronjob_editor_role.yaml
│   │   ├── cronjob_viewer_role.yaml
│   │   ├── kustomization.yaml
│   │   ├── leader_election_role_binding.yaml
│   │   ├── leader_election_role.yaml
│   │   ├── role_binding.yaml
│   │   └── service_account.yaml
│   └── samples
│       └── batch_v1_cronjob.yaml
├── controllers
│   ├── cronjob_controller.go
│   └── suite_test.go
├── Dockerfile
├── go.mod
├── go.sum
├── hack
│   └── boilerplate.go.txt
├── main.go
├── Makefile
└── PROJECT

13 directories, 37 files
```