/**
 * MST 插件系统入口文件
 * 统一管理和导出所有插件
 */

import { PluginManager } from './PluginManager.js';
import { PersistencePlugin } from './PersistencePlugin.js';
import { PerformancePlugin } from './PerformancePlugin.js';
import { LoggerPlugin } from './LoggerPlugin.js';
import { ValidationPlugin } from './ValidationPlugin.js';

// 导出所有插件类
export {
  PluginManager,
  PersistencePlugin,
  PerformancePlugin,
  LoggerPlugin,
  ValidationPlugin
};

/**
 * 安装插件系统到 MST 模型
 * @param {Object} model - MST 模型实例
 * @param {string} environment - 运行环境 ('development' | 'production' | 'test')
 * @param {Object} config - 插件配置
 * @returns {PluginManager} 插件管理器实例
 */
export function installPlugins(model, environment = 'development', config = {}) {
  const manager = new PluginManager(model, environment);
  
  // 初始化插件管理器
  manager.initialize();

  // 默认配置
  const defaultConfig = {
    persistence: {
      enabled: true,
      key: 'mst-store',
      storage: typeof window !== 'undefined' ? window.localStorage : null,
      throttle: 2000,
      whitelist: null,
      blacklist: ['isLoading', 'error', 'selectedTaskId'], // 不持久化的临时状态
      autoRestore: true
    },
    performance: {
      enabled: environment !== 'test',
      trackActions: true,
      trackPatches: environment === 'development',
      trackMemory: environment === 'development',
      sampleRate: environment === 'development' ? 1.0 : 0.1,
      reportInterval: environment === 'development' ? 30000 : 300000, // 开发环境30秒，生产环境5分钟
      onReport: (report) => {
        if (environment === 'development') {
          console.log('📊 Performance Report:', report);
        }
        // 生产环境可以发送到监控服务
      }
    },
    logger: {
      enabled: environment !== 'production',
      logActions: true,
      logPatches: environment === 'development',
      logSnapshots: false,
      maxLogs: environment === 'development' ? 1000 : 100,
      outputToConsole: environment === 'development',
      filters: {
        actions: [], // 可以过滤掉频繁的 actions
        paths: ['/volatile/'] // 过滤掉 volatile 状态的变化
      }
    },
    validation: {
      enabled: true,
      validateOn: ['change'],
      stopOnFirstError: false,
      onValidationChange: (field, errors, allErrors) => {
        if (environment === 'development' && errors.length > 0) {
          console.warn(`🚨 Validation errors for ${field}:`, errors);
        }
      }
    }
  };

  // 合并用户配置
  const finalConfig = {
    persistence: { ...defaultConfig.persistence, ...config.persistence },
    performance: { ...defaultConfig.performance, ...config.performance },
    logger: { ...defaultConfig.logger, ...config.logger },
    validation: { ...defaultConfig.validation, ...config.validation }
  };

  // 注册插件
  const pluginConfigs = [];

  // 持久化插件
  if (finalConfig.persistence.enabled && finalConfig.persistence.storage) {
    pluginConfigs.push({
      plugin: new PersistencePlugin(),
      options: {
        ...finalConfig.persistence,
        environments: ['development', 'production'] // 在所有环境中启用
      }
    });
  }

  // 性能监控插件
  if (finalConfig.performance.enabled) {
    pluginConfigs.push({
      plugin: new PerformancePlugin(),
      options: {
        ...finalConfig.performance,
        environments: ['development', 'production']
      }
    });
  }

  // 日志插件
  if (finalConfig.logger.enabled) {
    pluginConfigs.push({
      plugin: new LoggerPlugin(),
      options: {
        ...finalConfig.logger,
        environments: ['development', 'test']
      }
    });
  }

  // 验证插件
  if (finalConfig.validation.enabled) {
    pluginConfigs.push({
      plugin: new ValidationPlugin(),
      options: {
        ...finalConfig.validation,
        environments: ['development', 'production', 'test']
      }
    });
  }

  // 批量注册插件
  try {
    manager.registerMultiple(pluginConfigs);
    
    // 添加全局钩子
    manager.addHook('plugin:registered', ({ plugin }) => {
      console.log(`✅ Plugin ${plugin.name} v${plugin.version} registered successfully`);
    });

    manager.addHook('plugin:unregistered', ({ pluginName }) => {
      console.log(`🗑️ Plugin ${pluginName} unregistered`);
    });

    // 错误处理钩子
    manager.addHook('plugin:error', ({ plugin, error }) => {
      console.error(`❌ Plugin ${plugin.name} error:`, error);
    });

    console.log(`🔌 Plugin system initialized with ${manager.listPlugins().length} plugins in ${environment} mode`);
    
  } catch (error) {
    console.error('❌ Failed to initialize plugin system:', error);
    throw error;
  }

  return manager;
}

