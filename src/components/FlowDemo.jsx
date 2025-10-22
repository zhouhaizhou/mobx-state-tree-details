import React, { useState } from 'react';
import { observer } from 'mobx-react';
import taskStore from '../models/TaskStore';

const FlowDemo = observer(() => {
  const [showCode, setShowCode] = useState(false);
  const { syncProgress, pendingSyncTasks, syncErrors, syncStats } = taskStore;

  const codeExample = `// 🔹 Flow 模式异步处理完整案例
syncTasksToServer: flow(function* () {
  console.log("🚀 开始智能任务同步...");
  
  // 1. 初始化同步进度
  const pendingTasks = self.pendingSyncTasks;
  if (pendingTasks.length === 0) {
    console.log("📝 没有需要同步的任务");
    return;
  }

  const totalSteps = pendingTasks.length + 3;
  self.syncProgress.start(totalSteps, "准备同步...");
  self.clearError();
  self.syncErrors = [];

  try {
    // 2. 步骤1: 验证网络连接
    self.syncProgress.updateStep("🔍 检查网络连接...");
    yield new Promise(resolve => setTimeout(resolve, 800));
    
    if (Math.random() < 0.2) {
      throw new Error("网络连接不可用，请检查网络设置");
    }
    
    self.syncProgress.completeStep();

    // 3. 步骤2: 获取服务器时间戳
    self.syncProgress.updateStep("⏰ 同步服务器时间...");
    yield new Promise(resolve => setTimeout(resolve, 600));
    
    const serverTime = new Date();
    self.syncProgress.completeStep();

    // 4. 步骤3: 批量同步任务
    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      
      try {
        self.syncProgress.updateStep(\`📤 同步任务: \${task.title}\`);
        
        // 模拟单个任务同步
        yield new Promise(resolve => 
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
        
        // 模拟同步失败概率
        if (Math.random() < 0.15) {
          throw new Error(\`任务 "\${task.title}" 同步失败: 服务器繁忙\`);
        }
        
        // 同步成功
        task.setSyncStatus("synced");
        self.syncProgress.completeStep();
        
      } catch (taskError) {
        // 单个任务失败不影响整体流程
        task.setSyncStatus("failed");
        self.syncErrors.push({
          taskId: task.id,
          taskTitle: task.title,
          error: taskError.message,
          timestamp: new Date()
        });
        
        self.syncProgress.completeStep();
      }
    }

    // 5. 完成同步并生成报告
    self.syncProgress.updateStep("📊 生成同步报告...");
    yield new Promise(resolve => setTimeout(resolve, 500));
    
    const syncReport = {
      totalTasks: pendingTasks.length,
      successCount: pendingTasks.filter(t => t.syncStatus === "synced").length,
      failedCount: self.syncErrors.length,
      duration: self.syncProgress.duration,
      timestamp: new Date()
    };
    
    self.lastFullSyncAt = new Date();
    self.syncProgress.completeStep();
    self.syncProgress.finish();
    
    return syncReport;
    
  } catch (error) {
    self.setError(\`同步失败: \${error.message}\`);
    self.syncProgress.reset();
    throw error;
  }
})`;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ 
        color: '#007bff', 
        marginTop: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🚀 Flow 模式异步处理完整案例
        <button
          onClick={() => setShowCode(!showCode)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: showCode ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showCode ? '隐藏代码' : '查看代码'}
        </button>
      </h3>

      {/* Flow 模式特点说明 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '10px' }}>💡 Flow 模式的核心优势:</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '10px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            <strong>🎯 状态管理</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              自动处理异步状态，无需手动管理 loading/error
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#d1ecf1',
            borderRadius: '6px',
            border: '1px solid #bee5eb'
          }}>
            <strong>🔄 流程控制</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              使用 yield 实现顺序执行，代码更清晰
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>⚡ 错误处理</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              统一的 try/catch，支持部分失败继续执行
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>📊 进度追踪</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              实时进度更新，用户体验更好
            </div>
          </div>
        </div>
      </div>

      {/* 实际演示区域 */}
      <div style={{
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '2px solid #007bff',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#007bff', marginTop: 0 }}>🎮 实际演示</h4>
        
        {/* 当前状态显示 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#0056b3' }}>待同步</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                {syncStats.pending}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#155724' }}>已同步</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                {syncStats.synced}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#721c24' }}>失败</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                {syncStats.failed}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <button
            onClick={() => taskStore.createTestTasksForSync()}
            disabled={syncProgress.isActive}
            style={{
              padding: '10px 20px',
              backgroundColor: syncProgress.isActive ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: syncProgress.isActive ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            📝 创建测试数据
          </button>

          <button
            onClick={() => taskStore.syncTasksToServer()}
            disabled={syncProgress.isActive || pendingSyncTasks.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: (syncProgress.isActive || pendingSyncTasks.length === 0) ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (syncProgress.isActive || pendingSyncTasks.length === 0) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚀 开始 Flow 同步
          </button>

          <button
            onClick={() => taskStore.resetAllSyncStatus()}
            disabled={syncProgress.isActive}
            style={{
              padding: '10px 20px',
              backgroundColor: syncProgress.isActive ? '#6c757d' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: syncProgress.isActive ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 重置状态
          </button>
        </div>

        {/* 实时进度显示 */}
        {syncProgress.isActive && (
          <div style={{
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '6px',
            border: '1px solid #007bff',
            marginBottom: '15px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <strong style={{ color: '#007bff' }}>
                {syncProgress.currentStep}
              </strong>
              <span style={{ color: '#007bff', fontSize: '14px' }}>
                {syncProgress.progress}% ({syncProgress.completedSteps}/{syncProgress.totalSteps})
              </span>
            </div>
            
            {/* 进度条 */}
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#cce7ff',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${syncProgress.progress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease',
                borderRadius: '5px'
              }} />
            </div>
            
            <div style={{ fontSize: '12px', color: '#007bff' }}>
              ⏱️ 已用时: {syncProgress.duration}秒
            </div>
          </div>
        )}

        {/* 错误信息显示 */}
        {syncErrors.length > 0 && (
          <div style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            border: '1px solid #f5c6cb',
            marginBottom: '15px'
          }}>
            <strong style={{ color: '#721c24' }}>❌ 同步错误:</strong>
            <div style={{ marginTop: '8px', maxHeight: '100px', overflowY: 'auto' }}>
              {syncErrors.map((error, index) => (
                <div key={index} style={{ 
                  fontSize: '13px', 
                  color: '#721c24',
                  marginBottom: '4px',
                  padding: '4px',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  borderRadius: '3px'
                }}>
                  <strong>{error.taskTitle}:</strong> {error.error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 代码展示 */}
      {showCode && (
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
            {codeExample}
          </pre>
        </div>
      )}

      {/* Flow vs Async/Await 对比 */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>⚖️ Flow vs Async/Await 对比</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            <h5 style={{ color: '#155724', marginTop: 0 }}>✅ Flow 模式优势</h5>
            <ul style={{ fontSize: '14px', color: '#155724', paddingLeft: '20px' }}>
              <li>自动状态管理</li>
              <li>更好的错误边界</li>
              <li>支持取消操作</li>
              <li>内置进度追踪</li>
              <li>更清晰的异步流程</li>
            </ul>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffeaa7'
          }}>
            <h5 style={{ color: '#856404', marginTop: 0 }}>⚠️ Async/Await 限制</h5>
            <ul style={{ fontSize: '14px', color: '#856404', paddingLeft: '20px' }}>
              <li>需要手动管理状态</li>
              <li>错误处理相对复杂</li>
              <li>难以实现取消功能</li>
              <li>进度追踪需额外实现</li>
              <li>嵌套异步逻辑复杂</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用建议 */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ color: '#007bff', marginTop: 0 }}>💡 使用建议</h4>
        <div style={{ fontSize: '14px', color: '#0056b3' }}>
          <p><strong>适合使用 Flow 的场景:</strong></p>
          <ul>
            <li>复杂的多步骤异步流程</li>
            <li>需要实时进度反馈的操作</li>
            <li>批量处理且需要错误隔离</li>
            <li>可能需要取消的长时间操作</li>
          </ul>
          
          <p><strong>继续使用 Async/Await 的场景:</strong></p>
          <ul>
            <li>简单的单步异步操作</li>
            <li>快速原型开发</li>
            <li>与现有 Promise 生态集成</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default FlowDemo;