/**
 * MST 插件系统综合展示组件
 * 
 * 这个组件展示了完整的MST插件系统功能，包括：
 * 1. 插件系统概览和架构说明
 * 2. 各个插件的实际功能演示
 * 3. 插件配置和自定义选项
 * 4. 性能监控和日志查看
 * 5. 插件开发指南和最佳实践
 */

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import taskStore from '../models/TaskStore.js';

const PluginShowcase = observer(() => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pluginStats, setPluginStats] = useState({});
  const [performanceData, setPerformanceData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // 标签页配置
  const tabs = [
    { id: 'overview', title: '🔌 系统概览', icon: '📊' },
    { id: 'persistence', title: '💾 持久化', icon: '🔄' },
    { id: 'performance', title: '📈 性能监控', icon: '⚡' },
    { id: 'logger', title: '📝 日志系统', icon: '📋' },
    { id: 'validation', title: '✅数据验证', icon: '🛡️' },
    { id: 'development', title: '🛠️ 开发指南', icon: '💡' }
  ];

  useEffect(() => {
    updatePluginStats();
    const interval = setInterval(updatePluginStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const updatePluginStats = () => {
    if (taskStore.pluginManager) {
      const stats = {};
      const pluginNames = taskStore.pluginManager.listPlugins();
      
      pluginNames.forEach(name => {
        const plugin = taskStore.pluginManager.getPlugin(name);
        stats[name] = {
          enabled: plugin?.options?.enabled !== false,
          version: plugin?.version || 'unknown',
          status: plugin?.options?.enabled !== false ? 'active' : 'inactive'
        };
      });
      
      setPluginStats(stats);
    }
  };

  const handleGetPerformanceReport = () => {
    const report = taskStore.getPerformanceReport();
    setPerformanceData(report);
  };

  const handleGetLogs = () => {
    const loggerPlugin = taskStore.pluginManager?.getPlugin('LoggerPlugin');
    if (loggerPlugin) {
      const recentLogs = loggerPlugin.getLogs().slice(-50);
      setLogs(recentLogs);
    }
  };

  const handleValidateData = async () => {
    const validationPlugin = taskStore.pluginManager?.getPlugin('ValidationPlugin');
    if (validationPlugin) {
      try {
        await validationPlugin.validateModel();
        const errors = validationPlugin.getValidationErrors();
        setValidationErrors(errors);
      } catch (error) {
        console.error('Validation error:', error);
      }
    }
  };

  const renderOverview = () => (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '28px' }}>🔌 MST 插件系统</h2>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          强大、灵活、可扩展的 MobX-State-Tree 插件架构
        </p>
      </div>

      {/* 插件状态卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(pluginStats).map(([name, stats]) => (
          <div key={name} style={{
            background: stats.enabled ? 
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
              'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: stats.enabled ? 'white' : '#8b4513',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>
                {name === 'PersistencePlugin' ? '💾' :
                 name === 'PerformancePlugin' ? '📊' :
                 name === 'LoggerPlugin' ? '📝' :
                 name === 'ValidationPlugin' ? '✅' : '🔌'}
              </span>
              <h4 style={{ margin: 0, fontSize: '16px' }}>{name}</h4>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              <div>状态: {stats.enabled ? '🟢 运行中' : '🔴 已停用'}</div>
              <div>版本: v{stats.version}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 系统架构图 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ color: '#495057', marginTop: 0 }}>🏗️ 系统架构</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          {/* MST Model Layer */}
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '300px',
            textAlign: 'center'
          }}>
            MST Model (TaskStore)
          </div>
          
          <div style={{ fontSize: '24px', color: '#6c757d' }}>↕️</div>
          
          {/* Plugin Manager Layer */}
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '300px',
            textAlign: 'center'
          }}>
            Plugin Manager
          </div>
          
          <div style={{ fontSize: '24px', color: '#6c757d' }}>↕️</div>
          
          {/* Plugins Layer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            width: '100%',
            maxWidth: '600px'
          }}>
            {['PersistencePlugin', 'PerformancePlugin', 'LoggerPlugin', 'ValidationPlugin'].map(plugin => (
              <div key={plugin} style={{
                backgroundColor: '#6f42c1',
                color: 'white',
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {plugin}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersistence = () => (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>💾 持久化插件演示</h3>
      
      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ color: '#007bff', marginTop: 0 }}>🎯 功能说明</h4>
        <p style={{ margin: 0, lineHeight: '1.6' }}>
          持久化插件自动将MST状态保存到localStorage，页面刷新后会自动恢复数据。
          支持字段过滤、节流保存、数据压缩等高级功能。
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            taskStore.addTask(`测试任务 ${Date.now()}`, '这是一个测试任务');
            alert('✅ 任务已添加并自动保存到localStorage');
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ➕ 添加测试任务
        </button>
        
        <button
          onClick={() => {
            taskStore.clearPersistedData();
            alert('🗑️ 持久化数据已清除，刷新页面查看效果');
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ 清除持久化数据
        </button>
        
        <button
          onClick={() => {
            window.location.reload();
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 刷新页面测试恢复
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ color: '#495057', marginTop: 0 }}>📊 当前状态</h5>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          <div>任务总数: {taskStore.tasks.length}</div>
          <div>已完成: {taskStore.stats.completed}</div>
          <div>进行中: {taskStore.stats.active}</div>
          <div>完成率: {taskStore.stats.completionRate}%</div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>📈 性能监控插件演示</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={handleGetPerformanceReport}
          style={{
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📊 获取性能报告
        </button>
        
        <button
          onClick={() => {
            taskStore.clearPerformanceData();
            setPerformanceData(null);
            alert('性能数据已清除');
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🗑️ 清除性能数据
        </button>
      </div>

      {performanceData && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ color: '#495057', marginTop: 0 }}>📊 性能报告</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#007bff' }}>总体统计</h5>
              <div style={{ fontSize: '14px' }}>
                <div>总操作数: {performanceData.summary?.totalActions || 0}</div>
                <div>平均时间: {(performanceData.summary?.averageActionTime || 0).toFixed(2)}ms</div>
                <div>慢操作: {performanceData.summary?.slowActionsCount || 0}</div>
              </div>
            </div>
            
            {performanceData.memory && (
              <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#28a745' }}>内存使用</h5>
                <div style={{ fontSize: '14px' }}>
                  <div>当前: {performanceData.memory.currentMB}MB</div>
                  <div>峰值: {performanceData.memory.peakMB}MB</div>
                  <div>平均: {performanceData.memory.averageMB}MB</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderLogger = () => (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>📝 日志系统演示</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={handleGetLogs}
          style={{
            padding: '12px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📋 查看最近日志
        </button>
        
        <button
          onClick={() => {
            const loggerPlugin = taskStore.pluginManager?.getPlugin('LoggerPlugin');
            if (loggerPlugin) {
              const jsonData = loggerPlugin.exportLogs('json');
              const blob = new Blob([jsonData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mst-logs.json';
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📤 导出日志 (JSON)
        </button>
      </div>

      {logs.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h4 style={{ color: '#495057', marginTop: 0 }}>📋 最近日志 (最新50条)</h4>
          {logs.map((log, index) => (
            <div key={log.id || index} style={{
              padding: '8px 12px',
              marginBottom: '5px',
              backgroundColor: log.level === 'error' ? '#f8d7da' : 
                             log.type === 'action' ? '#d1ecf1' : 'white',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'Monaco, Consolas, monospace'
            }}>
              <span style={{ color: '#6c757d' }}>
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                [{log.type.toUpperCase()}]
              </span>
              <span style={{ marginLeft: '8px' }}>
                {log.type === 'action' ? 
                  `${log.data.name}(${JSON.stringify(log.data.args || [])})` :
                  JSON.stringify(log.data)
                }
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderValidation = () => (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>✅ 数据验证插件演示</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={handleValidateData}
          style={{
            padding: '12px 20px',
            backgroundColor: '#e83e8c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔍 验证所有数据
        </button>
        
        <button
          onClick={() => {
            try {
              taskStore.addTask('', '无效任务 - 标题为空');
            } catch (error) {
              alert('验证失败: ' + error.message);
            }
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ❌ 测试验证失败
        </button>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <div style={{
          backgroundColor: '#f8d7da',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#721c24', marginTop: 0 }}>❌ 验证错误</h4>
          {Object.entries(validationErrors).map(([field, errors]) => (
            <div key={field} style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#721c24' }}>{field}:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {errors.map((error, index) => (
                  <li key={index} style={{ color: '#721c24' }}>{error}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDevelopment = () => (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>🛠️ 插件开发指南</h3>
      
      <div style={{
        backgroundColor: '#e7f3ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ color: '#007bff', marginTop: 0 }}>📚 开发步骤</h4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>继承 BasePlugin 类</li>
          <li>实现生命周期方法 (onInstall, onUninstall 等)</li>
          <li>定义插件配置选项</li>
          <li>注册到 PluginManager</li>
          <li>测试和调试</li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '14px',
        overflow: 'auto'
      }}>
        <pre style={{ margin: 0 }}>{`// 自定义插件示例
import { BasePlugin } from './BasePlugin.js';
import { onAction } from 'mobx-state-tree';

export class MyCustomPlugin extends BasePlugin {
  constructor() {
    super('MyCustomPlugin', '1.0.0');
    this.actionCount = 0;
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      trackActions: true,
      maxActions: 1000
    };
  }

  onInstall() {
    if (this.options.trackActions) {
      this.actionDisposer = onAction(this.model, (action) => {
        this.actionCount++;
        this.log(\`Action executed: \${action.name}\`);
        
        if (this.actionCount > this.options.maxActions) {
          this.warn('Action limit exceeded');
        }
      });
      
      this.addDisposer(this.actionDisposer);
    }
    
    this.log('MyCustomPlugin installed successfully');
  }

  onUninstall() {
    this.log(\`Plugin uninstalled. Total actions: \${this.actionCount}\`);
  }

  // 公共API
  getActionCount() {
    return this.actionCount;
  }

  resetCounter() {
    this.actionCount = 0;
    this.log('Action counter reset');
  }
}

// 使用插件
const manager = new PluginManager(store);
manager.register(new MyCustomPlugin(), {
  trackActions: true,
  maxActions: 500
});`}</pre>
      </div>
    </div>
  );

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {/* 标签页导航 */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e9ecef',
        marginBottom: '30px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6c757d',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
            {tab.title}
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'persistence' && renderPersistence()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'logger' && renderLogger()}
        {activeTab === 'validation' && renderValidation()}
        {activeTab === 'development' && renderDevelopment()}
      </div>
    </div>
  );
});

export default PluginShowcase;