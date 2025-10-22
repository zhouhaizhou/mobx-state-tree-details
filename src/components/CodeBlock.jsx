import React, { useState } from 'react';

const CodeBlock = ({ 
  code, 
  language = 'javascript', 
  title,
  gradientColors = ['#667eea', '#764ba2'],
  showLineNumbers = true,
  copyable = true,
  compact = false, // 新增紧凑模式
  theme = 'github' // 新增主题参数
}) => {
  const [copied, setCopied] = useState(false);

  // 语法高亮主题配色
  const themes = {
    github: {
      background: '#0d1117',
      border: '#30363d',
      text: '#e6edf3',
      keyword: '#ff7b72',      // 关键字 - 红色
      string: '#a5d6ff',       // 字符串 - 蓝色
      comment: '#8b949e',      // 注释 - 灰色
      number: '#79c0ff',       // 数字 - 亮蓝色
      function: '#d2a8ff',     // 函数 - 紫色
      variable: '#ffa657',     // 变量 - 橙色
      operator: '#ff7b72',     // 操作符 - 红色
      property: '#79c0ff',     // 属性 - 蓝色
      type: '#7ee787',         // 类型 - 绿色
      punctuation: '#e6edf3'   // 标点符号 - 白色
    },
    vscode: {
      background: '#1e1e1e',
      border: '#3c3c3c',
      text: '#d4d4d4',
      keyword: '#569cd6',      // 关键字 - 蓝色
      string: '#ce9178',       // 字符串 - 橙色
      comment: '#6a9955',      // 注释 - 绿色
      number: '#b5cea8',       // 数字 - 浅绿色
      function: '#dcdcaa',     // 函数 - 黄色
      variable: '#9cdcfe',     // 变量 - 浅蓝色
      operator: '#d4d4d4',     // 操作符 - 白色
      property: '#9cdcfe',     // 属性 - 浅蓝色
      type: '#4ec9b0',         // 类型 - 青色
      punctuation: '#d4d4d4'   // 标点符号 - 白色
    }
  };

  // 当前使用的主题
  const currentTheme = themes[theme] || themes.github;

  // 语法高亮函数
  const highlightCode = (code, lang = language) => {
    try {
      // 简化的语法高亮实现，避免复杂的 token 替换
      const lines = code.split('\n');
      
      return lines.map((line, lineIndex) => {
        // 对每一行进行语法高亮
        const highlightLine = (text) => {
          const parts = [];
          let remaining = text;
          let partIndex = 0;
          
          // 语法规则 - 按优先级排序
          const rules = [
            // 注释 (最高优先级)
            { pattern: /\/\/.*$/g, className: 'comment' },
            { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment' },
            // 字符串
            { pattern: /"([^"\\]|\\.)*"/g, className: 'string' },
            { pattern: /'([^'\\]|\\.)*'/g, className: 'string' },
            { pattern: /`([^`\\]|\\.)*`/g, className: 'string' },
            // 数字
            { pattern: /\b\d+\.?\d*\b/g, className: 'number' },
            // 关键字
            { pattern: /\b(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|extends|import|export|from|default|async|await|typeof|instanceof|in|of|delete|void|null|undefined|true|false|get|set|static|public|private|protected)\b/g, className: 'keyword' },
            // 类型 (types.xxx)
            { pattern: /\btypes\.[a-zA-Z_$][a-zA-Z0-9_$]*/g, className: 'type' },
            // 函数调用
            { pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/g, className: 'function' },
            // 属性访问
            { pattern: /\.[a-zA-Z_$][a-zA-Z0-9_$]*/g, className: 'property' }
          ];
          
          // 创建一个包含所有匹配项的数组
          const matches = [];
          rules.forEach((rule, ruleIndex) => {
            let match;
            const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
            while ((match = regex.exec(text)) !== null) {
              matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                className: rule.className,
                priority: ruleIndex
              });
            }
          });
          
          // 按位置排序，优先级高的覆盖优先级低的
          matches.sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start;
            return a.priority - b.priority;
          });
          
          // 移除重叠的匹配项
          const filteredMatches = [];
          let lastEnd = 0;
          matches.forEach(match => {
            if (match.start >= lastEnd) {
              filteredMatches.push(match);
              lastEnd = match.end;
            }
          });
          
          // 构建结果
          let currentIndex = 0;
          filteredMatches.forEach((match, index) => {
            // 添加匹配前的普通文本
            if (match.start > currentIndex) {
              const plainText = text.slice(currentIndex, match.start);
              if (plainText) {
                parts.push(
                  <span key={`${lineIndex}-plain-${partIndex++}`} style={{ color: currentTheme.text }}>
                    {plainText}
                  </span>
                );
              }
            }
            
            // 添加高亮的匹配文本
            parts.push(
              <span 
                key={`${lineIndex}-${match.className}-${partIndex++}`}
                style={{ color: currentTheme[match.className] || currentTheme.text }}
              >
                {match.text}
              </span>
            );
            
            currentIndex = match.end;
          });
          
          // 添加剩余的普通文本
          if (currentIndex < text.length) {
            const remainingText = text.slice(currentIndex);
            if (remainingText) {
              parts.push(
                <span key={`${lineIndex}-remaining-${partIndex++}`} style={{ color: currentTheme.text }}>
                  {remainingText}
                </span>
              );
            }
          }
          
          return parts.length > 0 ? parts : [
            <span key={`${lineIndex}-fallback`} style={{ color: currentTheme.text }}>
              {text}
            </span>
          ];
        };
        
        const highlightedLine = highlightLine(line);
        
        return (
          <div key={`line-${lineIndex}`}>
            {highlightedLine}
            {lineIndex < lines.length - 1 && '\n'}
          </div>
        );
      });
    } catch (error) {
      console.error('语法高亮出错:', error);
      // 出错时返回原始代码
      return <span style={{ color: currentTheme.text }}>{code}</span>;
    }
  };

  // 复制代码功能
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 处理行号
  const lines = code.split('\n');
  const maxLineNumberWidth = String(lines.length).length;

  // 紧凑模式渲染 - 带语法高亮
  if (compact) {
    return (
      <div style={{
        background: currentTheme.background,
        borderRadius: '6px',
        marginBottom: '16px',
        border: `1px solid ${currentTheme.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
      }}>
        {/* 代码内容 - 带语法高亮 */}
        <div style={{
          padding: '16px',
          overflow: 'auto'
        }}>
          <pre style={{
            margin: 0,
            fontSize: '14px',
            color: currentTheme.text,
            fontFamily: 'inherit',
            lineHeight: '1.45',
            fontWeight: '400',
            whiteSpace: 'pre',
            wordBreak: 'normal',
            overflowWrap: 'normal'
          }}>
            <code style={{
              color: currentTheme.text,
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}>
              {highlightCode(code)}
            </code>
          </pre>
        </div>
        
        {/* 复制按钮 - 主题化 */}
        {copyable && (
          <button
            onClick={copyToClipboard}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#21262d',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '5px 8px',
              color: copied ? currentTheme.keyword : '#7d8590',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#30363d';
              e.target.style.color = currentTheme.text;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#21262d';
              e.target.style.color = copied ? currentTheme.keyword : '#7d8590';
            }}
          >
            {copied ? '✓ 复制' : '复制'}
          </button>
        )}
      </div>
    );
  }

  // 标准模式渲染
  return (
    <div style={{
      background: themes.vscode.background,
      borderRadius: '8px',
      marginBottom: '16px',
      border: `1px solid ${themes.vscode.border}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace'
    }}>
      {/* 头部工具栏 */}
      <div style={{
        background: '#2d2d2d',
        padding: '8px 16px',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff5f57'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffbd2e'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#28ca42'
          }}></div>
          {title && (
            <span style={{
              marginLeft: '12px',
              fontSize: '12px',
              color: '#cccccc',
              fontWeight: '500'
            }}>
              {title}
            </span>
          )}
        </div>
        
        {copyable && (
          <button
            onClick={copyToClipboard}
            style={{
              background: 'transparent',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '4px 8px',
              color: copied ? '#28ca42' : '#cccccc',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        )}
      </div>

      {/* 代码内容区域 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#1e1e1e'
      }}>
        {/* 行号 */}
        {showLineNumbers && (
          <div style={{
            padding: '16px 8px 16px 16px',
            backgroundColor: '#252526',
            borderRight: '1px solid #3c3c3c',
            minWidth: `${maxLineNumberWidth * 8 + 16}px`,
            textAlign: 'right',
            userSelect: 'none'
          }}>
            {lines.map((_, index) => (
              <div
                key={index}
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#858585',
                  fontFamily: 'inherit'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* 代码内容 */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}>
          <pre style={{
            margin: 0,
            fontSize: '13px',
            color: themes.vscode.text,
            fontFamily: 'inherit',
            lineHeight: '1.5',
            fontWeight: '400',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {highlightCode(code)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;