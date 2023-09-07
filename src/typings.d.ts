//声明window上自定义属性，如事件总线
declare interface Window {
  eventBus: any
}

//声明.vue文件
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

// 提示：遇到ts报错，有些时候是配置未生效，可以重启vscode或ts服务（vscode快捷键 ctrl+shift+p调出命令行，输入Restart TS Server）
