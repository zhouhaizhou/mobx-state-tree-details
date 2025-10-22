# MST 插件机制详解

## 📖 概述

MobX-State-Tree (MST) 提供了强大而灵活的插件机制，允许开发者以非侵入式的方式扩展和增强状态管理功能。插件系统基于中间件模式、钩子函数、自定义类型和混入等多种机制，为横切关注点提供了优雅的解决方案。

## 🔧 核心插件机制

### 1. Middleware (中间件)

中间件是 MST 插件系统的核心，可以拦截和处理所有 Action 调用。

#### 基本语法
```javascript
import { addMiddleware } from "mobx-state-tree";

const middleware = (call, next) => {
  // 前置处理
  console.log(`Action: ${call.name}`, call.args);
  
  // 调用下一个中间件或实际 Action
  const result = next(call);
  
  // 后置处理
  console.log(`Action completed: ${call.name}`);
  
  return result;
};

addMiddleware(store, middleware);
```

#### 中间件参数说明
- `call.name`: Action 名称
- `call.args`: Action 参数数组
- `call.context`: Action 执行上下文 (MST 节点)
- `call.tree`: 整个 MST 树的根节点
- `call.rootId`: 根节点 ID

#### 实际应用示例
```javascript
// 日志中间件
const loggingMiddleware = (call, next) => {
  const start = performance.now();
  console.group(`🎬 Action: ${call.name}`);
  console.log('📥 Args:', call.args);
  console.log('🎯 Context:', call.context);
  
  try {
    const result = next(call);
    const duration = performance.now() - start;
    console.log(`✅ Completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    console.groupEnd();
    throw error;
  }
};

