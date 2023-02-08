import { addClass, removeClass } from 'element-ui/src/utils/dom';

export default {
  data() {
    return{
      customizerTables:[], //table元素的二维数组
      customizerThs:[],//th元素的二维数组
      customizerTds:[], //td元素的二维数组
      customizerInterval: {}, //定时器
      customizerCount: 0, //循环等待次数
      customizerMountedFinished: false
    }
  },

  mounted() {
    //需要等待tableBody加载出来才能加载
    setTimeout(() => {
      let emptyBody = document.getElementsByClassName("el-table__empty-block")
      if(emptyBody.length > 0){
        this.customizerInterval = setInterval(() => {
          let emptyBody = document.getElementsByClassName("el-table__empty-block")
          if(this.customizerCount > 8 || emptyBody.length == 0){
            clearInterval(this.customizerInterval)
            this.customizerInitCustom()
          }
          this.customizerCount++
        }, 2000);
      }else{
        this.customizerInitCustom()
      }
    }, 300);
  },

  methods: {
    customizerInitCustom(){
      //记录表格dom
      this.customizerSaveTableDom()
      //重写表格拖拽方法
      this.customizerReplaceMyFun()
      //读取配置数据
      let config = this.customizerGetConfigs()
      
      if(config && config[`${window.location.pathname}`]){
        //存在配置，则应用配置
        this.customizerApplyConfig(config[`${window.location.pathname}`])
      }else{
        //不存在配置，则读取页面表格样式并保存
        this.customizerSaveConfig(config, true)
      }
      //初始化表格配置侧栏
      this.customizerCreateConfigPage(this.customizerChangeStyleFunc)
      this.customizerMountedFinished = true
    },
    customizerSaveTableDom(){
      let tables = [document.getElementsByClassName("el-table").item(0)]
      this.customizerTables = tables;
      tables.forEach((table) => {
        table = table.__vue__
        //每列
        let tempThs = []
        let tempTds = []
        for(let i = 0; i < table.columns.length; i++){
          let cols = document.getElementsByClassName(table.columns[i].id)
          //每行
          for(let i = 0; i < cols.length; i++){
            //表头
            if(cols[i].nodeName == "TH"){
              tempThs.push(cols[i])
            }else if(cols[i].nodeName == "TD"){
              tempTds.push(cols[i])
            }
          }
        }
        this.customizerThs.push(tempThs)
        this.customizerTds.push(tempTds)

        //替换onColumnsChange
        table.layout.observers.forEach((observer)=>{
          observer.onColumnsChange = this.customizerMyOnColumnsChange
        })
        table.layout.updateColumnsWidth = this.customizerMyUpdateColumnsWidth
      });
    },
    //将表头的拖拽事件回调替换为我们的回调方法 
    customizerReplaceMyFun(){
      //拿到表头元素
      let tableHeader = this.$el.getElementsByClassName("el-table__header");
      this.headers = tableHeader
      
      for (let i = 0; i < tableHeader.length; i++) {
        //重写方法
        tableHeader[i].__vue__.handleMouseDown = this.customizerMyHandleMouseDown        
      }
      let tables = [...document.getElementsByClassName("el-table")]

      for (let i = 0; i < tables.length; i++) {
        tables[i] = tables[i].__vue__
        //替换onColumnsChange
        tables[i].layout.observers.forEach((observer)=>{
          observer.onColumnsChange = this.customizerMyOnColumnsChange
        })
        tables[i].layout.updateColumnsWidth = this.customizerMyUpdateColumnsWidth
        
      }
    },
    //读取配置数据并返回
    customizerGetConfigs(){
        let widthConfigs = localStorage.getItem("tableConfigs")
        if (widthConfigs == null){
              return
        }else if(widthConfigs != null && JSON.parse(widthConfigs)[`${window.location.pathname}`] == undefined){
          return JSON.parse(widthConfigs)
        }
        return JSON.parse(widthConfigs)
    },
    customizerApplyConfig(config){
      let tables = [...document.getElementsByClassName("el-table")]
      //每表
      for(let index = 0; index < tables.length; index++){        
        tables[index] = tables[index].__vue__
        //每列
        for(let i = 0; i < tables[index].columns.length; i++){
          let cols = document.getElementsByClassName(tables[index].columns[i].id)
          let isIndex = false
          //拿到列名 
          let colName = cols.item(0).textContent.replaceAll(' ', '')              
          if(colName == "#"){
            isIndex = true
          }
          if(config[index][colName].width){
            tables[index].columns[i].width = config[index][colName].width
          }
         //每行
         cols = [...cols]
         for(let k = 0; k < cols.length; k++){            
            //表头
            if(cols[k].nodeName == "TH"){
              //修改样式
              // 表头文字颜色修改 .el-table th -> color
              cols[k].style.color = config[index]['headerStyle'].headerColor
              // //表头文字大小修改 .el-table th -> font-size
              cols[k].style.fontSize = config[index]['headerStyle'].headerFontSize
              // //表头文字粗细修改 .el-table th -> font-weight
              cols[k].style.fontWeight = config[index]['headerStyle'].headerFontWeight
              // //表头文字居中配合 class添加 .is-center
              cols[k].style.textAlign = config[index]['headerStyle'].headerTextAlign
              //序号列文本位置固定为居中
              if(isIndex){
                cols[k].style.textAlign = "center"
              }
              // //表头背景色 .el-table.el-table--border th -> background-color
              cols[k].style.backgroundColor = config[index]['headerStyle'].headerBackgroundColor
              // //表头边框色 .el-table.el-table--border th -> border-color
              cols[k].style.borderColor = config[index]['headerStyle'].headerBorderColor
              //可以按照顺序！第一个的左+上，最后一个右+上，其余 上 边框处理
              cols[k].style.borderStyle = "solid"
              cols[k].style.borderWidth = "1px"
              cols[k].style.borderTop = "none"
              cols[k].style.borderLeft = "none"
               //如果是最后一列
              if( i == tables[index].columns.length - 1){
                // cols[k].style.borderRight = "none"
              }
            }else if(cols[k].nodeName == "TD"){
              // 表头文字颜色修改 .el-table th -> color
              cols[k].style.color = config[index]['bodyStyle'].bodyColor
              // //表头文字大小修改 .el-table th -> font-size
              cols[k].style.fontSize = config[index]['bodyStyle'].bodyFontSize
              // //表头文字粗细修改 .el-table th -> font-weight
              cols[k].style.fontWeight = config[index]['bodyStyle'].bodyFontWeight
              // //表头文字居中配合 class添加 .is-center
              cols[k].style.textAlign = config[index]['bodyStyle'].bodyTextAlign
              //序号列文本位置固定为居中
                if(isIndex){
                  cols[k].style.textAlign = "center"
                }
              // //表头背景色 .el-table.el-table--border th -> background-color
              cols[k].style.backgroundColor = config[index]['bodyStyle'].bodyBackgroundColor
              // //表头边框色 .el-table.el-table--border th -> border-color
              cols[k].style.borderColor = config[index]['bodyStyle'].bodyBorderColor
              // //表头边框类型修改 .el-table.el-table--border td -> border-style
              cols[k].style.borderStyle = config[index]['bodyStyle'].bodyBorderStyle
              
              // cols[k].style.borderTop = "none"
              // cols[k].style.borderLeft = "none"
               //如果是最后一列
               if( i == tables[index].columns.length - 1){
                // cols[k].style.borderRight = "none"
              }
              //如果是最后一行
              if(k == cols.length - 1){
                // cols[k].style.borderBottom = "none"
              }

            }
            cols[k].style.overflow = "hidden"
         }

          //修改外边框颜色
          this.customizerTables.forEach(table => {
            table.style.border = 'solid'
            table.style.borderWidth = '1px'
            table.style.borderColor = config[index]['headerStyle'].headerBorderColor;
          })

          //隐藏因外边框而导致的滑动条
          // let tableBody = document.getElementsByClassName("el-table__body-wrapper")
          // tableBody.item(index).style.overflow = "hidden"

          if(config[index][colName].visib == "none"){
            this.customizerChangeColVisibState(tables[index].columns[i].id, false)
          }
        }
        tables[index].layout.updateColumnsWidth()
      }
    },
    customizerSaveConfig(localConfig, isInit, id, newWidth){
      let tables = [...document.getElementsByClassName("el-table")]
      //每表
      let tableConfigList = [];
      tables.forEach((table) => {
        table = table.__vue__
        //每列
        let tableConfig = new Map();
        for(let i = 0; i < table.columns.length; i++){
          let cells = [...document.getElementsByClassName(table.columns[i].id)]
          //每行
          let config = {}
          cells.forEach((cell, cellIndex) => {
            //表头
            if(cell.nodeName == "TH"){
              //拿到列名 
              let colName = cell.textContent.replaceAll(' ', '')              
              if(!isInit && id && cells[cellIndex].classList[0] == id){
                config.width =  newWidth
              }
              if(isInit){
                if (table.columns[i].width != undefined) {
                  config.width = table.columns[i].width
                } else {
                  config.width = table.columns[i].realWidth
                }
              }
              config.name = colName
              config.visib = cell.style.display || "table-cell"
              tableConfig.set(config.name, config)
              //获取表头样式 为什么i==1 也就是要取第二个呢？是因为多数表格的第一列是序号列，较为特殊，比如文字居中，但其他列却并没有居中
              if(i == 1){
                let originStyle = window.getComputedStyle(cells[cellIndex], null)
                let styleConfig = {}
                styleConfig.headerColor = originStyle.color
                styleConfig.headerFontSize =originStyle.fontSize
                styleConfig.headerFontWeight = originStyle.fontWeight
                styleConfig.headerTextAlign = originStyle.textAlign
                styleConfig.headerBackgroundColor =  originStyle.backgroundColor
                styleConfig.headerBorderStyle = originStyle.borderStyle
                
                if(String(originStyle.borderColor).indexOf(") ") > -1){
                  styleConfig.headerBorderColor = String(originStyle.borderColor).split(") ")[1] + ")"
                }else{
                  styleConfig.headerBorderColor = originStyle.borderColor
                }
                tableConfig.set("headerStyle", styleConfig)
              }
            }else if(cell.nodeName == "TD" && i == 1){
              let originStyle = window.getComputedStyle(cells[cellIndex], null)
              let styleConfig = {}
              styleConfig.bodyColor = originStyle.color
              styleConfig.bodyFontSize = originStyle.fontSize
              styleConfig.bodyFontWeight = originStyle.fontWeight
              styleConfig.bodyTextAlign = originStyle.textAlign
              styleConfig.bodyBackgroundColor = originStyle.backgroundColor
              styleConfig.bodyBorderColor = originStyle.borderColor
              styleConfig.bodyBorderStyle = originStyle.borderStyle
              tableConfig.set("bodyStyle", styleConfig)
            }
          });
        }
        tableConfigList.push(this.customizerMapToObj(tableConfig))
      });

      //保存到localstorage
      if(!localConfig){
          localConfig = {}
          localConfig[`${window.location.pathname}`] = tableConfigList
      }else{
          let oldConfig = localConfig[`${window.location.pathname}`]
          //if 新配置里面该列没有width参数，但是旧配置里面有，则从旧配置里面保存到新配置里面
          for(let k = 0; k < tableConfigList.length; k++){
            for(let key in tableConfigList[k]){
              if(!tableConfigList[k][key].width && oldConfig && oldConfig[k][key].width){
                tableConfigList[k][key].width = oldConfig[k][key].width
              }
            }
          }
          localConfig[`${window.location.pathname}`] = tableConfigList          
      }

      localStorage.setItem(`tableConfigs`, JSON.stringify(localConfig))

      if(!isInit){
        this.customizerUpdateSidebar()
      }

    },
    //其实还是人家element的代码，只是在里面当拖拽被触发的时候，也调用一下我们写的方法
    customizerMyHandleMouseDown(event, column) {
      let that = this.headers[0].__vue__;

      if (that.$isServer) return;
      if (column.children && column.children.length > 0) return;
      /* istanbul ignore if */
      if (that.draggingColumn && that.border) {
        that.dragging = true;

        that.$parent.resizeProxyVisible = true;

        const table = that.$parent;
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = that.$el.querySelector(`th.${column.id}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;

        addClass(columnEl, 'noclick');

        that.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = table.$refs.resizeProxy;
        resizeProxy.style.left = that.dragState.startLeft + 'px';

        document.onselectstart = function () { return false; };
        document.ondragstart = function () { return false; };

        const handleMouseMove = (event) => {
          const deltaLeft = event.clientX - that.dragState.startMouseLeft;
          const proxyLeft = that.dragState.startLeft + deltaLeft;

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
        };

        const handleMouseUp = () => {
          if (that.dragging) {
            const {
              startColumnLeft,
              startLeft
            } = that.dragState;
            const finalLeft = parseInt(resizeProxy.style.left, 10);
            const columnWidth = finalLeft - startColumnLeft;
            column.width = column.realWidth = columnWidth;
            table.$emit('header-dragend', column.width, startLeft - startColumnLeft, column, event);

            that.store.scheduleLayout();

            document.body.style.cursor = '';
            that.dragging = false;
            that.draggingColumn = null;
            that.dragState = {};

            table.resizeProxyVisible = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.onselectstart = null;
          document.ondragstart = null;

          setTimeout(function () {
            removeClass(columnEl, 'noclick'); 
          }, 0);
          
          //发生了拖拽，记录当前样式
          setTimeout(() => {
            let config = this.customizerGetConfigs()
            this.customizerSaveConfig(config, false, column.id, column.width)
          }, 500);
        }; 

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },
    customizerMyOnColumnsChange(layout){
      let table = document.getElementsByClassName("el-table").item(0)
      const cols = table.querySelectorAll('colgroup > col');
      if (!cols.length) return;
      const flattenColumns = layout.getFlattenColumns();
      const columnsMap = {};
      flattenColumns.forEach((column) => {
        columnsMap[column.id] = column;
      });
      for (let i = 0, j = cols.length; i < j; i++) {
        const col = cols[i];
        const name = col.getAttribute('name');
        const column = columnsMap[name];
        if (column) {
          col.setAttribute('width', column.realWidth || column.width);
        }
      }
    },
    customizerMyUpdateColumnsWidth(){
      let that = document.getElementsByClassName("el-table").item(0).__vue__.layout

      if (that.$isServer) return;
      const fit = that.fit;
      const bodyWidth = that.table.$el.clientWidth;
      let bodyMinWidth = 0;
  
      const flattenColumns = that.getFlattenColumns();

      let flexColumns = flattenColumns.filter((column) => typeof column.width !== 'number');
      flattenColumns.forEach((column) => { // Clean those columns whose width changed from flex to unflex
        if (typeof column.width === 'number' && column.realWidth) column.realWidth = null;
      });
  
      if (flexColumns.length > 0 && fit) {
        flattenColumns.forEach((column) => {
          bodyMinWidth += column.width || column.minWidth || 80;
        });
  
        const scrollYWidth = that.scrollY ? that.gutterWidth : 0;
  
        if (bodyMinWidth <= bodyWidth - scrollYWidth) { // DON'T HAVE SCROLL BAR
          that.scrollX = false;
  
          const totalFlexWidth = bodyWidth - scrollYWidth - bodyMinWidth;
  
          if (flexColumns.length === 1) {
            flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth;
          } else {
            const allColumnsWidth = flexColumns.reduce((prev, column) => prev + (column.minWidth || 80), 0);
            const flexWidthPerPixel = totalFlexWidth / allColumnsWidth;
            let noneFirstWidth = 0;
  
            flexColumns.forEach((column, index) => {
              if (index === 0) return;
              const flexWidth = Math.floor((column.minWidth || 80) * flexWidthPerPixel);
              noneFirstWidth += flexWidth;
              column.realWidth = (column.minWidth || 80) + flexWidth;
            });
  
            flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth - noneFirstWidth;
          }
        } else { // HAVE HORIZONTAL SCROLL BAR
          that.scrollX = true;
          flexColumns.forEach(function(column) {
            column.realWidth = column.minWidth;
          });
        }
  
        that.bodyWidth = Math.max(bodyMinWidth, bodyWidth);
        // that.table.resizeState.width = that.bodyWidth; //注释掉了这里，不然会导致表头表体错位问题
      } else {
        flattenColumns.forEach((column) => {
          if (!column.width && !column.minWidth) {
            column.realWidth = 80;
          } else {
            column.realWidth = column.width || column.minWidth;
          }
  
          bodyMinWidth += column.realWidth;
        });
        that.scrollX = bodyMinWidth > bodyWidth;
  
        that.bodyWidth = bodyMinWidth;
      }
  
      const fixedColumns = that.store.states.fixedColumns;
  
      if (fixedColumns.length > 0) {
        let fixedWidth = 0;
        fixedColumns.forEach(function(column) {
          fixedWidth += column.realWidth || column.width;
        });
  
        that.fixedWidth = fixedWidth;
      }
  
      const rightFixedColumns = that.store.states.rightFixedColumns;
      if (rightFixedColumns.length > 0) {
        let rightFixedWidth = 0;
        rightFixedColumns.forEach(function(column) {
          rightFixedWidth += column.realWidth || column.width;
        });
  
        that.rightFixedWidth = rightFixedWidth;
      }
  
      that.notifyObservers('columns');
    },
    customizerMapToObj(map){
      let obj = Object.create(null);
      for (let [k, v] of map) { obj[k] = v; }
      return obj;
    },
    customizerChangeStyleFunc(event){
      let id;
      let width;
      //如果是修改边框颜色，那么表头表体一起修改
      if(event.target.id == "borderColor"){ 
        //修改内边框
        this.customizerThs[event.target.tabIndex].forEach(th => {
          th.style[event.target.id] = event.target.value
        });
        this.customizerTds[event.target.tabIndex].forEach(td => {
          td.style[event.target.id] = event.target.value
        });
        //修改外边框
        this.customizerTables.forEach(table => {
          table.style.border = 'solid'
          table.style.borderWidth = '1px'
          table.style.borderColor = event.target.value;
        })
        //统一表头标体边框颜色字段值
        let borderInputs = document.getElementsByClassName("borderColor")
        for(let i = 0; i < borderInputs.length; i++){
          borderInputs.item(i).value = event.target.value
        }

      }else if(event.target.getAttribute('elType') == 'th'){
        this.customizerThs[event.target.tabIndex].forEach(th => {
          th.style[event.target.id] = event.target.value
        });
      }else if(event.target.getAttribute('elType') == 'td'){
        this.customizerTds[event.target.tabIndex].forEach(td => {
          td.style[event.target.id] = event.target.value
        });
      }else if(event.target.getAttribute('elType') == 'widthInput'){
        if(parseInt(event.target.value) == 0){
          this.$message({
            message: '列宽不可为0',
            type: 'warning'
          });
        }else{
          let colName;
          let tables = document.getElementsByClassName("el-table")
          tables.item(event.target.tabIndex).__vue__.columns.forEach(col => {
            let els = tables.item(event.target.tabIndex).getElementsByClassName(col.id)
            colName = els.item(0).textContent.replaceAll(' ', '')
            if(`${colName}-width` == event.target.id){
              col.width = parseInt(event.target.value);
              width = col.width 
              id = col.id
            }
          });
          tables.item(event.target.tabIndex).__vue__.layout.updateColumnsWidth()
        }
      }else if(event.target.getAttribute('elType') == 'visibInput'){
        let checkedClass;
        //隐藏指定列： el-table_1_column_2 设为 display: none        
        let tables = document.getElementsByClassName("el-table")
        let columns = tables.item(event.target.tabIndex).__vue__.columns
        columns.forEach((col, colIndex) => {
          let els = tables.item(event.target.tabIndex).getElementsByClassName(col.id)
          let colName = els.item(0).textContent.replaceAll(' ', '')
          if(`${colName}-show` == event.target.id){
            checkedClass = col.id
          }
        });
        this.customizerChangeColVisibState(checkedClass, event.target.checked)
        // tables.item(event.target.tabIndex).layout.updateColumnsWidth()
      }
      //保存
      setTimeout(() => {
        let config = this.customizerGetConfigs()
        this.customizerSaveConfig(config, false, id, width)
      }, 500);

    },
    //该方法有个问题，会导致宽度变化时表头和表体发生错位
    customizerChangeColVisibState(checkedClass, checked){
      let that = document.getElementsByClassName("el-table").item(0).__vue__.layout
      let columns = that.getFlattenColumns();
      let cells = [...document.getElementsByClassName(checkedClass)]
      cells.forEach(cell => {
        this.customizerChangeCellVisib(cell, checked, columns)
      })        
      let tableHeader = this.$el.getElementsByClassName("el-table__header");
      let tableBody = this.$el.getElementsByClassName("el-table__body");
      tableHeader.item(0).querySelectorAll('colgroup > col').forEach(col => {
        if(col.attributes.name.nodeValue == checkedClass || col.attributes.name.nodeValue == "gutter"){
          this.customizerChangeCellVisib(col, checked, columns)
        }
      })
      tableBody.item(0).querySelectorAll('colgroup > col').forEach(col => {
        if(col.attributes.name.nodeValue == checkedClass || col.attributes.name.nodeValue == "gutter"){
          this.customizerChangeCellVisib(col, checked, columns)
        }
      })
    },
    customizerChangeCellVisib(cell, flag, columns){
      if(cell.nodeName == "TH" || cell.nodeName == "TD"){
        cell.style.display = flag?"table-cell":"none"
      }else if(cell.nodeName == "COL"){
        cell.style.display = flag?"table-column":"none"
        if(cell.attributes.name.nodeValue == "gutter" && flag){
          cell.style.display = "none"
        }
      }
      if(cell.attributes.name && cell.attributes.name.nodeValue != "gutter"){
        //说明是隐藏，那么需要在columns里面也给标记上，用于自适应时忽略此列宽
        columns.forEach(col => {
          if(col.id == cell.attributes.name.nodeValue){
            col.isHide = !flag
          }
        })
      }
    },
    //创建侧边栏
    customizerCreateConfigPage(changeStyleFunc) {
      //直接从localstorage里面拿数据，因为这个方法被调用之前，该页面的表格宽度数据已经被保存了
      let configList = this.customizerGetTableWidth()
      let headerStyle = configList[0]['headerStyle']
      let bodyStyle = configList[0]['bodyStyle']
      let panel = document.getElementById("app")
    
      //添加配置按钮
      let btn = document.createElement('div')
      btn.id = "configBtn"
      let toolImg = document.createElement("i")
      toolImg.style.fontSize = "25px"
      toolImg.className = "el-icon-set-up"
      btn.appendChild(toolImg)
      btn.addEventListener("click", () => {
        document.getElementById("configSidebar").style.visibility = "visible"
        btn.style.visibility = "hidden"
      })
      btn.style.cssText = `background-color:#111d38;width:51px;height:46px;position:absolute;right: 0;bottom:100px;color:#FFF;cursor:pointer;
        border-top-left-radius:6px;border-bottom-left-radius:6px;display:flex;justify-content:center;align-items:center;z-index:999;` //visibility:hidden;
    
      //添加配置页面div
      let configPage = document.createElement("div")
      configPage.style.cssText = `z-index:1000;width: 500px; height: 100%; position:absolute; right:0;top:0;box-shadow: -1px 0 5px 0 rgb(0 0 0 / 35%);background-color: #0e172d;visibility:hidden;` //
      configPage.id = "configSidebar"
    
      //添加顶部标题栏
      let header = document.createElement('div')
      header.style.color = '#FFF'
      header.style.height = "80px"
      header.style.width = "100%"
      header.style.display = "flex"
      header.style.flexDirection = "row"
      header.style.alignItems = "center"
      header.style.backgroundColor = '#111d38'
      header.style.justifyContent = 'space-between'
      configPage.appendChild(header)
    
      //添加标题栏文字
      let titleDiv = document.createElement('div')
      titleDiv.style.display = "flex"
      titleDiv.style.width = "inherit"
      titleDiv.style.alignItems = "center"

      let headerTitle = document.createElement("p")
      headerTitle.innerHTML = "表格定制工具"
      headerTitle.style.color = "#409eff"
      headerTitle.style.fontSize = "24px"
      headerTitle.style.fontWeight = "700"
      headerTitle.style.marginLeft = "3%"
      titleDiv.appendChild(headerTitle)

      //添加标题栏副标题文字
      let headerSubTitle = document.createElement("p")
      headerSubTitle.innerHTML = "made with love"
      headerSubTitle.style.color = "rgb(17, 29, 56)"
      headerSubTitle.style.fontSize = "14px"
      headerSubTitle.style.fontWeight = "400"
      headerSubTitle.style.marginLeft = "3%"
      headerSubTitle.style.cursor = 'default'
      headerSubTitle.style.marginTop = "28px"
      titleDiv.appendChild(headerSubTitle)

      header.appendChild(titleDiv)
    
      let btnDiv = document.createElement('div')  
      btnDiv.style.display = "flex"
      btnDiv.style.marginRight = "8%"
    
      //添加标题栏重置按钮 
      let resetDiv = document.createElement('div')
      resetDiv.id = "exitDiv"
      resetDiv.style.marginRight = "20%"
      resetDiv.style.cursor = "pointer"
      resetDiv.style.alignItems = "center"
      resetDiv.style.display = "flex"
      let resetIcon = document.createElement("i")
      resetIcon.style.fontSize = "25px"
      resetIcon.style.marginRight = "5px"
      resetIcon.className = "el-icon-refresh-left"
      resetDiv.appendChild(resetIcon)
      resetDiv.addEventListener("click", () => {
        delete localStorage["tableConfigs"];
        location.reload();
      })
      let resetText = document.createElement("p")
      resetText.innerHTML = "还原"
      resetText.style.color = "#409eff"
      resetText.style.fontSize = "16px"
      resetText.style.fontWeight = "500"
      resetText.style.width = "max-content"
      resetDiv.appendChild(resetText)
    
      btnDiv.appendChild(resetDiv)
    
      //添加标题退出按钮
      let exitDiv = document.createElement('div')
      exitDiv.id = "exitDiv"
      exitDiv.style.cursor = "pointer"
      exitDiv.style.alignItems = "center"
      exitDiv.style.display = "flex"
      let exitIcon = document.createElement("i")
      exitIcon.style.fontSize = "25px"
      exitIcon.className = "el-icon-d-arrow-right"
      exitDiv.appendChild(exitIcon)
      exitDiv.addEventListener("click", () => {
          document.getElementById("configBtn").style.visibility = "visible"
          document.getElementById("configSidebar").style.visibility = "hidden"
      })
      let exitText = document.createElement("p")
      exitText.innerHTML = "退出"
      exitText.style.color = "#409eff"
      exitText.style.fontSize = "16px"
      exitText.style.fontWeight = "500"
      exitText.style.width = "max-content"
      exitDiv.appendChild(exitText)
      btnDiv.appendChild(exitDiv)
      
      header.appendChild(btnDiv)

      //添加样式配置div
      let styleDiv = document.createElement('div')
      styleDiv.style.backgroundColor = "#111d38"
      styleDiv.style.width = "95%"
      styleDiv.style.height = "85%"
      // styleDiv.style.marginLeft = "3%"
      styleDiv.style.marginTop = "10px"
      styleDiv.style.padding = "10px"
      styleDiv.style.overflow = "hidden"
      //添加表头样式配置标题
      let styleDivHeader = document.createElement("p")
      styleDivHeader.innerHTML = "表头样式配置"
      styleDivHeader.style.color = "#409eff"
      styleDivHeader.style.fontSize = "20px"
      styleDivHeader.style.fontWeight = "600"
    
      //表头样式配置 第一行
      let line1 = document.createElement('div')
      line1.style.display = "flex"
      line1.style.flexDirection = "row"
      line1.style.justifyContent = "center"
      //表头-文字颜色
      let headerFontColorLabel = document.createElement('div')
      let headerFontColorInput = document.createElement('input')
      headerFontColorLabel.style.color = "#FFF"
      headerFontColorLabel.style.marginRight = "2px"
      headerFontColorLabel.innerHTML = "字体颜色："
      headerFontColorInput.value = this.customizerColorRGBtoHex(headerStyle.headerColor)
      headerFontColorInput.type = "color"
      headerFontColorInput.id = "color"
      headerFontColorInput.setAttribute("elType", 'th')
      headerFontColorInput.setAttribute("tabIndex", 0)
      headerFontColorInput.addEventListener('input', changeStyleFunc)
      line1.appendChild(headerFontColorLabel)
      line1.appendChild(headerFontColorInput)
      //表头-背景颜色
      let headerBackgroundColorLabel = document.createElement('div')
      let headerBackgroundColorInput = document.createElement('input')
      headerBackgroundColorLabel.style.color = "#FFF"
      headerBackgroundColorLabel.style.marginRight = "2px"
      headerBackgroundColorLabel.style.marginLeft = "24px"
      headerBackgroundColorLabel.innerHTML = "背景颜色："
      headerBackgroundColorInput.value = this.customizerColorRGBtoHex(headerStyle.headerBackgroundColor)
      headerBackgroundColorInput.type = "color"
      headerBackgroundColorInput.id = "backgroundColor"
      headerBackgroundColorInput.setAttribute("elType", 'th')
      headerBackgroundColorInput.setAttribute("tabIndex", 0)
      headerBackgroundColorInput.addEventListener('input', changeStyleFunc)
      line1.appendChild(headerBackgroundColorLabel)
      line1.appendChild(headerBackgroundColorInput)
      //表头-边框颜色
      let headerBorderColorLabel = document.createElement('div')
      let headerBorderColorInput = document.createElement('input')
      headerBorderColorLabel.style.color = "#FFF"
      headerBorderColorLabel.style.marginRight = "2px"
      headerBorderColorLabel.style.marginLeft = "24px"
      headerBorderColorLabel.innerHTML = "边框颜色："
      headerBorderColorInput.value = this.customizerColorRGBtoHex(headerStyle.headerBorderColor)
      headerBorderColorInput.type = "color"
      headerBorderColorInput.id = "borderColor"
      headerBorderColorInput.className = "borderColor"
      headerBorderColorInput.setAttribute("elType", 'th')
      headerBorderColorInput.setAttribute("tabIndex", 0)
      headerBorderColorInput.addEventListener('input', changeStyleFunc)
      line1.appendChild(headerBorderColorLabel)
      line1.appendChild(headerBorderColorInput)
      //表头样式配置 第二行
      let line2 = document.createElement('div')
      line2.style.display = "flex"
      line2.style.flexDirection = "row"
      line2.style.justifyContent = "center"
      line2.style.marginTop = "10px"
      //表头-文本位置
      let headerFontPositionLabel = document.createElement('div')
      let headerFontPositionSelect = document.createElement('select')
      headerFontPositionLabel.style.color = "#FFF"
      headerFontPositionLabel.style.marginRight = "2px"
      headerFontPositionLabel.innerHTML = "文本位置："
      headerFontPositionSelect.name = "headerTextPosition"
      headerFontPositionSelect.style.backgroundColor = "#111d38"
      headerFontPositionSelect.style.color = "#FFF"
      headerFontPositionSelect.style.backgroundColor = "#111d38"
      headerFontPositionSelect.id = "textAlign"
      headerFontPositionSelect.setAttribute("elType", 'th')
      headerFontPositionSelect.setAttribute("tabIndex", 0)
      headerFontPositionSelect.addEventListener('input', changeStyleFunc)
      let optionLeft = document.createElement('option')
      optionLeft.text = '靠左'
      optionLeft.value = 'left'
      if (headerStyle.headerTextAlign == optionLeft.value) {
        optionLeft.selected = "selected"
      }
      let optionMiddle = document.createElement('option')
      optionMiddle.text = '居中'
      optionMiddle.value = 'center'
      if (headerStyle.headerTextAlign == optionMiddle.value) {
        optionMiddle.selected = "selected"
      }
      let optionRight = document.createElement('option')
      optionRight.text = '靠右'
      optionRight.value = 'right'
      if (headerStyle.headerTextAlign == optionRight.value) {
        optionRight.selected = "selected"
      }
      headerFontPositionSelect.appendChild(optionLeft)
      headerFontPositionSelect.appendChild(optionMiddle)
      headerFontPositionSelect.appendChild(optionRight)
      line2.appendChild(headerFontPositionLabel)
      line2.appendChild(headerFontPositionSelect)
      //表头-文本粗细
      let headerFontWeightLabel = document.createElement('div')
      let headerFontWeightInput = document.createElement('input')
      headerFontWeightLabel.style.color = "#FFF"
      headerFontWeightLabel.style.marginRight = "2px"
      headerFontWeightLabel.style.marginLeft = "24px"
      headerFontWeightLabel.innerHTML = "文本粗细："
      headerFontWeightInput.value = headerStyle.headerFontWeight
      headerFontWeightInput.type = "text"
      headerFontWeightInput.id = "fontWeight"
      headerFontWeightInput.setAttribute("elType", 'th')
      headerFontWeightInput.setAttribute("tabIndex", 0)
      headerFontWeightInput.addEventListener('input', changeStyleFunc)
      headerFontWeightInput.style.width = "40px"
      headerFontWeightInput.style.backgroundColor = "#111d38"
      headerFontWeightInput.style.color = "#FFF"
      headerFontWeightInput.style.borderWidth = "1px"
      headerFontWeightInput.style.borderStyle = "solid"
      line2.appendChild(headerFontWeightLabel)
      line2.appendChild(headerFontWeightInput)
      //表头-文本字号
      let headerFontSizeLabel = document.createElement('div')
      let headerFontSizeInput = document.createElement('input')
      headerFontSizeLabel.style.color = "#FFF"
      headerFontSizeLabel.style.marginRight = "2px"
      headerFontSizeLabel.style.marginLeft = "24px"
      headerFontSizeLabel.innerHTML = "文本字号："
      headerFontSizeInput.value = headerStyle.headerFontSize
      headerFontSizeInput.type = "text"
      headerFontSizeInput.id = "fontSize"
      headerFontSizeInput.setAttribute("elType", 'th')
      headerFontSizeInput.setAttribute("tabIndex", 0)
      headerFontSizeInput.addEventListener('input', changeStyleFunc)
      headerFontSizeInput.style.width = "40px"
      headerFontSizeInput.style.backgroundColor = "#111d38"
      headerFontSizeInput.style.color = "#FFF"
      headerFontSizeInput.style.borderWidth = "1px"
      headerFontSizeInput.style.borderStyle = "solid"
      line2.appendChild(headerFontSizeLabel)
      line2.appendChild(headerFontSizeInput)
      //分割线
      let divideLine = document.createElement('hr')
      divideLine.style.marginTop = "20px"
      divideLine.style.marginBottom = "20px"
      //--------------------------------
      //添加表体样式配置标题
      let styleDivHeader2 = document.createElement("p")
      styleDivHeader2.innerHTML = "表体样式配置"
      styleDivHeader2.style.color = "#409eff"
      styleDivHeader2.style.fontSize = "20px"
      styleDivHeader2.style.fontWeight = "600"
      //表体样式配置 第一行
      let line3 = document.createElement('div')
      line3.style.display = "flex"
      line3.style.flexDirection = "row"
      line3.style.justifyContent = "center"
      //表体-文字颜色
      let BodyFontColorLabel = document.createElement('div')
      let bodyFontColorInput = document.createElement('input')
      BodyFontColorLabel.style.color = "#FFF"
      BodyFontColorLabel.style.marginRight = "2px"
      BodyFontColorLabel.innerHTML = "字体颜色："
      bodyFontColorInput.value = bodyStyle ? this.customizerColorRGBtoHex(bodyStyle.bodyColor) : '#FFFFFF'
      bodyFontColorInput.type = "color"
      bodyFontColorInput.id = "color"
      bodyFontColorInput.setAttribute("elType", 'td')
      bodyFontColorInput.setAttribute("tabIndex", 0)
      bodyFontColorInput.addEventListener('input', changeStyleFunc)
      line3.appendChild(BodyFontColorLabel)
      line3.appendChild(bodyFontColorInput)
      //表体-背景颜色 此样式较为特殊，因其带有透明度参数，所以这里默认给白色
      let bodyBackgroundColorLabel = document.createElement('div')
      let bodyBackgroundColorInput = document.createElement('input')
      bodyBackgroundColorLabel.style.color = "#FFF"
      bodyBackgroundColorLabel.style.marginRight = "2px"
      bodyBackgroundColorLabel.style.marginLeft = "24px"
      bodyBackgroundColorLabel.innerHTML = "背景颜色："
      if (bodyStyle && bodyStyle.bodyBackgroundColor == "rgba(0, 0, 0, 0)") {
        bodyBackgroundColorInput.value = "#FFFFFF"
      } else {
        bodyBackgroundColorInput.value = this.customizerColorRGBtoHex(bodyStyle ? bodyStyle.bodyBackgroundColor : 'rgb(255, 255, 255)')
      }
      bodyBackgroundColorInput.id = "backgroundColor"
      bodyBackgroundColorInput.setAttribute("elType", 'td')
      bodyBackgroundColorInput.setAttribute("tabIndex", 0)
      bodyBackgroundColorInput.addEventListener('input', changeStyleFunc)
      bodyBackgroundColorInput.type = "color"
      line3.appendChild(bodyBackgroundColorLabel)
      line3.appendChild(bodyBackgroundColorInput)
      //表体-边框颜色
      let bodyBorderColorLabel = document.createElement('div')
      let bodyBorderColorInput = document.createElement('input')
      bodyBorderColorLabel.style.color = "#FFF"
      bodyBorderColorLabel.style.marginRight = "2px"
      bodyBorderColorLabel.style.marginLeft = "24px"
      bodyBorderColorLabel.innerHTML = "边框颜色："
      bodyBorderColorInput.value = this.customizerColorRGBtoHex(headerStyle.headerBorderColor)  
      bodyBorderColorInput.type = "color"
      bodyBorderColorInput.id = "borderColor"
      bodyBorderColorInput.className = "borderColor"
      bodyBorderColorInput.setAttribute("elType", 'td')
      bodyBorderColorInput.setAttribute("tabIndex", 0)
      bodyBorderColorInput.addEventListener('input', changeStyleFunc)
      line3.appendChild(bodyBorderColorLabel)
      line3.appendChild(bodyBorderColorInput)
      //表体样式配置 第二行
      let line4 = document.createElement('div')
      line4.style.display = "flex"
      line4.style.flexDirection = "row"
      line4.style.justifyContent = "center"
      line4.style.marginTop = "10px"
      //表体-文本位置
      let bodyFontPositionLabel = document.createElement('div')
      let bodyFontPositionSelect = document.createElement('select')
      bodyFontPositionLabel.style.color = "#FFF"
      bodyFontPositionLabel.style.marginRight = "2px"
      bodyFontPositionLabel.innerHTML = "文本位置："
      bodyFontPositionSelect.name = "bodyTextPosition"
      bodyFontPositionSelect.style.backgroundColor = "#111d38"
      bodyFontPositionSelect.style.color = "#FFF"
      bodyFontPositionSelect.id = "textAlign"
      bodyFontPositionSelect.setAttribute("elType", 'td')
      bodyFontPositionSelect.setAttribute("tabIndex", 0)
      bodyFontPositionSelect.addEventListener('input', changeStyleFunc)
      let optionLeft2 = document.createElement('option')
      optionLeft2.text = '靠左'
      optionLeft2.value = 'left'
      if (bodyStyle && bodyStyle.bodyTextAlign == optionLeft2.value) {
        optionLeft2.selected = "selected"
      }
      let optionMiddle2 = document.createElement('option')
      optionMiddle2.text = '居中'
      optionMiddle2.value = 'center'
      if (bodyStyle && bodyStyle.bodyTextAlign == optionMiddle2.value) {
        optionMiddle2.selected = "selected"
      }
      let optionRight2 = document.createElement('option')
      optionRight2.text = '靠右'
      optionRight2.value = 'right'
      if (bodyStyle && bodyStyle.bodyTextAlign == optionRight2.value) {
        optionRight2.selected = "selected"
      }
      bodyFontPositionSelect.appendChild(optionLeft2)
      bodyFontPositionSelect.appendChild(optionMiddle2)
      bodyFontPositionSelect.appendChild(optionRight2)
      line4.appendChild(bodyFontPositionLabel)
      line4.appendChild(bodyFontPositionSelect)
      //表体-文本粗细
      let bodyFontWeightLabel = document.createElement('div')
      let bodyFontWeightInput = document.createElement('input')
      bodyFontWeightLabel.style.color = "#FFF"
      bodyFontWeightLabel.style.marginRight = "2px"
      bodyFontWeightLabel.style.marginLeft = "24px"
      bodyFontWeightLabel.innerHTML = "文本粗细："
      bodyFontWeightInput.value = bodyStyle ? bodyStyle.bodyFontWeight : 500
      bodyFontWeightInput.type = "text"
      bodyFontWeightInput.id = "fontWeight"
      bodyFontWeightInput.setAttribute("elType", 'td')
      bodyFontWeightInput.setAttribute("tabIndex", 0)
      bodyFontWeightInput.addEventListener('input', changeStyleFunc)
      bodyFontWeightInput.style.width = "40px"
      bodyFontWeightInput.style.backgroundColor = "#111d38"
      bodyFontWeightInput.style.color = "#FFF"
      bodyFontWeightInput.style.borderWidth = "1px"
      bodyFontWeightInput.style.borderStyle = "solid"
      line4.appendChild(bodyFontWeightLabel)
      line4.appendChild(bodyFontWeightInput)
      //表体-文本字号
      let bodyFontSizeLabel = document.createElement('div')
      let bodyFontSizeInput = document.createElement('input')
      bodyFontSizeLabel.style.color = "#FFF"
      bodyFontSizeLabel.style.marginRight = "2px"
      bodyFontSizeLabel.style.marginLeft = "24px"
      bodyFontSizeLabel.innerHTML = "文本字号："
      bodyFontSizeInput.value = bodyStyle ? bodyStyle.bodyFontSize : '14px'
      bodyFontSizeInput.type = "text"
      bodyFontSizeInput.id = "fontSize"
      bodyFontSizeInput.setAttribute("elType", 'td')
      bodyFontSizeInput.setAttribute("tabIndex", 0)
      bodyFontSizeInput.addEventListener('input', changeStyleFunc)
      bodyFontSizeInput.style.width = "40px"
      bodyFontSizeInput.style.backgroundColor = "#111d38"
      bodyFontSizeInput.style.color = "#FFF"
      bodyFontSizeInput.style.borderWidth = "1px"
      bodyFontSizeInput.style.borderStyle = "solid"
      line4.appendChild(bodyFontSizeLabel)
      line4.appendChild(bodyFontSizeInput)
      //分割线
      let divideLine2 = document.createElement('hr')
      divideLine2.style.marginTop = "20px"
      divideLine2.style.marginBottom = "20px"
    
      // 表格列表    
      let styleDivHeader3 = document.createElement("p")
      styleDivHeader3.innerHTML = "表格内容配置"
      styleDivHeader3.style.color = "#409eff"
      styleDivHeader3.style.fontSize = "20px"
      styleDivHeader3.style.fontWeight = "600"
      
      let tableDiv = document.createElement('div')
      tableDiv.id = "el-table-customizer-tableDiv"
      tableDiv.style.height = window.innerHeight > 900 ? "56%" : window.innerHeight > 800 ? "50%" : window.innerHeight < 650 ? "30%" : "40%"
      window.onresize = () =>{
        let tableDiv = document.getElementById("el-table-customizer-tableDiv")
        tableDiv.style.height = window.innerHeight > 900 ? "56%" : window.innerHeight > 800 ? "50%" : window.innerHeight < 650 ? "30%" : "40%"        
      }
      tableDiv.style.width = "110%"
      tableDiv.style.overflowX = "hidden"
      tableDiv.style.overflowY = "scroll"
      let table = document.createElement("table")
      table.style.color = "#FFF"
      table.border = '1'
      table.style.borderCollapse = "collapse"
      table.style.width = "70%"
      table.style.marginLeft = "15%"
    
      let headerTr = document.createElement("tr")
      //表头
      let th1 = document.createElement("th")
      th1.textContent = "列名"
      let th2 = document.createElement("th")
      th2.textContent = "可见"
      let th3 = document.createElement("th")
      th3.textContent = "宽度"
      headerTr.appendChild(th1)
      headerTr.appendChild(th2)
      headerTr.appendChild(th3)
      table.appendChild(headerTr)
      tableDiv.appendChild(table)
      //表体
      //先展示第一个表格的配置，然后再支持多表格
      for (let key in configList[0]) {
        if (key == 'headerStyle' || key == 'bodyStyle') {
          continue
        }
        let tr = document.createElement("tr")
        //列名
        let labelTd = document.createElement("td")
        labelTd.style.textAlign = "center"
        labelTd.style.height = "25px"
        labelTd.textContent = key
        tr.appendChild(labelTd)
        //可见CheckBox
        let visibTd = document.createElement('td')
        visibTd.style.textAlign = "center"
        let visibInput = document.createElement("input")
        visibInput.type = "checkbox"
        visibInput.id = `${configList[0][key].name}-show`
        visibInput.checked = configList[0][key].visib == "none"?false:true
        visibInput.setAttribute("elType", 'visibInput')
        visibInput.setAttribute("tabIndex", 0)
        visibInput.addEventListener('change', changeStyleFunc)
        visibTd.appendChild(visibInput)
        tr.appendChild(visibTd)
        //列宽输入框
        let widthTd = document.createElement('td')
        widthTd.style.width = "100px"
        let widthInput = document.createElement("input")
        widthInput.type = "text"
        widthInput.style.width = "100px"
        widthInput.style.backgroundColor = "#111d38"
        widthInput.style.color = '#FFF'
        widthInput.style.borderWidth = "0"
        widthInput.style.borderStyle = "solid"
        widthInput.style.outline = "none"
        widthInput.style.textAlign = "center"
        widthInput.value = configList[0][key].width
        widthInput.id = `${configList[0][key].name}-width`
        widthInput.setAttribute("elType", 'widthInput')
        widthInput.setAttribute("tabIndex", 0)
        widthInput.addEventListener('input', changeStyleFunc)
    
        widthInput.setAttribute("elType", 'widthInput')
        widthTd.appendChild(widthInput)
        tr.appendChild(widthTd)
        table.appendChild(tr)
      }
    
      styleDiv.appendChild(styleDivHeader)
      styleDiv.appendChild(line1)
      styleDiv.appendChild(line2)
      styleDiv.appendChild(divideLine)
      styleDiv.appendChild(styleDivHeader2)
      styleDiv.appendChild(line3)
      styleDiv.appendChild(line4)
      styleDiv.appendChild(divideLine2)
      styleDiv.appendChild(styleDivHeader3)
      styleDiv.appendChild(tableDiv)
      configPage.appendChild(styleDiv)
      panel.appendChild(configPage)
      panel.appendChild(btn)
    },
    customizerUpdateSidebar() {
      let widthConfigs = localStorage.getItem("tableConfigs")
      let configList = JSON.parse(widthConfigs)[`${window.location.pathname}`]
      for (let key in configList[0]) {
        if (key != "headerStyle" && key != "bodyStyle") {
          let input = document.getElementById(`${key}-width`)
          input.value = configList[0][key].width
    
        }
      }
    },
    customizerColorRGBtoHex(color) {
      var rgb = color.split(',');
      var r = parseInt(rgb[0].split('(')[1]);
      var g = parseInt(rgb[1]);
      var b = parseInt(rgb[2].split(')')[0]);
      var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      return hex;
    },
    //遍历表格获取各列宽度
    customizerGetTableWidth() {
      let widthConfigs = localStorage.getItem("tableConfigs")
      widthConfigs = JSON.parse(widthConfigs)
      let configList = widthConfigs[`${window.location.pathname}`]
      configList.forEach((config, i) => {
        let tables = document.getElementsByClassName("el-table")
        let table = tables.item(i).__vue__
        for (let i = 0; i < table.columns.length; i++) {
          let cells = [...document.getElementsByClassName(table.columns[i].id)]
          cells.forEach((cell) => {
            if (cell.nodeName == "TH") {
              let colName = cell.textContent.replaceAll(' ', '')
              //拿到列宽
              let width = ''
              if (table.columns[i].width != undefined) {
                width = table.columns[i].width
              } else {
                width = table.columns[i].realWidth
              }
              if(!config[colName].width){
                config[colName].width = width
              }
            }
          });
        }
    
      })
      widthConfigs[`${window.location.pathname}`] = configList
      localStorage.setItem(`tableConfigs`, JSON.stringify(widthConfigs))
      return configList
    }
  },

  updated(){
    if(this.customizerMountedFinished){
      let config = this.customizerGetConfigs()
      if(config && config[`${window.location.pathname}`]){
        this.customizerApplyConfig(config[`${window.location.pathname}`])
      }else{
        this.customizerSaveConfig(config, true)
      }
    }
  }

}