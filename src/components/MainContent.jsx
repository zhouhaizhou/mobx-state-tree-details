import React from 'react';
import TaskList from './TaskList';
import TaskStats from './TaskStats';
import FlowDemo from './FlowDemo';
import PluginDemo from './PluginDemo';
import PluginShowcase from './PluginShowcase';
import DocumentViewer from './DocumentViewer';
import PluginTutorial from './PluginTutorial';

const MainContent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'core-concepts':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{ 
                color: '#007bff', 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📚 MST 核心概念解读及示例
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '30px' }}>
                深入了解 MobX-State-Tree 的核心概念、设计思想和基本用法，通过实际示例掌握状态管理的最佳实践。
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#495057', marginTop: 0 }}>🏗️ Models & Types</h4>
                  <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                    定义数据结构和类型系统，包括基础类型、复合类型和自定义类型的使用方法。
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#495057', marginTop: 0 }}>👁️ Views & Computed</h4>
                  <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                    派生数据和计算属性的实现，响应式数据变化和性能优化策略。
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#495057', marginTop: 0 }}>⚡ Actions & Flows</h4>
                  <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                    状态修改方法和异步操作处理，确保状态变更的一致性和可追踪性。
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#495057', marginTop: 0 }}>📸 Snapshots & Patches</h4>
                  <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                    状态快照和变更记录，实现时间旅行调试和状态持久化功能。
                  </p>
                </div>
              </div>
            </div>
            
            {/* 展示任务统计和任务列表作为实际示例 */}
            <TaskStats />
            <TaskList />
          </div>
        );
        
      case 'flow-demo':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{ 
                color: '#007bff', 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔄 Flow 模式异步处理案例
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                演示 MST Flow 模式在异步操作中的应用，包括错误处理、状态管理和最佳实践。
              </p>
            </div>
            <FlowDemo />
          </div>
        );
        
      case 'plugin-system':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{ 
                color: '#007bff', 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔌 MST 插件系统介绍及演示
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                完整的插件系统架构演示，包括插件管理、中间件、钩子函数和扩展机制。
              </p>
            </div>
            <PluginShowcase />
            <PluginDemo />
            <PluginTutorial />
          </div>
        );
        
      case 'document-library':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{ 
                color: '#007bff', 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📖 项目文档库
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                完整的项目文档、API 参考、开发指南和最佳实践集合。
              </p>
            </div>
            <DocumentViewer />
          </div>
        );
        
      default:
        return (
          <div style={{
            padding: '50px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <h3>欢迎使用 MST 插件系统演示</h3>
            <p>请从左侧导航选择要查看的内容</p>
          </div>
        );
    }
  };

  return (
    <div style={{
      flex: 1,
      padding: '0 20px',
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      {renderContent()}
    </div>
  );
};

export default MainContent;