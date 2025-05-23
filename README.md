# taskflow-yaml-run
为 基于 `guandata taskflow` 的 API自动化测试项目 开发的 用例快速执行工具。

## Features 
### 执行打开的 yaml 文件
![image](https://raw.githubusercontent.com/jameswhf/taskflow-yaml-run/main/src/assets/editor_title_run.png)

[注] yaml 文件路径包含 `/src/main/resources/` 时, 才会支持 `▶️`

### 文件目录树右键运行

1. 执行单个 yaml 文件

![image](https://raw.githubusercontent.com/jameswhf/taskflow-yaml-run/main/src/assets/yaml_right_context_run.png)

2. 执行目录下所有 yaml 文件

![image](https://raw.githubusercontent.com/jameswhf/taskflow-yaml-run/main/src/assets/dir_right_context_run.png)

[注] 文件或文件夹路径包含 `/src/main/resources/` 时, 才会在右键中支持 `taskflow: 执行测试用例`

### Yaml文件中 clazz 的预览和跳转

![image](https://raw.githubusercontent.com/jameswhf/taskflow-yaml-run/main/src/assets/clazz_hover.png)

## Requirements
API 自动化项目需要符合 `guandata taskflow` 的测试要求。

**Enjoy!**
