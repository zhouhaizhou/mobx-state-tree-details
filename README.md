# MST (MobX-State-Tree) 插件系统演示项目

这是一个完整的 MST 插件系统演示项目，展示了如何构建和使用 MobX-State-Tree 的插件架构。

## 🚀 项目特性

- **完整的插件系统架构**：基于 MST 构建的可扩展插件系统
- **多种实用插件**：持久化、性能监控、日志记录、数据验证等
- **实时演示界面**：可视化展示各插件功能和使用方法
- **详细文档说明**：完整的插件开发和使用指南

## 📦 技术栈

- **React 19.1.1** - 用户界面框架
- **MobX-State-Tree 7.0.2** - 状态管理
- **MobX 6.15.0** - 响应式状态管理
- **MobX-React 9.2.1** - React 集成
- **Vite 7.1.7** - 构建工具

## 🔌 插件系统架构

### 核心组件

1. **BasePlugin** - 插件基类，提供生命周期管理
2. **PluginManager** - 插件管理器，负责注册和协调插件
3. **具体插件实现** - 各种功能插件

### 可用插件

#### 1. 持久化插件 (PersistencePlugin)
- **功能**：自动将 MST 状态持久化到 localStorage/sessionStorage
- **特性**：
  - 自动保存和恢复状态
  - 支持白名单/黑名单过滤
  - 数据压缩和加密支持
  - 节流保存机制·

#### 2. 性能监控插件 (PerformancePlugin)
- **功能**：监控 MST 模型的性能指标
- **特性**：
  - Action 执行时间统计
  - 内存使用监控
  - 性能报告生成
  - 阈值告警

#### 3. 日志插件 (LoggerPlugin)
- **功能**：记录所有 MST 操作和状态变化
- **特性**：
  - Action、Patch、Snapshot 日志
  - 多种导出格式 (JSON/CSV/Text)
  - 日志搜索和过滤
  - 可配置的日志级别

#### 4. 验证插件 (ValidationPlugin)
- **功能**：为模型字段提供数据验证
- **特性**：
  关闭持久化
const testManager = createTestPlugins(taskStore);
```

#### 3. 自定义配置
```javascript
const customManager = installPlugins(taskStore, 'production', {
  persistence: {
    throttle: 5000,
    blacklist: ['selectedTaskId', 'isLoading']
  },
  performance: {
    sampleRate: 0.05, // 5%采样
    onSlowAction: (data) => sendToMonitoring(data)
  }
});

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 浏览器访问
打开 http://localhost:5173 查看完整的插件系统演示

### 4. 构建生产版本
```bash
npm run build
```

## 🎯 项目亮点

### 📊 完整的插件系统演示
- **PluginShowcase**: 综合展示所有插件功能的主要组件
- **PluginDemo**: 基础插件功能演示
- **PluginTutorial**: 详细的插件开发教程
- **DocumentViewer**: 文档查看和学习资源

### 🔌 四大核心插件
1. **PersistencePlugin** - 数据持久化，支持localStorage/sessionStorage
2. **PerformancePlugin** - 性能监控，Action执行时间和内存使用统计
3. **LoggerPlugin** - 日志系统，完整的操作记录和多格式导出
4. **ValidationPlugin** - 数据验证，实时验证和错误提示

### 🎮 交互式演示
- 实时插件状态监控
- 性能数据可视化
- 日志查看和导出
- 数据验证测试
- 插件配置示例

## 📖 使用指南

### 基本使用

```javascript
import { installPlugins } from './src/plugins/index.js';

// 在 MST 模型中安装插件系统
const TaskStore = types
  .model("TaskStore", {
    tasks: types.array(Task)
  })
  .volatile(self => ({
    pluginManager: null
  }))
  .actions(self => ({
    afterCreate() {
      // 安装插件系统
      self.pluginManager = installPlugins(self, 'development');
    },
    
    beforeDestroy() {
      // 清理插件
      if (self.pluginManager) {
        self.pluginManager.dispose();
      }
    }
  }));
```

### 环境配置

```javascript
// 开发环境
const devPlugins = createDevelopmentPlugins(model, {
  logger: { debug: true },
  performance: { sampleRate: 1.0 }
});

// 生产环境
const prodPlugins = createProductionPlugins(model, {
  logger: { enabled: false },
  performance: { sampleRate: 0.1 }
});

// 测试环境
const testPlugins = createTestPlugins(model, {
  persistence: { enabled: false }
});
```

### 自定义插件开发

```javascript
import { BasePlugin } from './src/plugins/BasePlugin.js';

class MyCustomPlugin extends BasePlugin {
  constructor() {
    super('MyCustomPlugin', '1.0.0');
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      customOption: 'default value'
    };
  }

  onInstall() {
    // 插件安装逻辑
    this.log('Custom plugin installed');
  }

  onUninstall() {
    // 插件卸载逻辑
    this.log('Custom plugin uninstalled');
  }
}
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── TaskList.jsx    # 任务列表组件
│   ├── TaskStats.jsx   # 统计组件
│   └── PluginDemo.jsx  # 插件演示组件
├── models/             # MST 模型
│   └── TaskStore.js    # 主要状态模型
├── plugins/            # 插件系统
│   ├── BasePlugin.js   # 插件基类
│   ├── PluginManager.js # 插件管理器
│   ├── PersistencePlugin.js # 持久化插件
│   ├── PerformancePlugin.js # 性能监控插件
│   ├── LoggerPlugin.js # 日志插件
│   ├── ValidationPlugin.js # 验证插件
│   └── index.js        # 插件系统入口
└── Docs/               # 文档
    ├── MST-核心概念分析.md
    └── MST-插件系统详解.md
```

## 🎯 演示功能

启动项目后，您可以：

1. **查看插件概览** - 了解已注册的插件和状态
2. **测试持久化功能** - 添加任务后刷新页面验证数据恢复
3. **监控性能指标** - 查看 Action 执行时间和内存使用
4. **查看操作日志** - 导出和分析所有操作记录
5. **验证数据输入** - 体验实时数据验证功能

## 🔧 配置选项

### 持久化插件配置
```javascript
persistence: {
  enabled: true,
  key: 'mst-store',
  storage: localStorage,
  throttle: 2000,
  whitelist: ['tasks'],
  blacklist: ['isLoading'],
  autoRestore: true
}
```

### 性能监控配置
```javascript
performance: {
  enabled: true,
  trackActions: true,
  trackPatches: true,
  trackMemory: true,
  sampleRate: 1.0,
  reportInterval: 30000
}
```

### 日志配置
```javascript
logger: {
  enabled: true,
  logActions: true,
  logPatches: true,
  maxLogs: 1000,
  outputToConsole: true
}
```

### 验证配置
```javascript
validation: {
  enabled: true,
  validateOn: ['change'],
  rules: {
    title: [
      { required: true, message: '标题不能为空' },
      { minLength: 2, message: '标题至少2个字符' }
    ]
  }
}
```

## 📚 文档

- [MST 核心概念分析](./Docs/MST-核心概念分析.md)
- [MST 插件系统详解](./Docs/MST-插件系统详解.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License
