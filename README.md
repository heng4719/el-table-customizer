## 使用说明
给用户提供了可以自定义修改elementUI表格的能力，通过混入(mixins)使用，必须先安装element-ui。

通过npm安装：
```
    npm i el-table-customizer
```
使用方法如下：

    <script>
    import tableCustomTool from 'el-table-customizer'
    export default {
      mixins:[tableCustomTool],
    }
    </script>

## 目前支持修改
1. 字体颜色
2. 背景颜色
3. 边框颜色
4. 文本位置
5. 文本粗细
6. 文字大小
7. 可以隐藏/显示某些列
8. 本地保存修改后的列宽

[![pSs2FaV.png](https://s1.ax1x.com/2023/02/03/pSs2FaV.png)](https://imgse.com/i/pSs2FaV)
[![pSsgTKA.png](https://s1.ax1x.com/2023/02/03/pSsgTKA.png)](https://imgse.com/i/pSsgTKA)
