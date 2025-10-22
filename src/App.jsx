import React, { useState } from 'react';
import { observer } from 'mobx-react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
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
  const [activeSection, setActiveSection] = useState('core-concepts');

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // 切换导航时清除选中的任务
    if (selectedTask) {
      setSelectedTaskId(null);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex'
    }}>
      {/* 左侧导航 */}
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* 主要内容区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        minHeight: '100vh',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* 头部 */}
        <header style={{
          padding: '20px 30px',
          borderBottom: '2px solid #007bff',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 style={{ 
            margin: 0,
            color: '#007bff',
            fontSize: '24px'
          }}>
            🔌 MST 插件系统演示项目
          </h1>
          <p style={{
            margin: '10px 0 0 0',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            完整展示 MobX-State-Tree 插件系统架构、核心机制和实际应用案例
          </p>
        </header>
        
        {/* 内容区域 */}
        <div style={{ 
          display: 'flex',
          flex: 1,
          minHeight: 0
        }}>
          {/* 主内容 */}
          <MainContent activeSection={activeSection} />
          
          {/* 右侧任务详情面板 */}
          {selectedTask && (
            <div style={{ 
              width: '320px',
              borderLeft: '1px solid #dee2e6',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              overflow: 'auto'
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