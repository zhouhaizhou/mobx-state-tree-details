## 📖 项目概述

好的，下面是一个完整的 React + MST 示例，模拟一个简单的「任务管理应用」，我会逐部分解读每个核心概念。

## 🏗️ 项目结构

```
src/
├── models/
│   └── TaskStore.js  # MST 模型定义
├── components/
│   ├── TaskList.js
│   └── TaskStats.js
└── App.js
```

## 🔧 MST 模型定义 (models/TaskStore.js)

```javascript
import { types, onSnapshot, onPatch } from "mobx-state-tree";

// 🔹 1. Models & Types: 定义任务模型的结构
const Task = types
  .model("Task", {
    // 核心持久化状态
    id: types.identifier, // 唯一标识符
    title: types.string, // 字符串类型
    description: types.string,
    completed: types.optional(types.boolean, false), // 可选的布尔值，默认false
    createdAt: types.optional(types.Date, () => new Date()), // 日期类型
  })
  .views((self) => ({
    // 🔹 2. Views: 派生数据（计算属性）
    get status() {
      return self.completed ? "✅ 已完成" : "⏳ 进行中";
    },
    get daysSinceCreated() {
      const diff = new Date() - self.createdAt;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
  }))
  .actions((self) => ({
    // 🔹 3. Actions: 修改状态的方法
    toggleCompleted() {
      self.completed = !self.completed;
    },
    updateTitle(newTitle) {
      if (newTitle.trim().length === 0) {
        throw new Error("标题不能为空");
      }
      self.title = newTitle;
    }
  }));

// 主存储模型
const TaskStore = types
  .model("TaskStore", {
    tasks: types.array(Task), // Task 类型的数组
    filter: types.optional(types.enumeration(["all", "active", "completed"]), "all"),
    
    // 🔹 4. Volatile State: 临时状态（不会被序列化）
  })
  .volatile((self) => ({
    isLoading: false,
    searchKeyword: "",
    selectedTaskId: null
  }))
  .views((self) => ({
    // 🔹 更多 Views
    get filteredTasks() {
      switch (self.filter) {
        case "active":
          return self.tasks.filter(task => !task.completed);
        case "completed":
          return self.tasks.filter(task => task.completed);
        default:
          return self.tasks;
      }
    },
    get stats() {
      const total = self.tasks.length;
      const completed = self.tasks.filter(task => task.completed).length;
      const active = total - completed;
      
      return {
        total,
        completed,
        active,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
      };
    },
    
    // 查找选中的任务（View 中使用其他 View）
    get selectedTask() {
      return self.tasks.find(task => task.id === self.selectedTaskId);
    }
  }))
  .actions((self) => ({
    // 🔹 更多 Actions
    addTask(title, description = "") {
      if (!title.trim()) return;
      
      const newTask = Task.create({
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        description: description.trim(),
      });
      
      self.tasks.push(newTask);
      return newTask;
    },
    
    removeTask(id) {
      const index = self.tasks.findIndex(task => task.id === id);
      if (index !== -1) {
        self.tasks.splice(index, 1);
      }
    },
    
    setFilter(newFilter) {
      self.filter = newFilter;
    },
    
    // Volatile state 的 Actions
    setLoading(loading) {
      self.isLoading = loading;
    },
    
    setSearchKeyword(keyword) {
      self.searchKeyword = keyword;
    },
    
    setSelectedTaskId(id) {
      self.selectedTaskId = id;
    },
    
    // 模拟异步操作
    async loadTasks() {
      self.setLoading(true);
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 应用快照来更新状态
        const mockTasks = [
          {
            id: "1",
            title: "学习 MST",
            description: "理解核心概念",
            completed: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
          },
          {
            id: "2", 
            title: "构建示例项目",
            description: "用 React + MST 创建任务应用",
            completed: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
          }
        ];
        
        // 应用快照来完全替换 tasks
        self.tasks = mockTasks;
      } catch (error) {
        console.error("加载任务失败:", error);
      } finally {
        self.setLoading(false);
      }
    }
  }));

// 创建 store 实例
const taskStore = TaskStore.create({
  tasks: []
});

// 🔹 5. Snapshots: 监听和操作快照
onSnapshot(taskStore, (snapshot) => {
  console.log("📸 当前快照:", snapshot);
  // 在实际应用中，可以在这里保存到 localStorage
  localStorage.setItem("taskStoreSnapshot", JSON.stringify(snapshot));
});

// 🔹 6. Patches: 监听细粒度变化
onPatch(taskStore, (patch) => {
  console.log("🔧 状态补丁:", patch);
  // 可以发送到服务器进行实时同步
});

// 从 localStorage 加载快照
const savedSnapshot = localStorage.getItem("taskStoreSnapshot");
if (savedSnapshot) {
  try {
    applySnapshot(taskStore, JSON.parse(savedSnapshot));
    console.log("💾 从本地存储恢复快照");
  } catch (error) {
    console.error("恢复快照失败:", error);
  }
}

export default taskStore;
```

## ⚛️ React 组件 (components/TaskList.js)

