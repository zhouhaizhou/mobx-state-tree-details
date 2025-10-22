好的，下面是一个完整的 React + MST 示例，模拟一个简单的「任务管理应用」，我会逐部分解读每个核心概念。
项目结构
src/
  ├── models/
  │   └── TaskStore.js  # MST 模型定义
  ├── components/
  │   ├── TaskList.js
  │   └── TaskStats.js
  └── App.js

1. MST 模型定义 (models/TaskStore.js)
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

  tasks: [ ]

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

2. React 组件 (components/TaskList.js)
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
        <button type="submit">添加</button>
      </form>
      
      {/* 任务列表 */}
      {filteredList.map(task => (
        <div key={task.id} className="task-item">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          
          {/* 使用 Views */}
          <div>
            <span>状态: {task.status}</span>
            <span> | 创建于 {task.daysSinceCreated} 天前</span>
          </div>
          
          {/* 使用 Actions */}
          <div className="task-actions">
            <button onClick={() => task.toggleCompleted()}>
              {task.completed ? "标记未完成" : "标记完成"}
            </button>
            <button onClick={() => setSelectedTaskId(task.id)}>
              查看详情
            </button>
            <button onClick={() => removeTask(task.id)}>
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

export default TaskList;

3. 统计组件 (components/TaskStats.js)
import React from 'react';
import { observer } from 'mobx-react-lite';
import taskStore from '../models/TaskStore';

const TaskStats = observer(() => {
  // 使用 Views 中的计算值
  const { stats, filter, setFilter } = taskStore;

  return (
    <div className="task-stats">
      <h2>任务统计</h2>
      
      <div className="stats-grid">
        <div className="stat-item">
          <strong>总计:</strong> {stats.total}
        </div>
        <div className="stat-item">
          <strong>进行中:</strong> {stats.active}
        </div>
        <div className="stat-item">
          <strong>已完成:</strong> {stats.completed}
        </div>
        <div className="stat-item">
          <strong>完成率:</strong> {stats.completionRate}%
        </div>
      </div>
      
      {/* 过滤器 - 使用 Actions */}
      <div className="filters">
        <label>筛选: </label>
        {["all", "active", "completed"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              fontWeight: filter === f ? "bold" : "normal",
              margin: "0 5px"
            }}
          >
            {f}
          </button>
        ))}
      </div>
      
      {/* 快照操作 */}
      <div className="snapshot-actions">
        <button onClick={() => {
          const snapshot = getSnapshot(taskStore);
          console.log("当前快照:", snapshot);
          alert("快照已打印到控制台");
        }}>
          获取快照
        </button>
        
        <button onClick={() => taskStore.loadTasks()}>
          重新加载任务
        </button>
      </div>
    </div>
  );
});

// 需要导入 getSnapshot
import { getSnapshot } from "mobx-state-tree";

export default TaskStats;

4. 主应用 (App.js)
import React from 'react';
import { observer } from 'mobx-react-lite';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import taskStore from './models/TaskStore';

const App = observer(() => {
  // 使用 Volatile State 和 Views
  const { selectedTask, setSelectedTaskId } = taskStore;

  return (
    <div className="app">
      <h1>🚀 MST 任务管理器</h1>
      
      <div className="app-layout">
        <div className="main-content">
          <TaskStats />
          <TaskList />
        </div>
        
        {/* 侧边栏 - 显示选中任务详情 */}
        {selectedTask && (
          <div className="sidebar">
            <h3>任务详情</h3>
            <button onClick={() => setSelectedTaskId(null)}>关闭</button>
            
            <h4>{selectedTask.title}</h4>
            <p>{selectedTask.description}</p>
            <p><strong>状态:</strong> {selectedTask.status}</p>
            <p><strong>创建时间:</strong> {selectedTask.createdAt.toLocaleString()}</p>
            <p><strong>已存在:</strong> {selectedTask.daysSinceCreated} 天</p>
            
            <button onClick={() => {
              const newTitle = prompt("输入新标题:", selectedTask.title);
              if (newTitle !== null) {
                try {
                  selectedTask.updateTitle(newTitle);
                } catch (error) {
                  alert(error.message);
                }
              }
            }}>
              编辑标题
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default App;

核心概念在 Demo 中的体现
🔹 Models & Types
· Task 和 TaskStore 模型定义了数据结构
· 每个字段都有明确的类型 (string, boolean, Date, array)
🔹 Views (计算属性)
· task.status - 根据完成状态派生显示文本
· task.daysSinceCreated - 计算任务存在天数
· store.filteredTasks - 根据过滤器筛选任务
· store.stats - 计算各种统计数据
🔹 Actions (状态修改)
· addTask(), removeTask() - 修改任务数组
· toggleCompleted() - 修改单个任务状态
· updateTitle() - 包含验证逻辑的修改
🔹 Volatile State (临时状态)
· isLoading - 加载状态（不持久化）
· searchKeyword - 搜索关键词（临时UI状态）
· selectedTaskId - 当前选中的任务ID
🔹 Snapshots (快照)
· 自动保存到 localStorage
· 应用启动时从快照恢复状态
· 可以手动获取和查看快照
🔹 Patches (补丁)
· 监听所有状态变化的细节
· 可用于实时同步或调试
这个 Demo 完整展示了 MST 如何提供：
· 类型安全（运行时验证）
· 响应式更新（自动重新渲染）
· 可预测的状态管理（通过 Actions）
· 强大的开发者工具（快照、补丁）
· 灵活的状态结构（持久化 + 临时状态）