// 性能监控中间件
const performanceMiddleware = (call, next) => {
  const start = performance.now();
  const result = next(call);
  const duration = performance.now() - start;
  
  // 记录性能数据
  performanceTracker.record(call.name, duration);
  
  // 性能警告
  if (duration > 100) {
    console.warn(`⚠️ Slow action: ${call.name} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};
```

### 2. Hooks (钩子函数)

MST 提供了多种钩子函数来监听状态变化和生命周期事件。

#### onSnapshot - 快照监听
```javascript
import { onSnapshot } from "mobx-state-tree";

const disposer = onSnapshot(store, (snapshot) => {
  console.log("📸 Snapshot changed:", snapshot);
  // 持久化到 localStorage
  localStorage.setItem("store", JSON.stringify(snapshot));
});

// 清理监听器
disposer();
```

#### onPatch - 补丁监听
```javascript
import { onPatch } from "mobx-state-tree";

const disposer = onPatch(store, (patch, reversePatch) => {
  console.log("🔧 Patch applied:", patch);
  console.log("↩️ Reverse patch:", reversePatch);
  
  // 可用于实现撤销/重做功能
  undoRedoManager.addPatch(patch, reversePatch);
});
```

#### onAction - 动作监听
```javascript
import { onAction } from "mobx-state-tree";

const disposer = onAction(store, (action) => {
  console.log("🎬 Action called:", {
    name: action.name,
    path: action.path,
    args: action.args
  });
  
  // 审计日志
  auditLogger.log(action);
});
```

#### 生命周期钩子
```javascript
const Model = types
  .model("Model", {
    // ... 属性定义
  })
  .actions((self) => ({
    afterCreate() {
      console.log("🎉 Model created");
      // 初始化逻辑
    },
    
    beforeDestroy() {
      console.log("💀 Model destroying");
      // 清理逻辑
    },
    
    afterAttach() {
      console.log("🔗 Model attached to tree");
    },
    
    beforeDetach() {
      console.log("🔓 Model detaching from tree");
    }
  }));
```

### 3. Custom Types (自定义类型)

自定义类型允许扩展 MST 的类型系统。

#### 基本语法
```javascript
import { types } from "mobx-state-tree";

const CustomType = types.custom({
  name: "CustomType",
  
  // 从快照创建实例
  fromSnapshot(value) {
    return new CustomClass(value);
  },
  
  // 将实例转换为快照
  toSnapshot(value) {
    return value.serialize();
  },
  
  // 类型检查
  isTargetType(value) {
    return value instanceof CustomClass;
  },
  
  // 验证消息
  getValidationMessage(value) {
    if (!this.isTargetType(value)) {
      return "Expected CustomClass instance";
    }
    return "";
  }
});
```

#### 实际示例
```javascript
// 日期类型
const DateType = types.custom({
  name: "Date",
  fromSnapshot(value) {
    return new Date(value);
  },
  toSnapshot(value) {
    return value.toISOString();
  },
  isTargetType(value) {
    return value instanceof Date;
  },
  getValidationMessage(value) {
    if (!(value instanceof Date)) {
      return "Expected a Date object";
    }
    if (isNaN(value.getTime())) {
      return "Expected a valid Date";
    }
    return "";
  }
});

// URL 类型
const URLType = types.custom({
  name: "URL",
  fromSnapshot(value) {
    return new URL(value);
  },
  toSnapshot(value) {
    return value.toString();
  },
  isTargetType(value) {
    return value instanceof URL;
  },
  getValidationMessage(value) {
    try {
      new URL(value);
      return "";
    } catch {
      return "Expected a valid URL string";
    }
  }
});

// 使用自定义类型
const Model = types.model("Model", {
  createdAt: DateType,
  website: URLType
});
```

### 4. Mixins (混入)

通过 `.extend()` 方法实现功能模块化和复用。

#### 基本语法
```javascript
const MixinFunction = (BaseModel) => BaseModel
  .volatile(() => ({
    // 临时状态
  }))
  .views((self) => ({
    // 计算属性
  }))
  .actions((self) => ({
    // 动作方法
  }));

// 应用混入
const EnhancedModel = BaseModel.extend(MixinFunction);
```

#### 实际示例
```javascript
// 审计混入
const AuditMixin = (BaseModel) => BaseModel
  .volatile(() => ({
    auditLog: []
  }))
  .views((self) => ({
    get lastAuditEntry() {
      return self.auditLog[self.auditLog.length - 1];
    },
    
    getAuditHistory(limit = 10) {
      return self.auditLog.slice(-limit);
    }
  }))
  .actions((self) => ({
    logAction(actionName, args, user = "system") {
      self.auditLog.push({
        action: actionName,
        args: args,
        user: user,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9)
      });
      
      // 限制日志大小
      if (self.auditLog.length > 1000) {
        self.auditLog.splice(0, self.auditLog.length - 1000);
      }
    },
    
    clearAuditLog() {
      self.auditLog.clear();
    }
  }));

// 缓存混入
const CacheMixin = (BaseModel) => BaseModel
  .volatile(() => ({
    cache: new Map(),
    cacheStats: { hits: 0, misses: 0 }
  }))
  .views((self) => ({
    get cacheHitRate() {
      const total = self.cacheStats.hits + self.cacheStats.misses;
      return total > 0 ? (self.cacheStats.hits / total * 100).toFixed(2) : 0;
    }
  }))
  .actions((self) => ({
    setCache(key, value, ttl = 300000) { // 5分钟默认TTL
      self.cache.set(key, {
        value,
        timestamp: Date.now(),
        ttl
      });
    },
    
    getCache(key) {
      const entry = self.cache.get(key);
      if (!entry) {
        self.cacheStats.misses++;
        return undefined;
      }
      
      // 检查过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        self.cache.delete(key);
        self.cacheStats.misses++;
        return undefined;
      }
      
      self.cacheStats.hits++;
      return entry.value;
    },
    
    clearCache() {
      self.cache.clear();
    },
    
    clearExpiredCache() {
      const now = Date.now();
      for (const [key, entry] of self.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          self.cache.delete(key);
        }
      }
    }
  }));

// 组合多个混入
const EnhancedTask = Task
  .extend(AuditMixin)
  .extend(CacheMixin);
```

## 🔌 完整插件系统实现

### 插件接口定义
```javascript
// 插件接口
interface Plugin {
  name: string;
  install(store: any, options?: any): PluginInstance;
}

interface PluginInstance {
  dispose?(): void;
  [key: string]: any; // 插件特定的方法和属性
}
```

### 插件管理器
```javascript
export class PluginManager {
  constructor(store) {
    this.store = store;
    this.plugins = new Map();
  }
  
  use(plugin, options = {}) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`⚠️ Plugin ${plugin.name} is already installed`);
      return this;
    }
    
    console.log(`🔌 Installing plugin: ${plugin.name}`);
    const pluginInstance = plugin.install(this.store, options);
    this.plugins.set(plugin.name, pluginInstance);
    
    return this;
  }
  
  uninstall(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin && plugin.dispose) {
      plugin.dispose();
      this.plugins.delete(pluginName);
      console.log(`🔌 Uninstalled plugin: ${pluginName}`);
    }
  }
  
  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }
  
  listPlugins() {
    return Array.from(this.plugins.keys());
  }
  
  dispose() {
    this.plugins.forEach((plugin, name) => {
      if (plugin.dispose) {
        plugin.dispose();
      }
    });
    this.plugins.clear();
    console.log('🔌 All plugins disposed');
  }
}
```

### 内置插件实现

#### 1. 日志插件
```javascript
export const LoggingPlugin = {
  name: 'LoggingPlugin',
  install(store, options = {}) {
    const { 
      enableActionLog = true, 
      enableSnapshotLog = false, 
      enablePatchLog = false,
      logLevel = 'info'
    } = options;
    
    const disposers = [];
    
    if (enableActionLog) {
      const loggingMiddleware = (call, next) => {
        const start = performance.now();
        console.group(`🎬 Action: ${call.name}`);
        console.log('📥 Args:', call.args);
        
        try {
          const result = next(call);
          const duration = performance.now() - start;
          console.log(`✅ Completed in ${duration.toFixed(2)}ms`);
          console.groupEnd();
          return result;
        } catch (error) {
          console.error('❌ Error:', error);
          console.groupEnd();
          throw error;
        }
      };
      
      addMiddleware(store, loggingMiddleware);
    }
    
    if (enableSnapshotLog) {
      const snapshotDisposer = onSnapshot(store, (snapshot) => {
        console.log('📸 Snapshot updated:', snapshot);
      });
      disposers.push(snapshotDisposer);
    }
    
    if (enablePatchLog) {
      const patchDisposer = onPatch(store, (patch, reversePatch) => {
        console.log('🔧 Patch applied:', patch);
      });
      disposers.push(patchDisposer);
    }
    
    return {
      dispose() {
        disposers.forEach(dispose => dispose());
      }
    };
  }
};
```

#### 2. 性能监控插件
```javascript
export const PerformancePlugin = {
  name: 'PerformancePlugin',
  install(store, options = {}) {
    const { threshold = 100, enableWarnings = true } = options;
    const performanceData = new Map();
    
    const performanceMiddleware = (call, next) => {
      const start = performance.now();
      const result = next(call);
      const duration = performance.now() - start;
      
      // 记录性能数据
      const actionName = call.name;
      if (!performanceData.has(actionName)) {
        performanceData.set(actionName, {
          count: 0,
          totalTime: 0,
          maxTime: 0,
          minTime: Infinity,
          samples: []
        });
      }
      
      const data = performanceData.get(actionName);
      data.count++;
      data.totalTime += duration;
      data.maxTime = Math.max(data.maxTime, duration);
      data.minTime = Math.min(data.minTime, duration);
      data.samples.push({
        duration,
        timestamp: Date.now(),
        args: call.args
      });
      
      // 保持最近100个样本
      if (data.samples.length > 100) {
        data.samples.shift();
      }
      
      // 性能警告
      if (enableWarnings && duration > threshold) {
        console.warn(`⚠️ Slow action: ${actionName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    };
    
    addMiddleware(store, performanceMiddleware);
    
    return {
      getPerformanceReport() {
        const report = {};
        performanceData.forEach((data, actionName) => {
          report[actionName] = {
            ...data,
            avgTime: data.totalTime / data.count,
            samples: undefined // 不包含在报告中
          };
        });
        return report;
      },
      
      getDetailedReport(actionName) {
        return performanceData.get(actionName);
      },
      
      clearPerformanceData() {
        performanceData.clear();
      },
      
      setThreshold(newThreshold) {
        threshold = newThreshold;
      }
    };
  }
};
```

#### 3. 持久化插件
```javascript
export const PersistencePlugin = {
  name: 'PersistencePlugin',
  install(store, options = {}) {
    const { 
      key = 'mst-store', 
      storage = localStorage, 
      debounceTime = 1000,
      blacklist = [],
      whitelist = null,
      serialize = JSON.stringify,
      deserialize = JSON.parse
    } = options;
    
    let timeoutId = null;
    
    const shouldPersistField = (fieldName) => {
      if (whitelist) {
        return whitelist.includes(fieldName);
      }
      return !blacklist.includes(fieldName);
    };
    
    const filterSnapshot = (snapshot) => {
      if (typeof snapshot !== 'object' || snapshot === null) {
        return snapshot;
      }
      
      const filtered = {};
      for (const [key, value] of Object.entries(snapshot)) {
        if (shouldPersistField(key)) {
          filtered[key] = value;
        }
      }
      return filtered;
    };
    
    const saveData = (snapshot) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        try {
          const filteredSnapshot = filterSnapshot(snapshot);
          const serialized = serialize(filteredSnapshot);
          storage.setItem(key, serialized);
          console.log('💾 Data persisted to storage');
        } catch (error) {
          console.error('❌ Failed to persist data:', error);
        }
      }, debounceTime);
    };
    
    const snapshotDisposer = onSnapshot(store, saveData);
    
    return {
      dispose() {
        snapshotDisposer();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
      
      loadInitialData() {
        try {
          const savedData = storage.getItem(key);
          if (savedData) {
            const parsed = deserialize(savedData);
            console.log('💾 Loading persisted data:', parsed);
            return parsed;
          }
        } catch (error) {
          console.error('❌ Failed to load persisted data:', error);
        }
        return null;
      },
      
      clearPersistedData() {
        storage.removeItem(key);
        console.log('🗑️ Persisted data cleared');
      },
      
      forceSave() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        const snapshot = getSnapshot(store);
        saveData(snapshot);
      }
    };
  }
};
```

#### 4. 验证插件
```javascript
export const ValidationPlugin = {
  name: 'ValidationPlugin',
  install(store, options = {}) {
    const { 
      enableRealTimeValidation = true, 
      customValidators = {},
      onValidationError = null
    } = options;
    
    const validationErrors = new Map();
    
    const validateAction = (call, next) => {
      const actionName = call.name;
      const validator = customValidators[actionName];
      
      if (validator && enableRealTimeValidation) {
        try {
          const validationResult = validator(call.args, call.context);
          
          if (validationResult === false || 
              (typeof validationResult === 'object' && !validationResult.valid)) {
            
            const error = new Error(
              validationResult.message || `Validation failed for action: ${actionName}`
            );
            
            validationErrors.set(actionName, {
              error,
              timestamp: new Date(),
              args: call.args
            });
            
            if (onValidationError) {
              onValidationError(error, call);
            }
            
            throw error;
          } else {
            validationErrors.delete(actionName);
          }
        } catch (error) {
          console.error(`❌ Validation error in ${actionName}:`, error);
          throw error;
        }
      }
      
      return next(call);
    };
    
    addMiddleware(store, validateAction);
    
    return {
      addValidator(actionName, validator) {
        customValidators[actionName] = validator;
      },
      
      removeValidator(actionName) {
        delete customValidators[actionName];
      },
      
      getValidationErrors() {
        return Array.from(validationErrors.entries());
      },
      
      clearValidationErrors() {
        validationErrors.clear();
      },
      
      validateNow(actionName, args, context) {
        const validator = customValidators[actionName];
        if (validator) {
          return validator(args, context);
        }
        return { valid: true };
      }
    };
  }
};
```

### 预设配置
```javascript
export const PluginPresets = {
  development: {
    plugins: [
      { 
        plugin: LoggingPlugin, 
        options: { 
          enableActionLog: true, 
          enablePatchLog: true,
          logLevel: 'debug'
        } 
      },
      { 
        plugin: PerformancePlugin, 
        options: { 
          threshold: 50, 
          enableWarnings: true 
        } 
      },
      { 
        plugin: PersistencePlugin, 
        options: { 
          debounceTime: 500,
          blacklist: ['isLoading', 'error']
        } 
      }
    ]
  },
  
  production: {
    plugins: [
      { 
        plugin: PerformancePlugin, 
        options: { 
          threshold: 200, 
          enableWarnings: false 
        } 
      },
      { 
        plugin: PersistencePlugin, 
        options: { 
          debounceTime: 2000,
          blacklist: ['isLoading', 'error', 'cache']
        } 
      }
    ]
  },
  
  testing: {
    plugins: [
      { 
        plugin: ValidationPlugin, 
        options: { 
          enableRealTimeValidation: true 
        } 
      },
      { 
        plugin: LoggingPlugin, 
        options: { 
          enableActionLog: false, 
          enablePatchLog: true 
        } 
      }
    ]
  }
};
```

## 🚀 使用指南

### 基本使用
```javascript
import { installPlugins } from './plugins/mstPlugins';

