# POI批量导出

基于腾讯地图API开发，批量查询POI并导出数据为excel

- 指定区域查询
- 根据关键字查询POI，返回名称、电话
- 导出excel

## 腾讯地图API
需要申请腾讯地图API并创建应用。接口日免费调用上限10,000次，每次返回20条，理论每日可查询200,000条。

接口免费QPS上限为5，默认调用间隔300ms。

## 使用环境

[node](https://nodejs.org/en/) 版本要求：`node >= 16`

## 使用方法

### config.json

- API校验方式选择SK校验，获取到应用KEY和SK。
- regions 填写省市区县。
  - 行政区可用API获取[API文档](https://lbs.qq.com/service/webService/webServiceGuide/webServiceDistrict)，或者使用文档最下方的静态数据。
  - 不要带国家前缀，不要带逗号
- file_name 导出的 excel 的文件名。


```
{
    "application": {
        "SK": "****",
        "KEY": "AAQBZ-DBUCS-MV7OE-6AI5W-LS3H6-*****"
    },
    "regions": [
        "山东省枣庄市市中区",
        "山东省枣庄市薛城区",
        "山东省枣庄市峄城区",
        "山东省枣庄市台儿庄区",
        "山东省枣庄市山亭区",
        "山东省枣庄市滕州市"

    ],
    "file_name": "山东省枣庄市"
}
```

### 运行
填写config后执行命令进行查询，文件会保存在`./output`目录，同名文件会被覆盖。

``` shell
npm i
npm start
```


## excel

使用[exceljs](https://github.com/exceljs/exceljs/blob/master/README_zh.md#exceljs)导出，已经配置好适合打印的格式。