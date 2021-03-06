# timeAlert

## 核心

在编程时每间隔一段时间通知任务

## 说明

在 1.0.0 版本未发布之前，任务结构 or 配置之间的变动在升级前后的结构不会进行任何转化，那怕存储任务的结构变更。在升级后，建议卸载重装一遍，以适应迭代后的数据结构

## 更新记录

任务添加 link：添加聚焦在文件的某个地方，以记录任务所在的地方
子功能：增删改

任务优先级：任务按优先级排序，优先级显示在任务尾部

## to do list

-   [x] 添加任务
-   [x] 删除任务
-   [x] 任务存储方案，本地 tasks 文件存储
-   [x] 活动栏
    -   [x] 承接 webview 的功能
    -   [x] hash 计算 title 作为 key 索引
    -   [x] 在活动栏以树形结构操控
    -   [x] 以右击的方式完成增删改查
-   [x] 完善输入任务功能
    -   [x] 添加备注
    -   [x] 改变通知方式
-   [x] 选择框切换状态
-   [x] 锚点，以文件为锚点，可直接定位到一 x 个文件或多个文件
-   [x] 备注
    -   [x] 限制标题长度
    -   [x] 信息体现放在备注上
-   [x] 优先级，修改优先级，以优先级排序
    -   [x] 增，删，改，查都使用二分寻找位置

### 0.0.5

-   [x] 自增长 id 作为 key 索引

### next version

PS: (1) 代表要添加到 setting 作为用户可自定义的

-   [ ] webview(待定，webview 只是增加功能，而不是必要功能)
    -   [ ] 增删改查
-   [x] 分类
    -   [x] 任务自定义分类(1)
-   [x] 任务通知
    -   [x] 任务提示种类增加
        -   [x] 行间提示，直接影响到写代码(1)
            -   [x] 显示时颜色的配置
    -   [ ] 完善任务通知规则
        -   [ ] 任务提示间隔

## 设计方案

分类
自定义配置

```json
[
    {
        "label": "完成",
        "key": 1
    },
    {
        "label": "未完成",
        "key": 2
    },
    {
        "label": "待定",
        "key": 3
    }
]
```

```json
{
    "timealert.lineAlert": {
        "type": "boolean",
        "default": true,
        "description": "任务时，是否直接在聚焦的行间显示"
    },
    "timealert.lineAlertColor": {
        "type": ["string", "array"],
        "default": "rgb(28, 224, 235)",
        "description": "行间提醒时，显示的颜色"
    },
    "timealert.typeConfig": {
        "type": "array",
        "default": [
            {
                "label": "完成",
                "value": 1
            },
            {
                "label": "未完成",
                "value": 0
            },
            {
                "label": "待定",
                "value": 2
            }
        ],
        "description": "任务列表标题"
    },
    "timealert.initialType": {
        "type": "number",
        "description": "任务初始化时，所在的类型中",
        "default": 0
    }
}
```
