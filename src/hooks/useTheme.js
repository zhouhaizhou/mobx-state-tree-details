import { useState, useEffect } from 'react';

// 可用的代码高亮主题配置
export const AVAILABLE_THEMES = {
  'vs2015': {
    name: 'VS2015 (深色)',
    type: 'dark',
    cssFile: 'vs2015.css',
    description: '类似 Visual Studio 的深色主题，专业且护眼'
  },
  'github': {
    name: 'GitHub (浅色)',
    type: 'light', 
    cssFile: 'github.css',
    description: '清爽的浅色主题，适合白天使用'
  },
  'monokai': {
    name: 'Monokai (深色)',
    type: 'dark',
    cssFile: 'monokai.css', 
    description: '经典的深色主题，高对比度配色'
  },
  'atom-one-dark': {
    name: 'Atom One Dark',
    type: 'dark',
    cssFile: 'atom-one-dark.css',
    description: 'Atom 编辑器的深色主题'
  },
  'atom-one-light': {
    name: 'Atom One Light', 
    type: 'light',
    cssFile: 'atom-one-light.css',
    description: 'Atom 编辑器的浅色主题'
  },
  'dracula': {
    name: 'Dracula (深色)',
    type: 'dark',
    cssFile: 'dracula.css',
    description: '流行的紫色调深色主题'
  }
};

// 默认主题
const DEFAULT_THEME = 'vs2015';

// 主题对应的代码块样式配置
export const getCodeBlockStyles = (themeKey) => {
  const theme = AVAILABLE_THEMES[themeKey];
  
  if (theme.type === 'dark') {
    return {
      pre: {
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '20px',
        borderRadius: '8px',
        overflow: 'auto',
        margin: '15px 0',
        border: '1px solid #3c3c3c',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      },
      inlineCode: {
        backgroundColor: '#2d2d2d',
        color: '#f8f8f2',
        padding: '3px 6px',
        borderRadius: '4px',
        border: '1px solid #404040'
      }
    };
  } else {
    return {
      pre: {
        backgroundColor: '#f8f9fa',
        color: '#24292e',
        padding: '20px',
        borderRadius: '8px',
        overflow: 'auto',
        margin: '15px 0',
        border: '1px solid #e1e4e8',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      },
      inlineCode: {
        backgroundColor: '#f3f4f6',
        color: '#d73a49',
        padding: '3px 6px',
        borderRadius: '4px',
        border: '1px solid #e1e4e8'
      }
    };
  }
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // 从 localStorage 读取保存的主题，如果没有则使用默认主题
    const savedTheme = localStorage.getItem('code-highlight-theme');
    return savedTheme && AVAILABLE_THEMES[savedTheme] ? savedTheme : DEFAULT_THEME;
  });

  // 动态加载 CSS 文件
  useEffect(() => {
    const loadThemeCSS = async () => {
      // 移除之前的主题样式
      const existingLink = document.querySelector('link[data-highlight-theme]');
      if (existingLink) {
        existingLink.remove();
      }

      // 加载新的主题样式
      const theme = AVAILABLE_THEMES[currentTheme];
      if (theme) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme.cssFile}`;
        link.setAttribute('data-highlight-theme', currentTheme);
        document.head.appendChild(link);
      }
    };

    loadThemeCSS();
  }, [currentTheme]);

  const changeTheme = (themeKey) => {
    if (AVAILABLE_THEMES[themeKey]) {
      setCurrentTheme(themeKey);
      // 保存到 localStorage
      localStorage.setItem('code-highlight-theme', themeKey);
    }
  };

  const getCurrentThemeInfo = () => {
    return AVAILABLE_THEMES[currentTheme];
  };

  const getCodeStyles = () => {
    return getCodeBlockStyles(currentTheme);
  };

  return {
    currentTheme,
    changeTheme,
    getCurrentThemeInfo,
    getCodeStyles,
    availableThemes: AVAILABLE_THEMES
  };
};