```javascript
import React from 'react';
import { observer } from 'mobx-react-lite';
import taskStore from '../models/TaskStore';

const TaskList = observer(() => {
  // 使用 Views
  const { filteredTasks, isLoading, searchKeyword } = taskStore;
  
  // 使用 Actions
  const { 
    addTask, 
    removeTask, 
    setSearchKeyword,
    setSelectedTaskId 
  } = taskStore;

  const [newTaskTitle, setNewTaskTitle] = React.useState("");

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
    return <div>⏳ 加载中...</div>;
  }

  return (
    <div className="task-list">
      <h2>任务列表 ({filteredList.length})</h2>
      
      {/* 搜索 - 使用 Volatile State */}
      <input
        type="text"
        placeholder="搜索任务..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      
      {/* 添加新任务 */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="输入新任务..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit">添加任务</button>
      </form>

      {/* 任务列表 */}
      <div className="tasks">
        {filteredList.map(task => (
          <div 
            key={task.id} 
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => setSelectedTaskId(task.id)}
          >
            <div className="task-content">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <small>创建于 {task.daysSinceCreated} 天前 - {task.status}</small>
            </div>
            
            <div className="task-actions">
              <button onClick={(e) => {
                e.stopPropagation();
                task.toggleCompleted();
              }}>
                {task.completed ? '取消完成' : '标记完成'}
              </button>
              
              <button onClick={(e) => {
                e.stopPropagation();
                removeTask(task.id);
              }}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default TaskList;
```

## 📊 统计组件 (components/TaskStats.js)

```javascript
import React from 'react';
import { observer } from 'mobx-react-lite';
import taskStore from '../models/TaskStore';

const TaskStats = observer(() => {
  const { stats, filter } = taskStore;
  const { setFilter, loadTasks } = taskStore;

  return (
    <div className="task-stats">
      <h2>📊 任务统计</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总任务数</h3>
          <span className="stat-number">{stats.total}</span>
        </div>
        
        <div className="stat-card">
          <h3>已完成</h3>
          <span className="stat-number completed">{stats.completed}</span>
        </div>
        
        <div className="stat-card">
          <h3>进行中</h3>
          <span className="stat-number active">{stats.active}</span>
        </div>
        
        <div className="stat-card">
          <h3>完成率</h3>
          <span className="stat-number">{stats.completionRate}%</span>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="filters">
        <h3>筛选任务</h3>
        <div className="filter-buttons">
          {['all', 'active', 'completed'].map(filterType => (
            <button
              key={filterType}
              className={filter === filterType ? 'active' : ''}
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all' ? '全部' : 
               filterType === 'active' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="actions">
        <button onClick={loadTasks}>
          🔄 重新加载任务
        </button>
      </div>
    </div>
  );
});

export default TaskStats;
```

## 🚀 主应用组件 (App.js)

```javascript
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import taskStore from './models/TaskStore';
import './App.css';

const App = observer(() => {
  const { selectedTask, setSelectedTaskId } = taskStore;

  useEffect(() => {
    // 应用启动时加载任务
    taskStore.loadTasks();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 React + MST 任务管理器</h1>
        <p>演示 MobX-State-Tree 的核心概念和最佳实践</p>
      </header>

      <main className="app-main">
        <div className="content">
          <TaskStats />
          <TaskList />
        </div>

        {/* 侧边栏 - 显示选中任务详情 */}
        {selectedTask && (
          <aside className="task-detail-sidebar">
            <div className="sidebar-header">
              <h3>任务详情</h3>
              <button onClick={() => setSelectedTaskId(null)}>✕</button>
            </div>
            
            <div className="task-detail">
              <h4>{selectedTask.title}</h4>
              <p>{selectedTask.description}</p>
              <div className="task-meta">
                <p><strong>状态:</strong> {selectedTask.status}</p>
                <p><strong>创建时间:</strong> {selectedTask.createdAt.toLocaleString()}</p>
                <p><strong>已存在:</strong> {selectedTask.daysSinceCreated} 天</p>
              </div>
              
              <div className="task-actions">
                <button onClick={() => selectedTask.toggleCompleted()}>
                  {selectedTask.completed ? '标记为未完成' : '标记为完成'}
                </button>
                
                <button onClick={() => {
                  const newTitle = prompt("输入新标题:", selectedTask.title);
                  if (newTitle) {
                    selectedTask.updateTitle(newTitle);
                  }
                }}>
                  编辑标题
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
});

export default App;
```

## 🎯 核心概念总结

### 1. **Models & Types**
- 定义数据结构和类型约束
- 支持基础类型、复合类型和自定义类型
- 提供运行时类型检查

### 2. **Views (计算属性)**
- 基于状态派生的只读数据
- 自动缓存和依赖追踪
- 支持组合和嵌套

### 3. **Actions**
- 唯一修改状态的方式
- 支持同步和异步操作
- 自动事务处理

### 4. **Volatile State**
- 临时状态，不参与序列化
- 适用于 UI 状态和缓存数据
- 性能优化的重要手段

### 5. **Snapshots & Patches**
- 状态快照用于持久化和时间旅行
- 补丁记录用于实时同步和撤销重做
- 完整的状态管理生命周期

## 🚀 运行项目

```bash
npm install
npm start
```

这个示例展示了 MST 在实际 React 项目中的完整应用，包括状态管理、组件集成和最佳实践。