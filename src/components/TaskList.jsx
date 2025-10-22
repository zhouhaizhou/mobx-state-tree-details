import React, { useState } from 'react';
import { observer } from 'mobx-react';
import taskStore from '../models/TaskStore';

const TaskList = observer(() => {
  const { filteredTasks, isLoading, searchKeyword } = taskStore;
  const { 
    addTask, 
    removeTask, 
    setSearchKeyword,
    setSelectedTaskId 
  } = taskStore;

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle("");
    }
  };

  const filteredList = filteredTasks.filter(task =>
    task.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ 加载中...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>任务列表 ({filteredList.length})</h2>
      
      {/* 搜索 - 使用 Volatile State */}
      <input
        type="text"
        placeholder="搜索任务..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ 
          marginBottom: '10px', 
          padding: '8px', 
          width: '200px' 
        }}
      />
      
      {/* 添加新任务 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="输入新任务..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ 
            padding: '8px', 
            marginRight: '10px',
            width: '200px'
          }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          添加
        </button>
      </form>
      
      {/* 任务列表 */}
      {filteredList.map(task => (
        <div 
          key={task.id} 
          style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '10px',
            borderRadius: '5px'
          }}
        >
          <h3 style={{ 
            margin: '0 0 10px 0',
            color: task.completed ? '#888' : '#333',
            textDecoration: task.completed ? 'line-through' : 'none'
          }}>
            {task.title}
          </h3>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>
            {task.description}
          </p>
          
          {/* 使用 Views */}
          <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
            <span>状态: {task.status}</span>
            <span> | 创建于 {task.daysSinceCreated} 天前</span>
          </div>
          
          {/* 使用 Actions */}
          <div>
            <button 
              onClick={() => task.toggleCompleted()}
              style={{ 
                marginRight: '10px', 
                padding: '5px 10px',
                backgroundColor: task.completed ? '#ffd700' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {task.completed ? "标记未完成" : "标记完成"}
            </button>
            <button 
              onClick={() => setSelectedTaskId(task.id)}
              style={{ 
                marginRight: '10px', 
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              查看详情
            </button>
            <button 
              onClick={() => removeTask(task.id)}
              style={{ 
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
      
      {filteredList.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
          暂无任务
        </div>
      )}
    </div>
  );
});

export default TaskList;
