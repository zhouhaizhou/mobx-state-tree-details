import React from 'react';
import { observer } from 'mobx-react';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import FlowDemo from './components/FlowDemo';
import PluginDemo from './components/PluginDemo';
import PluginShowcase from './components/PluginShowcase';
import DocumentViewer from './components/DocumentViewer';
import PluginTutorial from './components/PluginTutorial';
import taskStore from './models/TaskStore';

const App = observer(() => {
  const { selectedTask, setSelectedTaskId } = taskStore;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: 'white',
        minHeight: '100vh',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <header style={{
          padding: '20px',
          borderBottom: '2px solid #007bff',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 style={{ 
            margin: 0,
            color: '#007bff',
            textAlign: 'center'
          }}>
            🔌 MST 插件系统演示项目
          </h1>
          <p style={{
            textAlign: 'center',
            margin: '10px 0 0 0',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            完整展示 MobX-State-Tree 插件系统架构、核心机制和实际应用案例
          </p>
        </header>
        
        <div style={{ 
          display: 'flex',
          minHeight: 'calc(100vh - 120px)'
        }}>
          <div style={{ 
            flex: 1,
            minWidth: 0
          }}>
            <TaskStats />
            
            {/* 🔹 新增：文档查看器 */}
            <DocumentViewer />
            
            {/* 🔌 MST 插件系统综合展示 */}
            <PluginShowcase />
            
            {/* 🔹 插件系统演示组件 */}
            <PluginDemo />
            
            {/* 🔹 新增：Flow 模式演示组件 */}
            <FlowDemo />
            
            <TaskList />
          </div>
          
          {/* 侧边栏 - 显示选中任务详情 */}
          {selectedTask && (
            <div style={{ 
              width: '320px',
              borderLeft: '1px solid #dee2e6',
              padding: '20px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0 }}>任务详情</h3>
                <button 
                  onClick={() => setSelectedTaskId(null)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  关闭
                </button>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ 
                  margin: '0 0 10px 0',
                  color: selectedTask.completed ? '#888' : '#333'
                }}>
                  {selectedTask.title}
                </h4>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                  {selectedTask.description}
                </p>
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>状态:</strong> {selectedTask.status}
                </p>
                
                {/* 🔹 新增：同步状态显示 */}
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>同步状态:</strong> {selectedTask.syncStatusText}
                </p>
                {selectedTask.lastSyncAt && (
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6c757d' }}>
                    <strong>上次同步:</strong> {selectedTask.lastSyncAt.toLocaleString()}
                  </p>
                )}
                
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>创建时间:</strong> {selectedTask.createdAt.toLocaleString()}
                </p>
                <p style={{ margin: '0 0 15px 0' }}>
                  <strong>已存在:</strong> {selectedTask.daysSinceCreated} 天
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      const newTitle = prompt("输入新标题:", selectedTask.title);
                      if (newTitle !== null) {
                        try {
                          selectedTask.updateTitle(newTitle);
                        } catch (error) {
                          alert(error.message);
                        }
                      }
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    编辑标题
                  </button>
                  
                  {/* 🔹 新增：重置同步状态按钮 */}
                  {selectedTask.syncStatus !== 'pending' && (
                    <button 
                      onClick={() => {
                        selectedTask.setSyncStatus('pending');
                      }}
                      style={{
                        padding: '8px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      重置为待同步
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default App;