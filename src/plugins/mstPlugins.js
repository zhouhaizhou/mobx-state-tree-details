import { addMiddleware, onSnapshot, onPatch, onAction } from "mobx-state-tree";

// 🔌 MST 插件系统

// 1. 日志插件
export const LoggingPlugin = {
  name: 'LoggingPlugin',
  install(store, options = {}) {
    const { enableActionLog = true, enableSnapshotLog = false, enablePatchLog = false } = options;
    
    const disposers = [];
    
    // Action 日志中间件
    if (enableActionLog) {
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
      
      addMiddleware(store, loggingMiddleware);
    }
    
    // 快照日志
    if (enableSnapshotLog) {
      const snapshotDisposer = onSnapshot(store, (snapshot) => {
        console.log('📸 Snapshot updated:', snapshot);
      });
      disposers.push(snapshotDisposer);
    }
    
    // 补丁日志
    if (enablePatchLog) {
      const patchDisposer = onPatch(store, (patch, reversePatch) => {
        console.log('🔧 Patch applied:', patch);
        console.log('↩️ Reverse patch:', reversePatch);
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

// 2. 性能监控插件
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
          minTime: Infinity
        });
      }
      
      const data = performanceData.get(actionName);
      data.count++;
      data.totalTime += duration;
      data.maxTime = Math.max(data.maxTime, duration);
      data.minTime = Math.min(data.minTime, duration);
      
      // 性能警告
      if (enableWarnings && duration > threshold) {
        console.warn(`⚠️ Slow action detected: ${actionName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    };
    
    addMiddleware(store, performanceMiddleware);
    
    return {
      dispose() {
        // 中间件无法直接移除，但可以标记为禁用
      },
      getPerformanceReport() {
        const report = {};
        performanceData.forEach((data, actionName) => {
          report[actionName] = {
            ...data,
            avgTime: data.totalTime / data.count
          };
        });
        return report;
      },
      clearPerformanceData() {
        performanceData.clear();
      }
    };
  }
};

// 3. 持久化插件
export const PersistencePlugin = {
  name: 'PersistencePlugin',
  install(store, options = {}) {
    const { 
      key = 'mst-store', 
      storage = localStorage, 
      debounceTime = 1000,
      blacklist = [] 
    } = options;
    
    let timeoutId = null;
    
    // 加载初始数据
    const loadInitialData = () => {
      try {
        const savedData = storage.getItem(key);
        if (savedData) {
          const snapshot = JSON.parse(savedData);
          // 过滤黑名单字段
          const filteredSnapshot = { ...snapshot };
          blacklist.forEach(field => {
            delete filteredSnapshot[field];
          });
          
          console.log('💾 Loading persisted data:', filteredSnapshot);
          return filteredSnapshot;
        }
      } catch (error) {
        console.error('❌ Failed to load persisted data:', error);
      }
      return null;
    };
    
    // 保存数据（防抖）
    const saveData = (snapshot) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        try {
          // 过滤黑名单字段
          const filteredSnapshot = { ...snapshot };
          blacklist.forEach(field => {
            delete filteredSnapshot[field];
          });
          
          storage.setItem(key, JSON.stringify(filteredSnapshot));
          console.log('💾 Data persisted to storage');
        } catch (error) {
          console.error('❌ Failed to persist data:', error);
        }
      }, debounceTime);
    };
    
    // 监听快照变化
    const snapshotDisposer = onSnapshot(store, saveData);
    
    return {
      dispose() {
        snapshotDisposer();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
      loadInitialData,
      clearPersistedData() {
        storage.removeItem(key);
        console.log('🗑️ Persisted data cleared');
      }
    };
  }
};

// 4. 验证插件
export const ValidationPlugin = {
  name: 'ValidationPlugin',
  install(store, options = {}) {
    const { enableRealTimeValidation = true, customValidators = {} } = options;
    const validationErrors = new Map();
    
    const validateAction = (call, next) => {
      const actionName = call.name;
      const validator = customValidators[actionName];
      
      if (validator && enableRealTimeValidation) {
        try {
          const isValid = validator(call.args, call.context);
          if (!isValid) {
            const error = new Error(`Validation failed for action: ${actionName}`);
            validationErrors.set(actionName, error);
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
      dispose() {
        // 中间件无法直接移除
      },
      getValidationErrors() {
        return Array.from(validationErrors.entries());
      },
      clearValidationErrors() {
        validationErrors.clear();
      }
    };
  }
};

// 5. 插件管理器
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

// 6. 预设插件配置
export const PluginPresets = {
  development: {
    plugins: [
      { plugin: LoggingPlugin, options: { enableActionLog: true, enablePatchLog: true } },
      { plugin: PerformancePlugin, options: { threshold: 50, enableWarnings: true } },
      { plugin: PersistencePlugin, options: { debounceTime: 500 } }
    ]
  },
  
  production: {
    plugins: [
      { plugin: PerformancePlugin, options: { threshold: 200, enableWarnings: false } },
      { plugin: PersistencePlugin, options: { debounceTime: 2000 } }
    ]
  },
  
  testing: {
    plugins: [
      { plugin: ValidationPlugin, options: { enableRealTimeValidation: true } }
    ]
  }
};

// 7. 便捷安装函数
export function installPlugins(store, preset = 'development') {
  const manager = new PluginManager(store);
  const config = PluginPresets[preset];
  
  if (config) {
    config.plugins.forEach(({ plugin, options }) => {
      manager.use(plugin, options);
    });
  }
  
  return manager;
}