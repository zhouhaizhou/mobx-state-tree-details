import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useTheme } from '../hooks/useTheme';
import ThemeSelector from './ThemeSelector';

const DocumentViewer = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 使用主题Hook
  const { getCodeStyles } = useTheme();
  const codeStyles = getCodeStyles();

  const documentList = [
    {
      id: 'mst-core-concepts',
      title: 'MST 核心概念分析',
      description: 'MobX-State-Tree 的核心概念、设计思想和基本用法详解',
      filename: 'MST-核心概念分析.md',
      category: '基础概念',
      tags: ['MST', '状态管理', '核心概念'],
      lastUpdated: '2025-10-21'
    },
    {
      id: 'mst-core-concepts-simple',
      title: 'MST 核心概念通俗化讲解',
      description: '用"赛博餐厅"的生动比喻，通俗易懂地解释 MST 的7个核心概念',
      filename: 'MST-核心概念通俗化讲解.md',
      category: '基础概念',
      tags: ['MST', '通俗讲解', '核心概念', '入门教程'],
      lastUpdated: '2025-10-22'
    },
    {
      id: 'mst-plugin-system',
      title: 'MST 插件机制详解',
      description: 'MST 插件系统的完整实现，包括中间件、钩子函数、自定义类型等',
      filename: 'MST-插件机制详解.md',
      category: '高级特性',
      tags: ['插件系统', '中间件', '扩展性'],
      lastUpdated: '2025-10-21'
    },
    {
      id: 'react-mst-example',
      title: 'React+MST示例',
      description: '完整的 React + MST 项目示例，展示最佳实践和开发技巧',
      filename: 'React+MST示例.md',
      category: '实践案例',
      tags: ['React', 'MST', '示例项目'],
      lastUpdated: '2025-10-21'
    },
    {
      id: 'deepseek-notes',
      title: 'DeepSeek 开发笔记',
      description: '使用 DeepSeek AI 进行开发的经验和技巧总结',
      filename: 'deepseek.md',
      category: '开发工具',
      tags: ['AI', 'DeepSeek', '开发效率'],
      lastUpdated: '2025-10-21'
    }
  ];

  useEffect(() => {
    setDocuments(documentList);
  }, []);

  const loadDocumentContent = async (filename) => {
    setLoading(true);
    try {
      // 尝试从服务器加载文档内容
      const response = await fetch(`/Docs/${filename}`);
      if (response.ok) {
        const content = await response.text();
        setDocContent(content);
      } else {
        // 如果无法从服务器加载，使用预设内容
        setDocContent(getPresetContent(filename));
      }
    } catch (error) {
      console.error('加载文档失败:', error);
      setDocContent(getPresetContent(filename));
    } finally {
      setLoading(false);
    }
  };

  const getPresetContent = (filename) => {
    // 预设的文档内容，用于演示
    const presetContents = {
      'MST-核心概念分析.md': `# MST 核心概念分析

## 📖 概述

MobX-State-Tree (MST) 是一个功能强大的状态管理库，它结合了 MobX 的响应式特性和不可变数据的优势。

## 🔧 核心概念

### 1. Models & Types
定义数据结构和类型系统：

\`\`\`javascript
import { types } from 'mobx-state-tree';

const Task = types.model('Task', {
  id: types.identifier,
  title: types.string,
  completed: types.boolean
});
\`\`\`

### 2. Views & Computed
派生数据和计算属性：

\`\`\`javascript
const TaskStore = types.model('TaskStore', {
  tasks: types.array(Task)
}).views(self => ({
  get completedTasks() {
    return self.tasks.filter(task => task.completed);
  }
}));
\`\`\`

### 3. Actions
修改状态的方法：

\`\`\`javascript
.actions(self => ({
  addTask(title) {
    self.tasks.push({
      id: Date.now().toString(),
      title,
      completed: false
    });
  }
}));
\`\`\`

## 💡 设计思想

MST 的核心设计思想包括：

- **类型安全**: 强类型系统确保数据一致性
- **不可变性**: 状态变更通过 actions 进行
- **响应式**: 自动追踪依赖关系
- **可序列化**: 支持快照和补丁`,

      'MST-插件机制详解.md': `# MST 插件机制详解

## 📖 概述

MST 提供了强大而灵活的插件机制，支持中间件、钩子函数等多种扩展方式。

## 🔧 核心机制

### 1. Middleware 中间件系统

\`\`\`javascript
import { addMiddleware } from 'mobx-state-tree';

addMiddleware(store, (call, next) => {
  console.log('Action called:', call.name);
  return next(call);
});
\`\`\`

### 2. Hooks 钩子函数

\`\`\`javascript
import { onSnapshot, onPatch } from 'mobx-state-tree';

// 监听快照变化
onSnapshot(store, snapshot => {
  console.log('Snapshot:', snapshot);
});

// 监听补丁变化
onPatch(store, patch => {
  console.log('Patch:', patch);
});
\`\`\`

### 3. Custom Types 自定义类型

\`\`\`javascript
const DateType = types.custom({
  name: 'Date',
  fromSnapshot(value) {
    return new Date(value);
  },
  toSnapshot(value) {
    return value.toISOString();
  }
});
\`\`\`

## 🔌 插件实现

详细的插件系统实现和使用指南...`,

      'React+MST示例.md': `# React+MST示例

## 📖 项目概述

这是一个完整的 React + MST 示例项目，展示了如何在实际项目中使用 MobX-State-Tree。

## 🏗️ 项目结构

\`\`\`
src/
├── models/
│   └── TaskStore.js # MST 模型定义
├── components/
│   ├── TaskList.js
│   └── TaskStats.js
└── App.js
\`\`\`

## 🔧 MST 模型定义 (models/TaskStore.js)

\`\`\`javascript
import { types, onSnapshot, onPatch } from 'mobx-state-tree';

// 🔹 1. Models & Types: 定义任务模型的结构
const Task = types
  .model('Task', {
    id: types.identifier,
    title: types.string,
    description: types.optional(types.string, ''),
    completed: types.optional(types.boolean, false),
    createdAt: types.optional(types.Date, () => new Date()),
    syncStatus: types.optional(types.enumeration(['pending', 'syncing', 'synced', 'error']), 'pending'),
    lastSyncAt: types.maybe(types.Date)
  })
  .views(self => ({
    // 🔹 2. Views: 派生数据和计算属性
    get status() {
      return self.completed ? '已完成' : '进行中';
    },
    get daysSinceCreated() {
      const diffTime = Math.abs(new Date() - self.createdAt);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    get syncStatusText() {
      const statusMap = {
        pending: '待同步',
        syncing: '同步中',
        synced: '已同步',
        error: '同步失败'
      };
      return statusMap[self.syncStatus] || '未知状态';
    }
  }))
  .actions(self => ({
    // 🔹 3. Actions: 修改状态的方法
    toggle() {
      self.completed = !self.completed;
    },
    updateTitle(newTitle) {
      if (!newTitle || newTitle.trim().length === 0) {
        throw new Error('标题不能为空');
      }
      self.title = newTitle.trim();
    },
    setSyncStatus(status) {
      self.syncStatus = status;
      if (status === 'synced') {
        self.lastSyncAt = new Date();
      }
    }
  }));
\`\`\`

## 🎯 主要特性

1. **类型安全**: 使用 MST 的类型系统
2. **响应式更新**: 自动 UI 更新
3. **状态管理**: 集中式状态管理
4. **插件系统**: 可扩展的架构

## 🚀 运行项目

\`\`\`bash
npm install
npm start
\`\`\``,

      'deepseek.md': `# DeepSeek 开发笔记

## 🤖 关于 DeepSeek

DeepSeek 是一个强大的 AI 编程助手，能够帮助开发者提高编程效率。

## 💡 使用技巧

### 1. 清晰的问题描述
- 提供具体的需求描述
- 包含相关的技术栈信息
- 说明预期的结果

### 2. 提供足够的上下文
- 分享相关的代码片段
- 说明项目的整体架构
- 提供错误信息和日志

### 3. 分步骤进行复杂任务
- 将大任务拆分为小步骤
- 逐步验证每个步骤的结果
- 及时反馈和调整

## 🚀 最佳实践

在实际开发中的应用经验：

\`\`\`javascript
// 示例：使用 AI 辅助重构代码
const optimizedFunction = (data) => {
  // AI 建议的优化方案
  return data.filter(item => item.active)
             .map(item => ({ ...item, processed: true }));
};
\`\`\`

## 📝 开发心得

1. **保持耐心**: AI 需要时间理解复杂需求
2. **迭代改进**: 通过多轮对话完善解决方案
3. **验证结果**: 始终验证 AI 生成的代码`
    };

    return presetContents[filename] || `# 文档内容

文档正在加载中...

请稍候，我们正在为您准备文档内容。`;
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    loadDocumentContent(doc.filename);
  };

  const handleBackToList = () => {
    setSelectedDoc(null);
    setDocContent('');
  };

  // 自定义 Markdown 组件样式
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 style={{ 
        color: '#2c3e50', 
        marginTop: '30px', 
        marginBottom: '15px',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px'
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ 
        color: '#34495e', 
        marginTop: '25px', 
        marginBottom: '12px',
        borderBottom: '1px solid #bdc3c7',
        paddingBottom: '5px'
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ 
        color: '#7f8c8d', 
        marginTop: '20px', 
        marginBottom: '10px'
      }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ 
        lineHeight: '1.8', 
        marginBottom: '15px',
        color: '#2c3e50'
      }}>
        {children}
      </p>
    ),
    code: ({ inline, children }) => (
      <code style={{
        backgroundColor: inline ? codeStyles.inlineCode.backgroundColor : 'transparent',
        padding: inline ? codeStyles.inlineCode.padding : '0',
        borderRadius: inline ? codeStyles.inlineCode.borderRadius : '0',
        fontFamily: codeStyles.pre.fontFamily,
        fontSize: inline ? '0.9em' : '1em',
        color: inline ? codeStyles.inlineCode.color : 'inherit',
        border: inline ? codeStyles.inlineCode.border : 'none'
      }}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre style={codeStyles.pre}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '4px solid #3498db',
        paddingLeft: '20px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        padding: '15px 20px',
        borderRadius: '0 5px 5px 0'
      }}>
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul style={{
        paddingLeft: '20px',
        marginBottom: '15px'
      }}>
        {children}
      </ul>
    ),
    li: ({ children }) => (
      <li style={{
        marginBottom: '5px',
        lineHeight: '1.6'
      }}>
        {children}
      </li>
    )
  };

  if (selectedDoc) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #dee2e6'
      }}>
        {/* 文档头部 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #007bff'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#007bff' }}>📚 {selectedDoc.title}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              {selectedDoc.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* 主题选择器 */}
            <ThemeSelector />
            <button
              onClick={handleBackToList}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              ← 返回列表
            </button>
          </div>
        </div>

        {/* 文档元信息 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <span>📂 分类: {selectedDoc.category}</span>
          <span>📅 更新: {selectedDoc.lastUpdated}</span>
          <span>🏷️ 标签: {selectedDoc.tags.join(', ')}</span>
        </div>

        {/* 文档内容 */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          minHeight: '500px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#6c757d'
            }}>
              <div>📖 正在加载文档内容...</div>
            </div>
          ) : (
            <div style={{ lineHeight: '1.8' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {docContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0',
      border: '1px solid #dee2e6'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          color: '#495057', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📚 项目文档库
        </h3>
        {/* 在文档列表页面也显示主题选择器 */}
        <ThemeSelector />
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentSelect(doc)}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <h4 style={{ 
              margin: '0 0 10px 0', 
              color: '#007bff',
              fontSize: '16px'
            }}>
              {doc.title}
            </h4>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#6c757d',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {doc.description}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              <span>📂 {doc.category}</span>
              <span>📅 {doc.lastUpdated}</span>
            </div>
            
            <div style={{
              marginTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px'
            }}>
              {doc.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#e9ecef',
                    color: '#495057',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;