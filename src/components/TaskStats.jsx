import React from 'react';
import { observer } from 'mobx-react';
import { getSnapshot } from "mobx-state-tree";
import taskStore from '../models/TaskStore';

const TaskStats = observer(() => {
  const { 
    stats, 
    filter, 
    setFilter, 
    isLoading, 
    error, 
    hasError, 
    syncProgress,
    syncStats,
    pendingSyncTasks,
    syncErrors,
    lastFullSyncAt
  } = taskStore;

  const handleGetSnapshot = () => {
    const snapshot = getSnapshot(taskStore);
    console.log("当前快照:", snapshot);
    alert("快照已打印到控制台");
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6'
    }}>
      <h2 style={{ marginTop: 0 }}>任务统计与同步管理</h2>
      
      {/* 错误提示 */}
      {hasError && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px'
        }}>
          ⚠️ {error}
          <button 
            onClick={() => taskStore.clearError()}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              backgroundColor: 'transparent',
              border: '1px solid #721c24',
              borderRadius: '3px',
              color: '#721c24',
              cursor: 'pointer'
            }}
          >
            清除
          </button>
        </div>
      )}

      {/* 🔹 新增：同步进度显示 */}
      {syncProgress.isActive && (
        <div style={{
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '5px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ color: '#0c5460' }}>🔄 {syncProgress.currentStep}</strong>
            <span style={{ color: '#0c5460', fontSize: '14px' }}>
              {syncProgress.progress}% ({syncProgress.completedSteps}/{syncProgress.totalSteps})
            </span>
          </div>
          
          {/* 进度条 */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#bee5eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${syncProgress.progress}%`,
              height: '100%',
              backgroundColor: '#17a2b8',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#0c5460' }}>
            已用时: {syncProgress.duration}秒
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && !syncProgress.isActive && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          🔄 正在加载中...
        </div>
      )}

      {/* 🔹 新增：同步统计面板 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>📊 同步状态统计:</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px',
          marginBottom: '10px'
        }}>
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #c3e6cb',
            fontSize: '14px'
          }}>
            <strong>已同步:</strong> {syncStats.synced}
          </div>
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #ffeaa7',
            fontSize: '14px'
          }}>
            <strong>待同步:</strong> {syncStats.pending}
          </div>
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            <strong>失败:</strong> {syncStats.failed}
          </div>
        </div>
        
        {lastFullSyncAt && (
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            上次完整同步: {lastFullSyncAt.toLocaleString()}
          </div>
        )}
      </div>
      
      {/* 基础统计 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'white',
          borderRadius: '5px',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <strong>总计:</strong> {stats.total}
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'white',
          borderRadius: '5px',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <strong>进行中:</strong> {stats.active}
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'white',
          borderRadius: '5px',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <strong>已完成:</strong> {stats.completed}
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'white',
          borderRadius: '5px',
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <strong>完成率:</strong> {stats.completionRate}%
        </div>
      </div>
      
      {/* 过滤器 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>筛选: </label>
        {["all", "active", "completed"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              margin: "0 5px",
              padding: '5px 10px',
              fontWeight: filter === f ? "bold" : "normal",
              backgroundColor: filter === f ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* 🔹 ✨ 新增：Flow 模式智能同步功能区 */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '2px solid #007bff' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#0056b3' }}>🚀 Flow 模式智能同步系统</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {/* 创建测试任务 */}
            <button 
              onClick={() => taskStore.createTestTasksForSync()}
              disabled={isLoading || syncProgress.isActive}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading || syncProgress.isActive ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              📝 创建测试任务
            </button>

            {/* 智能同步 */}
            <button 
              onClick={() => taskStore.syncTasksToServer()}
              disabled={isLoading || syncProgress.isActive || pendingSyncTasks.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: (isLoading || syncProgress.isActive || pendingSyncTasks.length === 0) ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || syncProgress.isActive || pendingSyncTasks.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 智能同步 ({pendingSyncTasks.length})
            </button>

            {/* 重置同步状态 */}
            <button 
              onClick={() => taskStore.resetAllSyncStatus()}
              disabled={isLoading || syncProgress.isActive}
              style={{
                padding: '8px 16px',
                backgroundColor: (isLoading || syncProgress.isActive) ? '#6c757d' : '#ffc107',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 重置状态
            </button>
          </div>

          {/* 同步功能说明 */}
          <div style={{ 
            fontSize: '13px', 
            color: '#0056b3', 
            backgroundColor: 'rgba(0, 123, 255, 0.1)', 
            padding: '8px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <strong>💡 Flow 模式特性:</strong> 
            ✅ 实时进度追踪 | ✅ 智能错误处理 | ✅ 自动重试机制 | ✅ 批量处理优化 | ✅ 状态持久化
          </div>

          {/* 待同步任务列表 */}
          {pendingSyncTasks.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#0056b3' }}>
                📋 待同步任务 ({pendingSyncTasks.length}):
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '12px' }}>
                {pendingSyncTasks.map(task => (
                  <div key={task.id} style={{ 
                    padding: '4px 8px', 
                    margin: '2px 0',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderRadius: '3px',
                    border: '1px solid #ffc107'
                  }}>
                    {task.syncStatusText} {task.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 同步错误列表 */}
          {syncErrors.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#dc3545' }}>
                ❌ 同步错误 ({syncErrors.length}):
              </div>
              <div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '12px' }}>
                {syncErrors.map((error, index) => (
                  <div key={index} style={{ 
                    padding: '4px 8px', 
                    margin: '2px 0',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderRadius: '3px',
                    border: '1px solid #f5c6cb'
                  }}>
                    <strong>{error.taskTitle}:</strong> {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 异步操作按钮组 */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔧 其他异步操作示例:</h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {/* 原有的 async/await 方式 */}
          <button 
            onClick={() => taskStore.loadTasks()}
            disabled={isLoading || syncProgress.isActive}
            style={{
              padding: '8px 16px',
              backgroundColor: (isLoading || syncProgress.isActive) ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer'
            }}
          >
            Async/Await 加载
          </button>

          {/* Flow 方式 */}
          <button 
            onClick={() => taskStore.loadTasksWithFlow()}
            disabled={isLoading || syncProgress.isActive}
            style={{
              padding: '8px 16px',
              backgroundColor: (isLoading || syncProgress.isActive) ? '#6c757d' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer'
            }}
          >
            Flow 方式加载
          </button>

          {/* 重试机制 */}
          <button 
            onClick={() => taskStore.loadTasksWithRetry()}
            disabled={isLoading || syncProgress.isActive}
            style={{
              padding: '8px 16px',
              backgroundColor: (isLoading || syncProgress.isActive) ? '#6c757d' : '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer'
            }}
          >
            重试机制加载
          </button>

          {/* 批量保存 */}
          <button 
            onClick={() => {
              const tasksToSave = [
                { title: '批量任务1', description: '测试批量保存功能' },
                { title: '批量任务2', description: '异步队列处理' },
                { title: '批量任务3', description: 'Flow 批量操作' }
              ];
              taskStore.saveTasksBatch(tasksToSave);
            }}
            disabled={isLoading || syncProgress.isActive}
            style={{
              padding: '8px 16px',
              backgroundColor: (isLoading || syncProgress.isActive) ? '#6c757d' : '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: (isLoading || syncProgress.isActive) ? 'not-allowed' : 'pointer'
            }}
          >
            批量保存测试
          </button>
        </div>
      </div>
      
      {/* 工具操作 */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🛠️ 工具操作:</h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            onClick={handleGetSnapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            获取快照
          </button>
          
          <button 
            onClick={() => taskStore.clearError()}
            disabled={!hasError}
            style={{
              padding: '8px 16px',
              backgroundColor: hasError ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: hasError ? 'pointer' : 'not-allowed'
            }}
          >
            清除错误
          </button>
        </div>
      </div>

      {/* 重试计数显示 */}
      {taskStore.retryCount > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7',
          borderRadius: '3px',
          fontSize: '14px'
        }}>
          🔄 当前重试次数: {taskStore.retryCount}/{taskStore.maxRetries}
        </div>
      )}
    </div>
  );
});

export default TaskStats;