// 创建 store
const store = MyStore.create({});

// 安装插件系统
const pluginManager = installPlugins(store, 'development');

// 获取插件实例
const performancePlugin = pluginManager.getPlugin('PerformancePlugin');
const report = performancePlugin.getPerformanceReport();

// 清理
pluginManager.dispose();
```

### 自定义插件开发
```javascript
export const MyCustomPlugin = {
  name: 'MyCustomPlugin',
  install(store, options = {}) {
    // 插件初始化逻辑
    const { config } = options;
    
    // 添加中间件
    const middleware = (call, next) => {
      // 自定义逻辑
      return next(call);
    };
    addMiddleware(store, middleware);
    
    // 添加监听器
    const disposer = onSnapshot(store, (snapshot) => {
      // 处理快照变化
    });
    
    // 返回插件实例
    return {
      dispose() {
        disposer();
      },
      
      // 插件特定方法
      customMethod() {
        // 实现
      }
    };
  }
};

// 使用自定义插件
pluginManager.use(MyCustomPlugin, { config: 'value' });
```

## 📊 性能考虑

### 中间件性能
- 中间件按顺序执行，避免过多的中间件
- 在中间件中避免重计算和重渲染
- 使用条件判断减少不必要的处理

### 内存管理
- 及时清理监听器和定时器
- 限制缓存和日志的大小
- 使用弱引用避免内存泄漏

### 最佳实践
```javascript
// ✅ 好的做法
const middleware = (call, next) => {
  // 快速检查
  if (!shouldProcess(call.name)) {
    return next(call);
  }
  
  // 最小化处理
  const result = next(call);
  
  // 异步处理重任务
  setTimeout(() => {
    heavyProcessing(call);
  }, 0);
  
  return result;
};

