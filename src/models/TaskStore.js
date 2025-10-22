import { types, onSnapshot, onPatch, applySnapshot, flow } from "mobx-state-tree";
import { installPlugins } from "../plugins/index.js";

// 🔹 1. Models & Types: 定义任务模型的结构
const Task = types
  .model("Task", {
    // 核心持久化状态
    id: types.identifier,
    title: types.string,
    description: types.string,
    completed: types.optional(types.boolean, false),
    createdAt: types.optional(types.Date, () => new Date()),
    // 🔹 新增：同步相关字段
    lastSyncAt: types.maybeNull(types.Date),
    syncStatus: types.optional(types.enumeration(["synced", "pending", "failed"]), "pending"),
  })
  .views((self) => ({
    // 🔹 2. Views: 派生数据（计算属性）
    get status() {
      return self.completed ? "✅ 已完成" : "⏳ 进行中";
    },
    get daysSinceCreated() {
      const diff = new Date() - self.createdAt;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    get syncStatusText() {
      switch (self.syncStatus) {
        case "synced": return "✅ 已同步";
        case "pending": return "⏳ 待同步";
        case "failed": return "❌ 同步失败";
        default: return "❓ 未知状态";
      }
    },
    get needsSync() {
      return self.syncStatus === "pending" || self.syncStatus === "failed";
    }
  }))
  .actions((self) => ({
    // 🔹 3. Actions: 修改状态的方法
    toggleCompleted() {
      self.completed = !self.completed;
      self.syncStatus = "pending"; // 标记需要同步
    },
    updateTitle(newTitle) {
      if (newTitle.trim().length === 0) {
        throw new Error("标题不能为空");
      }
      self.title = newTitle;
      self.syncStatus = "pending"; // 标记需要同步
    },
    setSyncStatus(status) {
      self.syncStatus = status;
      if (status === "synced") {
        self.lastSyncAt = new Date();
      }
    }
  }));

// 🔹 新增：同步进度模型
const SyncProgress = types
  .model("SyncProgress", {
    isActive: types.optional(types.boolean, false),
    currentStep: types.optional(types.string, ""),
    totalSteps: types.optional(types.number, 0),
    completedSteps: types.optional(types.number, 0),
    startTime: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get progress() {
      return self.totalSteps > 0 ? (self.completedSteps / self.totalSteps * 100).toFixed(1) : 0;
    },
    get isCompleted() {
      return self.completedSteps >= self.totalSteps && self.totalSteps > 0;
    },
    get duration() {
      if (!self.startTime) return 0;
      return Math.floor((new Date() - self.startTime) / 1000);
    }
  }))
  .actions((self) => ({
    start(totalSteps, initialStep = "") {
      self.isActive = true;
      self.totalSteps = totalSteps;
      self.completedSteps = 0;
      self.currentStep = initialStep;
      self.startTime = new Date();
    },
    updateStep(stepName) {
      self.currentStep = stepName;
    },
    completeStep() {
      if (self.completedSteps < self.totalSteps) {
        self.completedSteps++;
      }
    },
    finish() {
      self.isActive = false;
      self.currentStep = "完成";
      self.completedSteps = self.totalSteps;
    },
    reset() {
      self.isActive = false;
      self.currentStep = "";
      self.totalSteps = 0;
      self.completedSteps = 0;
      self.startTime = null;
    }
  }));

