import React, { useState } from 'react';
import { observer } from 'mobx-react';
import taskStore from '../models/TaskStore';

const PluginDemo = observer(() => {
  const [performanceReport, setPerformanceReport] = useState(null);
  const [showPluginCode, setShowPluginCode] = useState(false);

  const handleGetPerformanceReport = () => {
    const report = taskStore.getPerformanceReport();
    setPerformanceReport(report);
  };

  const pluginCodeExample = `// MST 插件系统示例

// 1. 日志插件 - 自动记录所有 Action 调用
export const LoggingPlugin = {
  name: 'LoggingPlugin',
  install(store, options = {}) {
    const loggingMiddleware = (call, next) => {
      console.group(\`🎬 Action: \${call.name}\`);
      console.log('📥 Args:', call.args);
      
      const start = performance.now();
      const result = next(call);
      const duration = performance.now() - start;
      
      console.log(\`✅ Completed in \${duration.toFixed(2)}ms\`);
      console.groupEnd();
      return result;
    };
    
    addMiddleware(store, loggingMiddleware);
    return { dispose: () => {} };
  }
};

// 2. 性能监控插件 - 追踪 Action 执行时间
export const PerformancePlugin = {
  name: 'PerformancePlugin',
  install(store, options = {}) {
    const performanceData = new Map();
    
    const performanceMiddleware = (call, next) => {
      const start = performance.now();
      const result = next(call);
      const duration = performance.now() - start;
      
      // 记录性能数据
      const actionName = call.name;
      if (!performanceData.has(actionName)) {
        performanceData.set(actionName, {
          count: 0, totalTime: 0, maxTime: 0, minTime: Infinity
        });
      }
      
      const data = performanceData.get(actionName);
      data.count++;
      data.totalTime += duration;
      data.maxTime = Math.max(data.maxTime, duration);
      data.minTime = Math.min(data.minTime, duration);
      
      return result;
    };
    
    addMiddleware(store, performanceMiddleware);
    
    return {
      getPerformanceReport() {
        const report = {};
        performanceData.forEach((data, actionName) => {
          report[actionName] = {
            ...data,
            avgTime: data.totalTime / data.count
          };
        });
        return report;
      }
    };
  }
};

// 3. 持久化插件 - 自动保存状态到 localStorage
export const PersistencePlugin = {
  name: 'PersistencePlugin',
  install(store, options = {}) {
    const { key = 'mst-store', debounceTime = 1000 } = options;
    let timeoutId = null;
    
    const saveData = (snapshot) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(snapshot));
      }, debounceTime);
    };
    
    const snapshotDisposer = onSnapshot(store, saveData);
    
    return {
      dispose: () => snapshotDisposer(),
      loadInitialData() {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      }
    };
  }
};`;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ 
        color: '#6f42c1', 
        marginTop: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🔌 MST 插件系统演示
        <button
          onClick={() => setShowPluginCode(!showPluginCode)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: showPluginCode ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showPluginCode ? '隐藏代码' : '查看代码'}
        </button>
      </h3>

      {/* 插件系统介绍 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '10px' }}>💡 MST 插件机制说明:</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '6px',
            border: '1px solid #007bff'
          }}>
            <strong>🎯 Middleware (中间件)</strong>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#0056b3' }}>
              拦截和处理 Actions，实现日志记录、性能监控、验证等功能
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '6px',
            border: '1px solid #28a745'
          }}>
            <strong>🔗 Hooks (钩子)</strong>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#155724' }}>
              监听快照、补丁、动作变化，实现持久化、同步等功能
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffc107'
          }}>
            <strong>🧩 Custom Types</strong>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#856404' }}>
              自定义数据类型，扩展 MST 的类型系统
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            border: '1px solid #dc3545'
          }}>
            <strong>🔄 Mixins (混入)</strong>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#721c24' }}>
              通过 .extend() 方法实现功能模块化和复用
            </div>
          </div>
        </div>
      </div>

      {/* 当前已安装的插件 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '10px' }}>🔌 当前已安装插件:</h4>
        <div style={{
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          {taskStore.pluginManager ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {taskStore.pluginManager.listPlugins().map(pluginName => (
                <span
                  key={pluginName}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {pluginName}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
              插件系统未初始化
            </span>
          )}
        </div>
      </div>

      {/* 插件功能演示 */}
      <div style={{
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '2px solid #6f42c1',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#6f42c1', marginTop: 0 }}>🎮 插件功能演示</h4>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {/* 性能报告 */}
          <button
            onClick={handleGetPerformanceReport}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 获取性能报告
          </button>

          {/* 清除性能数据 */}
          <button
            onClick={() => {
              taskStore.clearPerformanceData();
              setPerformanceReport(null);
              alert('性能数据已清除');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ 清除性能数据
          </button>

          {/* 清除持久化数据 */}
          <button
            onClick={() => {
              taskStore.clearPersistedData();
              alert('持久化数据已清除');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 清除持久化数据
          </button>

          {/* 触发一些 Actions 来生成性能数据 */}
          <button
            onClick={() => {
              // 触发多个 actions 来生成性能数据
              taskStore.addTask('插件测试任务 1', '测试性能监控插件');
              taskStore.addTask('插件测试任务 2', '测试日志插件');
              taskStore.setFilter('active');
              taskStore.setFilter('all');
              alert('已执行多个 Actions，可查看性能报告');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚀 执行测试 Actions
          </button>
        </div>

        {/* 性能报告显示 */}
        {performanceReport && (
          <div style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            marginTop: '15px'
          }}>
            <h5 style={{ color: '#495057', marginTop: 0 }}>📊 性能监控报告:</h5>
            {Object.keys(performanceReport).length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Action</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>调用次数</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>平均耗时</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>最大耗时</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>最小耗时</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #dee2e6' }}>总耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(performanceReport).map(([actionName, data]) => (
                      <tr key={actionName}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                          {actionName}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                          {data.count}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                          {data.avgTime.toFixed(2)}ms
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                          {data.maxTime.toFixed(2)}ms
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                          {data.minTime.toFixed(2)}ms
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                          {data.totalTime.toFixed(2)}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6c757d', fontStyle: 'italic', margin: 0 }}>
                暂无性能数据，请先执行一些 Actions
              </p>
            )}
          </div>
        )}
      </div>

      {/* 插件代码展示 */}
      {showPluginCode && (
        <div style={{
          backgroundColor: '#2d3748',
          color: '#e2e8f0',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          overflow: 'auto',
          maxHeight: '500px',
          border: '1px solid #4a5568'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {pluginCodeExample}
          </pre>
        </div>
      )}

      {/* 插件优势说明 */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ color: '#007bff', marginTop: 0 }}>✨ MST 插件系统优势</h4>
        <div style={{ fontSize: '14px', color: '#0056b3' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p><strong>🎯 非侵入式:</strong> 插件不会修改原有模型代码</p>
              <p><strong>🔧 可组合:</strong> 多个插件可以同时工作</p>
              <p><strong>⚡ 高性能:</strong> 基于中间件模式，开销极小</p>
            </div>
            <div>
              <p><strong>🔄 可复用:</strong> 插件可以在不同项目中使用</p>
              <p><strong>🛡️ 类型安全:</strong> 完全支持 TypeScript</p>
              <p><strong>🎮 易于测试:</strong> 插件可以独立测试</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PluginDemo;