/**
 * 创建开发环境插件配置
 * @param {Object} model - MST 模型实例
 * @param {Object} customConfig - 自定义配置
 * @returns {PluginManager} 插件管理器实例
 */
export function createDevelopmentPlugins(model, customConfig = {}) {
  return installPlugins(model, 'development', {
    logger: {
      logActions: true,
      logPatches: true,
      outputToConsole: true,
      debug: true,
      ...customConfig.logger
    },
    performance: {
      trackActions: true,
      trackPatches: true,
      trackMemory: true,
      sampleRate: 1.0,
      reportInterval: 30000,
      ...customConfig.performance
    },
    ...customConfig
  });
}

/**
 * 创建生产环境插件配置
 * @param {Object} model - MST 模型实例
 * @param {Object} customConfig - 自定义配置
 * @returns {PluginManager} 插件管理器实例
 */
export function createProductionPlugins(model, customConfig = {}) {
  return installPlugins(model, 'production', {
    logger: {
      enabled: false,
      ...customConfig.logger
    },
    performance: {
      sampleRate: 0.1,
      reportInterval: 300000,
      trackPatches: false,
      trackMemory: false,
      ...customConfig.performance
    },
    ...customConfig
  });
}

/**
 * 创建测试环境插件配置
 * @param {Object} model - MST 模型实例
 * @param {Object} customConfig - 自定义配置
 * @returns {PluginManager} 插件管理器实例
 */
export function createTestPlugins(model, customConfig = {}) {
  return installPlugins(model, 'test', {
    persistence: {
      enabled: false,
      ...customConfig.persistence
    },
    performance: {
      enabled: false,
      ...customConfig.performance
    },
    logger: {
      outputToConsole: false,
      maxLogs: 50,
      ...customConfig.logger
    },
    ...customConfig
  });
}

/**
 * 插件调试工具
 */
export class PluginDebugger {
  /**
   * 调试插件管理器
   * @param {PluginManager} pluginManager - 插件管理器
   */
  static debug(pluginManager) {
    console.group('🔍 Plugin Debug Info');
    
    const stats = pluginManager.getStats();
    console.log('Environment:', stats.environment);
    console.log('Total Plugins:', stats.totalPlugins);
    console.log('Initialized:', stats.initialized);
    
    console.group('📦 Registered Plugins');
    stats.plugins.forEach(plugin => {
      console.group(`${plugin.name} v${plugin.version}`);
      console.log('Installed:', plugin.installed);
      console.log('Options:', plugin.options);
      console.groupEnd();
    });
    console.groupEnd();
    
    console.log('Available Hooks:', stats.hooks);
    console.groupEnd();
  }

  /**
   * 测试插件
   * @param {BasePlugin} plugin - 插件实例
   * @param {Object} model - MST 模型
   * @param {Object} options - 测试选项
   */
  static testPlugin(plugin, model, options = {}) {
    console.log(`🧪 Testing plugin: ${plugin.name}`);
    
    try {
      // 测试安装
      const installedPlugin = plugin.install(model, options);
      console.log('✅ Install: OK');
      
      // 测试基本功能
      if (typeof installedPlugin.getStatus === 'function') {
        const status = installedPlugin.getStatus();
        console.log('📊 Status:', status);
      }
      
      // 测试卸载
      installedPlugin.uninstall();
      console.log('✅ Uninstall: OK');
      
      console.log('🎉 Plugin test completed successfully');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * 性能基准测试
   * @param {PluginManager} pluginManager - 插件管理器
   * @param {Function} testFunction - 测试函数
   * @param {number} iterations - 迭代次数
   */
  static async benchmark(pluginManager, testFunction, iterations = 1000) {
    console.log(`⏱️ Running benchmark with ${iterations} iterations...`);
    
    const performancePlugin = pluginManager.getPlugin('PerformancePlugin');
    if (performancePlugin) {
      performancePlugin.clearPerformanceData();
    }
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await testFunction(i);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log(`📈 Benchmark Results:`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average Time: ${(totalTime / iterations).toFixed(2)}ms per iteration`);
    console.log(`Throughput: ${(iterations / (totalTime / 1000)).toFixed(2)} operations/second`);
    
    if (performancePlugin) {
      const report = performancePlugin.getPerformanceReport();
      console.log('📊 Performance Report:', report);
    }
  }
}

// 默认导出
export default {
  installPlugins,
  createDevelopmentPlugins,
  createProductionPlugins,
  createTestPlugins,
  PluginDebugger,
  PluginManager,
  PersistencePlugin,
  PerformancePlugin,
  LoggerPlugin,
  ValidationPlugin
};