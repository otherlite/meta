
## vscode远程开发

### 服务器准备
前端开发2核2G足够了，[腾讯云轻量应用服务器-58元/年](https://cloud.tencent.com/act/pro/lighthouse2021)，系统我选择了Docker基础镜像`CentOS7.6-Docker20`

### 本机生成密钥
[ssh-keygen](https://git-scm.com/book/zh/v2/%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84-Git-%E7%94%9F%E6%88%90-SSH-%E5%85%AC%E9%92%A5)生成密钥，会产生一个公钥私钥对

### 公钥上传到服务器
> 该步骤是为了服务器的免密登录，具体的`端口`、`用户名`、`服务器IP`可以去厂商控制台查看配置
```shell
ssh-copy-id -p [端口] -i [本机公钥地址] [用户名]@[服务器IP]
// 例如 ssh-copy-id -p 22 -i .ssh/id_rsa.pub root@114.132.121.98
```

### 安装vscode插件
`vscode`插件搜索`remote development`并安装

### 配置vscode
* 敲击`command + shift + p` 打开vscode palette
* 输入`remote ssh: OPen SSH COnfiguration File`打开远程开发配置文件
* 输入配置
    ```yaml
    Host [随便起个名]
        HostName [服务器IP]
        User [用户名]
        Port [端口]
    # 例如
    # Host tencentCloud
    #     HostName 114.132.121.98
    #     User root
    #     Port 22
    ```

### vscode连接服务器
* 敲击`command + shift + p` 打开vscode palette
* 输入`Remote-SSH: Connect to Host`连接上文创建的服务器

### 安装git
```shell
curl https://setup.ius.io | sh
yum install -y git236
```
更多请参考[IUS](https://ius.io/setup)

### 安装pnpm
```shell
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
更多参考[pnpm](https://pnpm.io/zh/installation)

### 安装node
```shell
pnpm env use --global 16
```
更多参考[pnpm env](https://pnpm.io/zh/cli/env)

### 开始愉快的开发
😊😊😊