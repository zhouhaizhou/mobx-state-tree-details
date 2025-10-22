import React, { useState } from 'react';
import { observer } from 'mobx-react';
import taskStore from '../models/TaskStore';

const PluginTutorial = observer(() => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activePlugin, setActivePlugin] = useState('logging');
  const [showCode, setShowCode] = useState({});

  const toggleCode = (section) => {
    setShowCode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    { id: 'overview', title: '📖 插件系统概览', icon: '🔌' },
    { id: 'mechanism', title: '🔧 核心机制详解', icon: '⚙️' },
    { id: 'plugins', title: '🧩 内置插件详解', icon: '📦' },
    { id: 'usage', title: '🚀 使用方法示例', icon: '💡' },
    { id: 'custom', title: '🛠️ 自定义插件开发', icon: '🔨' },
    { id: 'best-practices', title: '✨ 最佳实践', icon: '🎯' }
  ];

  const plugins = [
    { id: 'logging', name: 'LoggingPlugin', title: '日志插件', icon: '📝' },
    { id: 'performance', name: 'PerformancePlugin', title: '性能监控插件', icon: '📊' },
    { id: 'persistence', name: 'PersistencePlugin', title: '持久化插件', icon: '💾' },
    { id: 'validation', name: 'ValidationPlugin', title: '验证插件', icon: '✅' }
  ];

  const renderOverview = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔌 MST 插件系统概览</h2>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #007bff'
      }}>
        <h3 style={{ color: '#007bff', marginTop: 0 }}>💡 什么是 MST 插件系统？</h3>
        <p style={{ lineHeight: '1.6', margin: 0 }}>
          MST 插件系统是一套基于中间件模式的扩展机制，允许开发者以非侵入式的方式为 MobX-State-Tree 添加功能。
          通过插件系统，您可以实现日志记录、性能监控、数据持久化、验证等横切关注点，而无需修改原有的业务逻辑代码。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
          <h4 style={{ color: '#155724', marginTop: 0 }}>🎯 核心优势</h4>
          <ul style={{ color: '#155724', paddingLeft: '20px' }}>
            <li>非侵入式设计</li>
            <li>可组合和可复用</li>
            <li>高性能实现</li>
            <li>类型安全支持</li>
          </ul>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <h4 style={{ color: '#856404', marginTop: 0 }}>🔧 核心机制</h4>
          <ul style={{ color: '#856404', paddingLeft: '20px' }}>
            <li>Middleware (中间件)</li>
            <li>Hooks (钩子函数)</li>
            <li>Custom Types (自定义类型)</li>
            <li>Mixins (混入模式)</li>
          </ul>
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
        <h4 style={{ color: '#495057', marginTop: 0 }}>🚀 快速开始</h4>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          overflow: 'auto'
        }}>
          <pre style={{ margin: 0 }}>{`// 1. 导入插件系统
import { installPlugins } from './plugins/mstPlugins';

// 2. 创建 store
const store = MyStore.create({});

// 3. 安装插件
const pluginManager = installPlugins(store, 'development');

// 4. 开始使用！
console.log('已安装插件:', pluginManager.listPlugins());`}</pre>
        </div>
      </div>
    </div>
  );

  const renderMechanism = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>⚙️ 核心机制详解</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>1. 🔧 Middleware (中间件)</h3>
        <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
          中间件是插件系统的核心，可以拦截所有 Action 调用，在执行前后添加自定义逻辑。
        </p>
        
        <button 
          onClick={() => toggleCode('middleware')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showCode.middleware ? '隐藏代码' : '查看代码示例'}
        </button>
        
        {showCode.middleware && (
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
            <pre style={{ margin: 0 }}>{`import { addMiddleware } from "mobx-state-tree";

// 基本中间件结构
const loggingMiddleware = (call, next) => {
  // 前置处理
  console.log(\`🎬 Action: \${call.name}\`, call.args);
  const start = performance.now();
  
  // 调用下一个中间件或实际 Action
  const result = next(call);
  
  // 后置处理
  const duration = performance.now() - start;
  console.log(\`✅ Completed in \${duration.toFixed(2)}ms\`);
  
  return result;
};

// 安装中间件
addMiddleware(store, loggingMiddleware);

// 中间件参数说明：
// call.name     - Action 名称
// call.args     - Action 参数数组
// call.context  - Action 执行上下文 (MST 节点)
// call.tree     - 整个 MST 树的根节点`}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>2. 🔗 Hooks (钩子函数)</h3>
        <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
          钩子函数用于监听状态变化和生命周期事件，支持快照、补丁和动作监听。
        </p>
        
        <button 
          onClick={() => toggleCode('hooks')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showCode.hooks ? '隐藏代码' : '查看钩子函数示例'}
        </button>
        
        {showCode.hooks && (
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
            <pre style={{ margin: 0 }}>{`import { onSnapshot, onPatch, onAction } from "mobx-state-tree";

// 1. 快照监听 - 监听整个状态树的变化
const snapshotDisposer = onSnapshot(store, (snapshot) => {
  console.log("📸 状态快照:", snapshot);
  // 可用于持久化
  localStorage.setItem("store", JSON.stringify(snapshot));
});

// 2. 补丁监听 - 监听细粒度的状态变化
const patchDisposer = onPatch(store, (patch, reversePatch) => {
  console.log("🔧 状态补丁:", patch);
  console.log("↩️ 逆向补丁:", reversePatch);
  // 可用于实现撤销/重做功能
});

// 3. 动作监听 - 监听所有 Action 调用
const actionDisposer = onAction(store, (action) => {
  console.log("🎬 动作调用:", {
    name: action.name,
    path: action.path,
    args: action.args
  });
});

// 4. 生命周期钩子
const Model = types.model("Model", {})
  .actions((self) => ({
    afterCreate() {
      console.log("🎉 模型创建完成");
    },
    beforeDestroy() {
      console.log("💀 模型即将销毁");
    }
  }));

// 清理监听器
snapshotDisposer();
patchDisposer();
actionDisposer();`}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>3. 🧩 Custom Types (自定义类型)</h3>
        <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
          自定义类型允许扩展 MST 的类型系统，支持复杂数据结构的序列化和反序列化。
        </p>
        
        <button 
          onClick={() => toggleCode('customTypes')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showCode.customTypes ? '隐藏代码' : '查看自定义类型示例'}
        </button>
        
        {showCode.customTypes && (
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
            <pre style={{ margin: 0 }}>{`import { types } from "mobx-state-tree";

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
  website: URLType,
  tags: types.array(types.string)
});`}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>4. 🔄 Mixins (混入模式)</h3>
        <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
          混入模式通过 .extend() 方法实现功能模块化，可以将通用功能封装成可复用的模块。
        </p>
        
        <button 
          onClick={() => toggleCode('mixins')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showCode.mixins ? '隐藏代码' : '查看混入模式示例'}
        </button>
        
        {showCode.mixins && (
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            overflow: 'auto',
            marginBottom: '15px'
          }}>
            <pre style={{ margin: 0 }}>{`// 审计混入
const AuditMixin = (BaseModel) => BaseModel
  .volatile(() => ({
    auditLog: []
  }))
  .views((self) => ({
    get lastAuditEntry() {
      return self.auditLog[self.auditLog.length - 1];
    }
  }))
  .actions((self) => ({
    logAction(actionName, args, user = "system") {
      self.auditLog.push({
        action: actionName,
        args: args,
        user: user,
        timestamp: new Date()
      });
    }
  }));

// 缓存混入
const CacheMixin = (BaseModel) => BaseModel
  .volatile(() => ({
    cache: new Map()
  }))
  .actions((self) => ({
    setCache(key, value) {
      self.cache.set(key, value);
    },
    getCache(key) {
      return self.cache.get(key);
    }
  }));

// 应用混入
const EnhancedTask = Task
  .extend(AuditMixin)
  .extend(CacheMixin);

// 创建增强的任务实例
const task = EnhancedTask.create({
  id: "1",
  title: "Enhanced Task"
});

task.logAction("create", ["Enhanced Task"], "user123");
task.setCache("lastAccess", new Date());`}</pre>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlugins = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📦 内置插件详解</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {plugins.map(plugin => (
          <button
            key={plugin.id}
            onClick={() => setActivePlugin(plugin.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activePlugin === plugin.id ? '#007bff' : '#f8f9fa',
              color: activePlugin === plugin.id ? 'white' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activePlugin === plugin.id ? 'bold' : 'normal'
            }}
          >
            {plugin.icon} {plugin.title}
          </button>
        ))}
      </div>

      {activePlugin === 'logging' && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: '#495057', marginTop: 0 }}>📝 LoggingPlugin - 日志插件</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🎯 主要功能</h4>
            <ul style={{ lineHeight: '1.6' }}>
              <li>自动记录所有 Action 调用</li>
              <li>追踪执行时间和参数</li>
              <li>支持快照和补丁变化监听</li>
              <li>提供分组日志显示</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>⚙️ 配置选项</h4>
            <div style={{ 
              backgroundColor: '#2d3748', 
              color: '#e2e8f0', 
              padding: '15px', 
              borderRadius: '6px', 
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '13px'
            }}>
              <pre style={{ margin: 0 }}>{`pluginManager.use(LoggingPlugin, {
  enableActionLog: true,      // 启用 Action 日志
  enableSnapshotLog: false,   // 启用快照日志
  enablePatchLog: false,      // 启用补丁日志
  logLevel: 'info'           // 日志级别
});`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🚀 实际演示</h4>
            <button
              onClick={() => {
                taskStore.addTask('日志测试任务', '测试日志插件功能');
                console.log('✅ 请查看浏览器控制台，观察日志输出');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              🧪 测试日志功能
            </button>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              点击按钮后查看浏览器控制台的日志输出
            </span>
          </div>
        </div>
      )}

      {activePlugin === 'performance' && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: '#495057', marginTop: 0 }}>📊 PerformancePlugin - 性能监控插件</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🎯 主要功能</h4>
            <ul style={{ lineHeight: '1.6' }}>
              <li>监控每个 Action 的执行时间</li>
              <li>统计调用次数和性能指标</li>
              <li>提供性能警告和报告</li>
              <li>支持性能阈值设置</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>⚙️ 配置选项</h4>
            <div style={{ 
              backgroundColor: '#2d3748', 
              color: '#e2e8f0', 
              padding: '15px', 
              borderRadius: '6px', 
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '13px'
            }}>
              <pre style={{ margin: 0 }}>{`pluginManager.use(PerformancePlugin, {
  threshold: 100,        // 性能警告阈值 (ms)
  enableWarnings: true   // 启用性能警告
});

// 获取性能报告
const plugin = pluginManager.getPlugin('PerformancePlugin');
const report = plugin.getPerformanceReport();`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🚀 实际演示</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                onClick={() => {
                  // 执行一些操作来生成性能数据
                  for (let i = 0; i < 3; i++) {
                    taskStore.addTask(`性能测试任务 ${i + 1}`, '测试性能监控');
                  }
                  taskStore.setFilter('active');
                  taskStore.setFilter('all');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🧪 生成性能数据
              </button>
              
              <button
                onClick={() => {
                  const report = taskStore.getPerformanceReport();
                  console.log('📊 性能报告:', report);
                  alert('性能报告已输出到控制台，请查看！');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📊 查看性能报告
              </button>
            </div>
          </div>
        </div>
      )}

      {activePlugin === 'persistence' && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: '#495057', marginTop: 0 }}>💾 PersistencePlugin - 持久化插件</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🎯 主要功能</h4>
            <ul style={{ lineHeight: '1.6' }}>
              <li>自动保存状态到本地存储</li>
              <li>支持防抖优化，避免频繁写入</li>
              <li>提供黑名单/白名单过滤</li>
              <li>支持自定义序列化方式</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>⚙️ 配置选项</h4>
            <div style={{ 
              backgroundColor: '#2d3748', 
              color: '#e2e8f0', 
              padding: '15px', 
              borderRadius: '6px', 
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '13px'
            }}>
              <pre style={{ margin: 0 }}>{`pluginManager.use(PersistencePlugin, {
  key: 'my-app-store',           // 存储键名
  storage: localStorage,          // 存储方式
  debounceTime: 1000,            // 防抖时间
  blacklist: ['isLoading', 'error'], // 黑名单字段
  serialize: JSON.stringify,      // 序列化函数
  deserialize: JSON.parse        // 反序列化函数
});`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🚀 实际演示</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                onClick={() => {
                  taskStore.addTask('持久化测试', '这个任务会自动保存到 localStorage');
                  setTimeout(() => {
                    alert('任务已保存！刷新页面后数据仍然存在。');
                  }, 1100); // 等待防抖时间
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                💾 测试自动保存
              </button>
              
              <button
                onClick={() => {
                  taskStore.clearPersistedData();
                  alert('持久化数据已清除！');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ 清除持久化数据
              </button>
            </div>
          </div>
        </div>
      )}

      {activePlugin === 'validation' && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: '#495057', marginTop: 0 }}>✅ ValidationPlugin - 验证插件</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🎯 主要功能</h4>
            <ul style={{ lineHeight: '1.6' }}>
              <li>实时验证 Action 参数</li>
              <li>支持自定义验证规则</li>
              <li>提供验证错误收集</li>
              <li>支持条件验证</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>⚙️ 配置选项</h4>
            <div style={{ 
              backgroundColor: '#2d3748', 
              color: '#e2e8f0', 
              padding: '15px', 
              borderRadius: '6px', 
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '13px'
            }}>
              <pre style={{ margin: 0 }}>{`pluginManager.use(ValidationPlugin, {
  enableRealTimeValidation: true,
  customValidators: {
    addTask: (args, context) => {
      const [title] = args;
      if (!title || title.trim().length === 0) {
        return {
          valid: false,
          message: "任务标题不能为空"
        };
      }
      return { valid: true };
    }
  }
});`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#6c757d' }}>🚀 实际演示</h4>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
              验证插件会在执行 Action 前进行参数验证，如果验证失败会阻止 Action 执行并显示错误信息。
            </p>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px', 
              border: '1px solid #ffeaa7',
              fontSize: '14px',
              color: '#856404'
            }}>
              💡 <strong>提示:</strong> 验证插件需要在开发环境中配置自定义验证规则才能看到效果。
              当前演示环境中的验证逻辑已集成在 TaskStore 的 Action 中。
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>💡 使用方法示例</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🚀 快速开始</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`// 1. 导入插件系统
import { installPlugins, PluginManager } from './plugins/mstPlugins';

// 2. 创建 Store
const store = TaskStore.create({
  tasks: []
});

// 3. 方式一：使用预设配置
const pluginManager = installPlugins(store, 'development');
// 自动安装：LoggingPlugin + PerformancePlugin + PersistencePlugin

// 4. 方式二：手动安装插件
const pluginManager = new PluginManager(store);
pluginManager.use(LoggingPlugin, { enableActionLog: true });
pluginManager.use(PerformancePlugin, { threshold: 50 });

// 5. 获取插件实例
const performancePlugin = pluginManager.getPlugin('PerformancePlugin');
const report = performancePlugin.getPerformanceReport();

console.log('已安装插件:', pluginManager.listPlugins());`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🔧 在 Store 中集成</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`const TaskStore = types
  .model("TaskStore", {
    tasks: types.array(Task)
  })
  .volatile(() => ({
    pluginManager: null
  }))
  .actions((self) => ({
    // 生命周期钩子：初始化插件
    afterCreate() {
      self.pluginManager = installPlugins(self, 'development');
      console.log('🔌 插件系统已初始化');
    },
    
    // 生命周期钩子：清理插件
    beforeDestroy() {
      if (self.pluginManager) {
        self.pluginManager.dispose();
      }
    },
    
    // 插件管理方法
    getPerformanceReport() {
      const plugin = self.pluginManager?.getPlugin('PerformancePlugin');
      return plugin?.getPerformanceReport() || {};
    },
    
    clearPersistedData() {
      const plugin = self.pluginManager?.getPlugin('PersistencePlugin');
      plugin?.clearPersistedData();
    }
  }));`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🎯 环境配置</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`// 开发环境配置
if (process.env.NODE_ENV === 'development') {
  const pluginManager = installPlugins(store, 'development');
  
  // 开发工具集成
  window.__MST_STORE__ = store;
  window.__MST_PLUGIN_MANAGER__ = pluginManager;
  
  // 热重载支持
  if (module.hot) {
    module.hot.dispose(() => {
      pluginManager.dispose();
    });
  }
}

// 生产环境配置
if (process.env.NODE_ENV === 'production') {
  const pluginManager = installPlugins(store, 'production');
  
  // 性能监控
  setInterval(() => {
    const performancePlugin = pluginManager.getPlugin('PerformancePlugin');
    const report = performancePlugin.getPerformanceReport();
    
    // 上报监控数据
    analytics.track('mst_performance', report);
    performancePlugin.clearPerformanceData();
  }, 60000);
}`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>📱 在 React 组件中使用</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`import React, { useState } from 'react';
import { observer } from 'mobx-react';
import taskStore from './store/TaskStore';

const PerformanceMonitor = observer(() => {
  const [report, setReport] = useState(null);
  
  const handleGetReport = () => {
    const performanceReport = taskStore.getPerformanceReport();
    setReport(performanceReport);
  };
  
  const handleClearData = () => {
    taskStore.clearPerformanceData();
    setReport(null);
  };
  
  return (
    <div>
      <h3>性能监控</h3>
      
      <button onClick={handleGetReport}>
        获取性能报告
      </button>
      
      <button onClick={handleClearData}>
        清除性能数据
      </button>
      
      {report && (
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>调用次数</th>
              <th>平均耗时</th>
              <th>最大耗时</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report).map(([action, data]) => (
              <tr key={action}>
                <td>{action}</td>
                <td>{data.count}</td>
                <td>{data.avgTime.toFixed(2)}ms</td>
                <td>{data.maxTime.toFixed(2)}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});`}</pre>
        </div>
      </div>
    </div>
  );

  const renderCustom = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔨 自定义插件开发</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>📋 插件接口规范</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`// 插件接口定义
interface Plugin {
  name: string;                    // 插件名称（唯一标识）
  install(store: any, options?: any): PluginInstance;
}

interface PluginInstance {
  dispose?(): void;               // 清理函数（可选）
  [key: string]: any;            // 插件特定的方法和属性
}

// 基本插件结构
export const MyPlugin = {
  name: 'MyPlugin',
  install(store, options = {}) {
    // 插件初始化逻辑
    
    // 返回插件实例
    return {
      dispose() {
        // 清理逻辑
      },
      
      // 插件特定方法
      customMethod() {
        // 实现
      }
    };
  }
};`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🎯 实际开发示例</h3>
        
        <h4 style={{ color: '#6c757d' }}>1. 审计插件</h4>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          <pre style={{ margin: 0 }}>{`export const AuditPlugin = {
  name: 'AuditPlugin',
  install(store, options = {}) {
    const { userId, apiEndpoint, batchSize = 10 } = options;
    const auditLog = [];
    
    // 中间件：记录所有 Action
    const auditMiddleware = (call, next) => {
      const auditEntry = {
        action: call.name,
        args: call.args,
        userId: userId,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        path: call.context.path
      };
      
      auditLog.push(auditEntry);
      
      // 批量上报
      if (auditLog.length >= batchSize) {
        sendAuditLogs(apiEndpoint, auditLog.splice(0, batchSize));
      }
      
      return next(call);
    };
    
    addMiddleware(store, auditMiddleware);
    
    return {
      dispose() {
        // 发送剩余日志
        if (auditLog.length > 0) {
          sendAuditLogs(apiEndpoint, auditLog);
        }
      },
      
      getAuditLog() {
        return [...auditLog];
      },
      
      forceSync() {
        if (auditLog.length > 0) {
          sendAuditLogs(apiEndpoint, auditLog.splice(0));
        }
      }
    };
  }
};

// 使用审计插件
pluginManager.use(AuditPlugin, {
  userId: getCurrentUserId(),
  apiEndpoint: '/api/audit',
  batchSize: 5
});`}</pre>
        </div>

        <h4 style={{ color: '#6c757d' }}>2. 缓存插件</h4>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          <pre style={{ margin: 0 }}>{`export const CachePlugin = {
  name: 'CachePlugin',
  install(store, options = {}) {
    const { ttl = 300000, maxSize = 100 } = options; // 5分钟TTL，最大100条
    const cache = new Map();
    const cacheStats = { hits: 0, misses: 0 };
    
    // 缓存清理定时器
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          cache.delete(key);
        }
      }
    }, 60000); // 每分钟清理一次
    
    return {
      dispose() {
        clearInterval(cleanupInterval);
        cache.clear();
      },
      
      set(key, value, customTtl = ttl) {
        // 检查缓存大小
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        
        cache.set(key, {
          value,
          timestamp: Date.now(),
          ttl: customTtl
        });
      },
      
      get(key) {
        const entry = cache.get(key);
        if (!entry) {
          cacheStats.misses++;
          return undefined;
        }
        
        // 检查过期
        if (Date.now() - entry.timestamp > entry.ttl) {
          cache.delete(key);
          cacheStats.misses++;
          return undefined;
        }
        
        cacheStats.hits++;
        return entry.value;
      },
      
      getStats() {
        const total = cacheStats.hits + cacheStats.misses;
        return {
          ...cacheStats,
          hitRate: total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : 0,
          size: cache.size
        };
      },
      
      clear() {
        cache.clear();
        cacheStats.hits = 0;
        cacheStats.misses = 0;
      }
    };
  }
};`}</pre>
        </div>

        <h4 style={{ color: '#6c757d' }}>3. 权限控制插件</h4>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          <pre style={{ margin: 0 }}>{`export const PermissionPlugin = {
  name: 'PermissionPlugin',
  install(store, options = {}) {
    const { getUserPermissions, onPermissionDenied } = options;
    
    const permissionMiddleware = (call, next) => {
      const userPermissions = getUserPermissions();
      const requiredPermission = getRequiredPermission(call.name);
      
      if (requiredPermission && !userPermissions.includes(requiredPermission)) {
        const error = new Error(\`Permission denied for action: \${call.name}\`);
        
        if (onPermissionDenied) {
          onPermissionDenied(error, call);
        }
        
        throw error;
      }
      
      return next(call);
    };
    
    addMiddleware(store, permissionMiddleware);
    
    // 权限映射表
    const permissionMap = new Map([
      ['addTask', 'task:create'],
      ['removeTask', 'task:delete'],
      ['updateTask', 'task:update']
    ]);
    
    function getRequiredPermission(actionName) {
      return permissionMap.get(actionName);
    }
    
    return {
      dispose() {
        // 清理逻辑
      },
      
      addPermissionRule(actionName, permission) {
        permissionMap.set(actionName, permission);
      },
      
      removePermissionRule(actionName) {
        permissionMap.delete(actionName);
      },
      
      getPermissionRules() {
        return Object.fromEntries(permissionMap);
      }
    };
  }
};

// 使用权限插件
pluginManager.use(PermissionPlugin, {
  getUserPermissions: () => getCurrentUser().permissions,
  onPermissionDenied: (error, call) => {
    showNotification(\`权限不足: \${error.message}\`, 'error');
  }
});`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🔧 插件开发最佳实践</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
            <h4 style={{ color: '#155724', marginTop: 0 }}>✅ 推荐做法</h4>
            <ul style={{ color: '#155724', fontSize: '14px', paddingLeft: '20px' }}>
              <li>提供清晰的配置选项</li>
              <li>实现 dispose 方法清理资源</li>
              <li>使用 TypeScript 提供类型支持</li>
              <li>添加详细的错误处理</li>
              <li>提供使用文档和示例</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
            <h4 style={{ color: '#721c24', marginTop: 0 }}>❌ 避免做法</h4>
            <ul style={{ color: '#721c24', fontSize: '14px', paddingLeft: '20px' }}>
              <li>在中间件中执行重计算</li>
              <li>忘记清理定时器和监听器</li>
              <li>修改传入的 call 对象</li>
              <li>在插件间创建强依赖</li>
              <li>忽略错误处理和边界情况</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBestPractices = () => (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎯 最佳实践</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>⚡ 性能优化</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#6c757d' }}>1. 条件执行</h4>
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            marginBottom: '10px'
          }}>
            <pre style={{ margin: 0 }}>{`// ✅ 好的做法：条件执行
const middleware = (call, next) => {
  // 快速检查，避免不必要的处理
  if (!shouldProcess(call.name)) {
    return next(call);
  }
  
  // 执行处理逻辑
  const result = next(call);
  
  // 异步处理重任务
  setTimeout(() => {
    heavyProcessing(call);
  }, 0);
  
  return result;
};

// ❌ 避免的做法：每次都处理
const badMiddleware = (call, next) => {
  // 同步重任务
  const heavyResult = expensiveComputation(call);
  
  // 每次都记录
  logEverything(call);
  
  return next(call);
};`}</pre>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#6c757d' }}>2. 内存管理</h4>
          <div style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '13px',
            marginBottom: '10px'
          }}>
            <pre style={{ margin: 0 }}>{`// ✅ 限制缓存大小
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

// ✅ 定期清理过期数据
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  }
}, 60000);

// ✅ 及时清理监听器
const disposers = [];
disposers.push(onSnapshot(store, handler));
disposers.push(onPatch(store, handler));

// 在 dispose 中清理
return {
  dispose() {
    disposers.forEach(dispose => dispose());
  }
};`}</pre>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🔒 错误处理</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`// ✅ 完善的错误处理
const robustMiddleware = (call, next) => {
  try {
    // 前置处理
    const preprocessResult = preprocess(call);
    if (!preprocessResult.success) {
      console.warn(\`Preprocessing failed for \${call.name}:\`, preprocessResult.error);
      // 决定是否继续执行
      if (preprocessResult.critical) {
        throw new Error(preprocessResult.error);
      }
    }
    
    // 执行 Action
    const result = next(call);
    
    // 后置处理
    try {
      postprocess(call, result);
    } catch (postError) {
      console.error(\`Postprocessing failed for \${call.name}:\`, postError);
      // 后置处理失败不影响主流程
    }
    
    return result;
    
  } catch (error) {
    // 记录错误
    console.error(\`Middleware error in \${call.name}:\`, error);
    
    // 错误上报
    if (typeof reportError === 'function') {
      reportError(error, { action: call.name, args: call.args });
    }
    
    // 重新抛出错误
    throw error;
  }
};`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>🧪 测试策略</h3>
        <div style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          marginBottom: '15px'
        }}>
          <pre style={{ margin: 0 }}>{`// 插件单元测试示例
describe('LoggingPlugin', () => {
  let store, pluginManager, consoleSpy;
  
  beforeEach(() => {
    store = TestStore.create({});
    pluginManager = new PluginManager(store);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    pluginManager.dispose();
    consoleSpy.mockRestore();
  });
  
  it('should log actions when enabled', () => {
    // 安装插件
    pluginManager.use(LoggingPlugin, {
      enableActionLog: true
    });
    
    // 执行 Action
    store.testAction('param1', 'param2');
    
    // 验证日志输出
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Action: testAction')
    );
  });
  
  it('should not log when disabled', () => {
    pluginManager.use(LoggingPlugin, {
      enableActionLog: false
    });
    
    store.testAction();
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });
  
  it('should handle errors gracefully', () => {
    pluginManager.use(LoggingPlugin);
    
    // 模拟错误
    expect(() => {
      store.errorAction();
    }).toThrow();
    
    // 验证错误被正确处理
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error:')
    );
  });
});`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#34495e' }}>📚 文档和维护</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '6px', border: '1px solid #007bff' }}>
            <h4 style={{ color: '#007bff', marginTop: 0 }}>📖 文档要求</h4>
            <ul style={{ color: '#0056b3', fontSize: '14px', paddingLeft: '20px' }}>
              <li>清晰的 API 文档</li>
              <li>配置选项说明</li>
              <li>使用示例和最佳实践</li>
              <li>常见问题解答</li>
              <li>版本更新日志</li>
            </ul>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
            <h4 style={{ color: '#856404', marginTop: 0 }}>🔧 维护建议</h4>
            <ul style={{ color: '#856404', fontSize: '14px', paddingLeft: '20px' }}>
              <li>定期更新依赖</li>
              <li>监控性能指标</li>
              <li>收集用户反馈</li>
              <li>持续集成测试</li>
              <li>向后兼容性考虑</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'mechanism': return renderMechanism();
      case 'plugins': return renderPlugins();
      case 'usage': return renderUsage();
      case 'custom': return renderCustom();
      case 'best-practices': return renderBestPractices();
      default: return renderOverview();
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0',
      border: '1px solid #dee2e6'
    }}>
      <h2 style={{ 
        color: '#2c3e50', 
        marginTop: 0,
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '28px'
      }}>
        🔌 MST 插件系统完整教程
      </h2>

      {/* 导航菜单 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '12px 20px',
              backgroundColor: activeSection === section.id ? '#007bff' : 'white',
              color: activeSection === section.id ? 'white' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== section.id) {
                e.target.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.id) {
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            {section.icon} {section.title}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        minHeight: '600px'
      }}>
        {renderContent()}
      </div>

      {/* 底部提示 */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        border: '1px solid #007bff',
        textAlign: 'center'
      }}>
        <div style={{ color: '#007bff', fontSize: '14px' }}>
          💡 <strong>提示:</strong> 这是一个完整的 MST 插件系统教程，涵盖了从基础概念到高级应用的所有内容。
          建议按顺序学习各个章节，并结合实际项目进行练习。
        </div>
      </div>
    </div>
  );
});

export default PluginTutorial;