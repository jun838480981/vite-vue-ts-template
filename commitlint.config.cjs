// 提示：由于package.json的"type": "module"，需将commonjs文件显示声明为.cjs
module.exports = {
  extends: ['@commitlint/config-conventional']
}

// git commit -m <type>[optional scope]: <description> //注意冒号后面有空格
// - type：提交的类型（如新增、修改、更新等）
// - optional scope：涉及的模块，可选
// - description：任务描述
