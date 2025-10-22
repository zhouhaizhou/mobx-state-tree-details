import React, { useState, useEffect } from 'react';

const DocumentViewer = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 文档列表配置
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
      id: 'mst-plugin-system',
      title: 'MST 插件机制详解',
      description: 'MST 插件系统的完整实现，包括中间件、钩子函数、自定义类型等',
      filename: 'MST-插件机制详解.md',
      category: '高级特性',
      tags: ['插件系统', '中间件', '扩展性'],
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
      // 模拟加载文档内容
      // 在实际应用中，这里会从服务器或本地文件系统加载
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
MobX-State-Tree (MST) 是一个功能强大的状态管理库...

## 🔧 核心概念
1. **Models**: 定义数据结构
2. **Views**: 派生数据和计算属性
3. **Actions**: 修改状态的方法
4. **Snapshots**: 状态快照
5. **Patches**: 状态变化记录

## 💡 设计思想
MST 结合了 MobX 的响应式特性和不可变数据的优势...`,

      'MST-插件机制详解.md': `# MST 插件机制详解

## 📖 概述
MST 提供了强大而灵活的插件机制，支持中间件、钩子函数等多种扩展方式...

## 🔧 核心机制
1. **Middleware**: 中间件系统
2. **Hooks**: 钩子函数
3. **Custom Types**: 自定义类型
4. **Mixins**: 混入模式

## 🔌 插件实现
详细的插件系统实现和使用指南...`,

      'deepseek.md': `# DeepSeek 开发笔记

## 🤖 关于 DeepSeek
DeepSeek 是一个强大的 AI 编程助手...

## 💡 使用技巧
1. 清晰的问题描述
2. 提供足够的上下文
3. 分步骤进行复杂任务

## 🚀 最佳实践
在实际开发中的应用经验...`
    };

    return presetContents[filename] || '# 文档内容\n\n文档正在加载中...';
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    loadDocumentContent(doc.filename);
  };

  const handleBackToList = () => {
    setSelectedDoc(null);
    setDocContent('');
  };

  const renderMarkdown = (content) => {
    // 简单的 Markdown 渲染（实际项目中建议使用专业的 Markdown 解析库）
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} style={{ color: '#2c3e50', marginTop: '30px', marginBottom: '15px' }}>{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} style={{ color: '#34495e', marginTop: '25px', marginBottom: '12px' }}>{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} style={{ color: '#7f8c8d', marginTop: '20px', marginBottom: '10px' }}>{line.substring(4)}</h3>;
        }
        if (line.startsWith('```')) {
          return <div key={index} style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '14px',
            margin: '10px 0',
            overflow: 'auto'
          }}>代码块</div>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} style={{ lineHeight: '1.6', marginBottom: '10px' }}>{line}</p>;
      });
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
          <button
            onClick={handleBackToList}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← 返回列表
          </button>
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
              {renderMarkdown(docContent)}
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
      <h3 style={{ 
        color: '#495057', 
        marginTop: 0,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        📚 项目文档库
        <span style={{
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#6c757d'
        }}>
          ({documents.length} 篇文档)
        </span>
      </h3>

      {/* 文档分类统计 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap'
        }}>
          {['基础概念', '高级特性', '开发工具'].map(category => {
            const count = documents.filter(doc => doc.category === category).length;
            return (
              <span
                key={category}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#e7f3ff',
                  color: '#0056b3',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {category} ({count})
              </span>
            );
          })}
        </div>
      </div>

      {/* 文档列表 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '15px'
      }}>
        {documents.map(doc => (
          <div
            key={doc.id}
            onClick={() => handleDocumentSelect(doc)}
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.target.style.borderColor = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            {/* 文档标题 */}
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#2c3e50',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {doc.title}
            </h4>

            {/* 文档描述 */}
            <p style={{
              margin: '0 0 15px 0',
              color: '#6c757d',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {doc.description}
            </p>

            {/* 文档元信息 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  📂 {doc.category}
                </span>
                <span>📅 {doc.lastUpdated}</span>
              </div>
              <div style={{
                color: '#007bff',
                fontWeight: 'bold'
              }}>
                点击查看 →
              </div>
            </div>

            {/* 标签 */}
            <div style={{
              marginTop: '12px',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {doc.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#e7f3ff',
                    color: '#0056b3',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 添加文档提示 */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '6px',
        border: '1px solid #007bff',
        fontSize: '14px',
        color: '#0056b3'
      }}>
        💡 <strong>提示:</strong> 点击任意文档卡片可以查看详细内容。文档支持 Markdown 格式，包含代码示例和详细说明。
      </div>
    </div>
  );
};

export default DocumentViewer;