// ❌ 避免的做法
const badMiddleware = (call, next) => {
  // 同步重任务
  const heavyResult = expensiveComputation(call);
  
  // 每次都处理
  logEverything(call);
  
  return next(call);
};
```

## 🔧 调试和测试

### 调试插件
```javascript
// 开发环境调试
if (process.env.NODE_ENV === 'development') {
  // 启用详细日志
  pluginManager.use(LoggingPlugin, {
    enableActionLog: true,
    enableSnapshotLog: true,
    enablePatchLog: true
  });
  
  // 性能监控
  pluginManager.use(PerformancePlugin, {
    threshold: 10, // 更严格的阈值
    enableWarnings: true
  });
}
```

### 测试插件
```javascript
// 插件单元测试
describe('LoggingPlugin', () => {
  let store, pluginManager;
  
  beforeEach(() => {
    store = TestStore.create({});
    pluginManager = new PluginManager(store);
  });
  
  afterEach(() => {
    pluginManager.dispose();
  });
  
  it('should log actions', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    pluginManager.use(LoggingPlugin, {
      enableActionLog: true
    });
    
    store.someAction();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Action: someAction')
    );
  });
});
```

## 🎯 实际应用场景

### 1. 开发环境
- **日志记录**: 追踪所有状态变化
- **性能监控**: 识别性能瓶颈
- **调试工具**: 状态检查和时间旅行

### 2. 生产环境
- **错误追踪**: 记录关键错误信息
- **性能优化**: 监控关键指标
- **数据持久化**: 自动保存用户状态

### 3. 测试环境
- **状态验证**: 确保状态一致性
- **行为记录**: 记录用户操作序列
- **回放测试**: 重现特定场景

### 4. 企业应用
- **审计日志**: 符合合规要求
- **权限控制**: 基于角色的访问控制
- **数据同步**: 多端状态同步

## 📚 总结

MST 的插件机制提供了强大而灵活的扩展能力：

1. **非侵入式**: 不修改原有代码结构
2. **可组合性**: 多个插件协同工作
3. **高性能**: 基于中间件的高效实现
4. **类型安全**: 完整的 TypeScript 支持
5. **易于测试**: 插件可独立测试和验证

通过合理使用插件机制，可以构建出功能丰富、易于维护的状态管理系统，满足各种复杂的业务需求。