// 主存储模型
const TaskStore = types
  .model("TaskStore", {
    tasks: types.array(Task),
    filter: types.optional(types.enumeration(["all", "active", "completed"]), "all"),
    // 🔹 新增：同步进度
    syncProgress: types.optional(SyncProgress, {}),
  })
  .volatile((self) => ({
    // 🔹 4. Volatile State: 临时状态
    isLoading: false,
    searchKeyword: "",
    selectedTaskId: null,
    // 🔹 新增：错误处理状态
    error: null,
    retryCount: 0,
    maxRetries: 3,
    // 🔹 新增：同步相关状态
    lastFullSyncAt: null,
    syncErrors: [],
    // 🔹 新增：插件管理器
    pluginManager: null,
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
    get selectedTask() {
      return self.tasks.find(task => task.id === self.selectedTaskId);
    },
    // 🔹 新增：错误状态检查
    get hasError() {
      return self.error !== null;
    },
    // 🔹 新增：同步相关 Views
    get pendingSyncTasks() {
      return self.tasks.filter(task => task.needsSync);
    },
    get syncStats() {
      const total = self.tasks.length;
      const synced = self.tasks.filter(task => task.syncStatus === "synced").length;
      const pending = self.tasks.filter(task => task.syncStatus === "pending").length;
      const failed = self.tasks.filter(task => task.syncStatus === "failed").length;
      
      return { total, synced, pending, failed };
    }
  }))
  .actions((self) => ({
    // 🔹 插件系统初始化
    afterCreate() {
      // 安装插件系统
      self.pluginManager = installPlugins(self, 'development');
      console.log('🔌 Plugin system initialized with plugins:', self.pluginManager.listPlugins());
    },

    beforeDestroy() {
      // 清理插件
      if (self.pluginManager) {
        self.pluginManager.dispose();
      }
    },

    // 🔹 插件管理 Actions
    getPerformanceReport() {
      const performancePlugin = self.pluginManager?.getPlugin('PerformancePlugin');
      return performancePlugin?.getPerformanceReport() || {};
    },

    clearPerformanceData() {
      const performancePlugin = self.pluginManager?.getPlugin('PerformancePlugin');
      performancePlugin?.clearPerformanceData();
    },

    clearPersistedData() {
      const persistencePlugin = self.pluginManager?.getPlugin('PersistencePlugin');
      persistencePlugin?.clearPersistedData();
    },

    // 🔹 更多 Actions
    addTask(title, description = "") {
      if (!title.trim()) return null;
      
      const newTask = Task.create({
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        description: description.trim(),
        syncStatus: "pending", // 新任务需要同步
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

    // 🔹 新增：错误处理 Actions
    setError(error) {
      self.error = error;
    },

    clearError() {
      self.error = null;
    },

    // 🔹 原有的异步操作 (async/await 方式)
    async loadTasks() {
      self.setLoading(true);
      self.clearError();
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTasks = [
          {
            id: "1",
            title: "学习 MST",
            description: "理解核心概念",
            completed: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            syncStatus: "synced",
            lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          {
            id: "2", 
            title: "构建示例项目",
            description: "用 React + MST 创建任务应用",
            completed: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            syncStatus: "pending"
          }
        ];
        
        self.tasks = mockTasks;
      } catch (error) {
        console.error("加载任务失败:", error);
        self.setError("加载任务失败，请稍后重试");
      } finally {
        self.setLoading(false);
      }
    },

    // 🔹 新增：使用 Flow 的异步操作
    loadTasksWithFlow: flow(function* () {
      self.setLoading(true);
      self.clearError();
      
      try {
        // 模拟网络延迟
        yield new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟可能的网络错误
        if (Math.random() < 0.3) {
          throw new Error("网络连接失败");
        }
        
        const mockTasks = [
          {
            id: "flow-1",
            title: "Flow 方式加载的任务",
            description: "使用 Generator 函数处理异步",
            completed: false,
            createdAt: new Date(),
            syncStatus: "synced",
            lastSyncAt: new Date()
          },
          {
            id: "flow-2", 
            title: "异步状态管理",
            description: "更好的错误处理和状态追踪",
            completed: true,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            syncStatus: "pending"
          }
        ];
        
        self.tasks = mockTasks;
        console.log("✅ Flow 方式加载任务成功");
        
      } catch (error) {
        console.error("Flow 加载任务失败:", error);
        self.setError(`Flow 加载失败: ${error.message}`);
      } finally {
        self.setLoading(false);
      }
    }),

    // 🔹 新增：带重试机制的异步操作
    loadTasksWithRetry: flow(function* () {
      self.retryCount = 0;
      
      while (self.retryCount < self.maxRetries) {
        try {
          self.setLoading(true);
          self.clearError();
          
          // 模拟网络请求
          yield new Promise(resolve => setTimeout(resolve, 1000));
          
          // 模拟失败概率
          if (Math.random() < 0.6) {
            throw new Error("模拟网络错误");
          }
          
          const mockTasks = [
            {
              id: "retry-1",
              title: "重试机制测试",
              description: "测试自动重试功能",
              completed: false,
              createdAt: new Date(),
              syncStatus: "synced",
              lastSyncAt: new Date()
            }
          ];
          
          self.tasks = mockTasks;
          self.retryCount = 0; // 重置重试计数
          console.log("✅ 重试加载任务成功");
          return; // 成功，退出循环
          
        } catch (error) {
          self.retryCount++;
          console.warn(`尝试 ${self.retryCount}/${self.maxRetries} 失败:`, error.message);
          
          if (self.retryCount >= self.maxRetries) {
            self.setError(`加载失败，已重试 ${self.maxRetries} 次: ${error.message}`);
            break;
          }
          
          // 指数退避重试
          const delay = Math.pow(2, self.retryCount) * 1000;
          console.log(`等待 ${delay}ms 后重试...`);
          yield new Promise(resolve => setTimeout(resolve, delay));
          
        } finally {
          self.setLoading(false);
        }
      }
    }),

    // 🔹 新增：批量保存任务
    saveTasksBatch: flow(function* (tasksToSave) {
      self.setLoading(true);
      self.clearError();
      
      try {
        for (let i = 0; i < tasksToSave.length; i++) {
          const task = tasksToSave[i];
          
          // 模拟单个任务保存
          yield new Promise(resolve => setTimeout(resolve, 500));
          
          // 模拟保存操作
          console.log(`保存任务 ${i + 1}/${tasksToSave.length}: ${task.title}`);
          
          // 添加到本地状态
          self.addTask(task.title, task.description);
        }
        
        console.log("✅ 批量保存完成");
        
      } catch (error) {
        console.error("批量保存失败:", error);
        self.setError(`批量保存失败: ${error.message}`);
      } finally {
        self.setLoading(false);
      }
    }),

    // 🔹 ✨ 新增：完整的 Flow 模式异步案例 - 智能任务同步系统
    syncTasksToServer: flow(function* () {
      console.log("🚀 开始智能任务同步...");
      
      // 1. 初始化同步进度
      const pendingTasks = self.pendingSyncTasks;
      if (pendingTasks.length === 0) {
        console.log("📝 没有需要同步的任务");
        return;
      }

      const totalSteps = pendingTasks.length + 3; // 任务数量 + 3个额外步骤
      self.syncProgress.start(totalSteps, "准备同步...");
      self.clearError();
      self.syncErrors = [];

      try {
        // 2. 步骤1: 验证网络连接
        self.syncProgress.updateStep("🔍 检查网络连接...");
        yield new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟网络检查失败
        if (Math.random() < 0.2) {
          throw new Error("网络连接不可用，请检查网络设置");
        }
        
        self.syncProgress.completeStep();
        console.log("✅ 网络连接正常");

        // 3. 步骤2: 获取服务器时间戳
        self.syncProgress.updateStep("⏰ 同步服务器时间...");
        yield new Promise(resolve => setTimeout(resolve, 600));
        
        const serverTime = new Date();
        self.syncProgress.completeStep();
        console.log("✅ 服务器时间同步完成:", serverTime.toISOString());

        // 4. 步骤3: 批量同步任务
        self.syncProgress.updateStep("📤 开始批量同步任务...");
        
        for (let i = 0; i < pendingTasks.length; i++) {
          const task = pendingTasks[i];
          
          try {
            self.syncProgress.updateStep(`📤 同步任务: ${task.title}`);
            
            // 模拟单个任务同步
            yield new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            
            // 模拟同步失败概率
            if (Math.random() < 0.15) {
              throw new Error(`任务 "${task.title}" 同步失败: 服务器繁忙`);
            }
            
            // 同步成功
            task.setSyncStatus("synced");
            self.syncProgress.completeStep();
            
            console.log(`✅ 任务同步成功: ${task.title}`);
            
            // 实时进度反馈
            if (i % 2 === 0) {
              yield new Promise(resolve => setTimeout(resolve, 200)); // 小延迟，让用户看到进度
            }
            
          } catch (taskError) {
            // 单个任务失败不影响整体流程
            task.setSyncStatus("failed");
            self.syncErrors.push({
              taskId: task.id,
              taskTitle: task.title,
              error: taskError.message,
              timestamp: new Date()
            });
            
            console.warn(`⚠️ 任务同步失败: ${task.title} - ${taskError.message}`);
            self.syncProgress.completeStep(); // 即使失败也要推进进度
          }
        }

        // 5. 步骤4: 完成同步并生成报告
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
        
        // 6. 完成同步
        self.syncProgress.finish();
        
        console.log("🎉 同步完成！报告:", syncReport);
        
        // 如果有失败的任务，显示警告而不是错误
        if (self.syncErrors.length > 0) {
          const failedTitles = self.syncErrors.map(e => e.taskTitle).join(", ");
          self.setError(`部分任务同步失败: ${failedTitles}。请稍后重试。`);
        }
        
        return syncReport;
        
      } catch (error) {
        // 整体同步失败
        console.error("❌ 同步过程失败:", error);
        self.setError(`同步失败: ${error.message}`);
        self.syncProgress.reset();
        
        // 将所有待同步任务标记为失败
        pendingTasks.forEach(task => {
          if (task.syncStatus === "pending") {
            task.setSyncStatus("failed");
          }
        });
        
        throw error; // 重新抛出错误，让调用者知道失败了
      }
    }),

    // 🔹 新增：重置所有任务同步状态（用于测试）
    resetAllSyncStatus() {
      self.tasks.forEach(task => {
        task.setSyncStatus("pending");
      });
      self.syncErrors = [];
      self.lastFullSyncAt = null;
      console.log("🔄 已重置所有任务同步状态");
    },

    // 🔹 新增：模拟创建需要同步的任务
    createTestTasksForSync() {
      const testTasks = [
        { title: "Flow 同步测试 1", description: "测试智能同步功能" },
        { title: "Flow 同步测试 2", description: "测试错误处理机制" },
        { title: "Flow 同步测试 3", description: "测试进度追踪" },
        { title: "Flow 同步测试 4", description: "测试批量处理" },
        { title: "Flow 同步测试 5", description: "测试完整流程" }
      ];
      
      testTasks.forEach(task => {
        self.addTask(task.title, task.description);
      });
      
      console.log(`✅ 已创建 ${testTasks.length} 个测试任务`);
    }
  }));

// 创建 store 实例
const taskStore = TaskStore.create({
  tasks: []
});

// 🔹 5. Snapshots: 监听快照
onSnapshot(taskStore, (snapshot) => {
  console.log("📸 当前快照:", snapshot);
  localStorage.setItem("taskStoreSnapshot", JSON.stringify(snapshot));
});

// 🔹 6. Patches: 监听细粒度变化
onPatch(taskStore, (patch) => {
  console.log("🔧 状态补丁:", patch);
});

// 从插件系统加载快照（如果有的话）
const persistencePlugin = taskStore.pluginManager?.getPlugin('PersistencePlugin');
if (persistencePlugin) {
  const initialData = persistencePlugin.loadInitialData();
  if (initialData) {
    try {
      applySnapshot(taskStore, initialData);
      console.log("💾 从插件系统恢复快照");
    } catch (error) {
      console.error("恢复快照失败:", error);
    }
  }
}

export default taskStore;