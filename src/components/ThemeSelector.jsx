import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeSelector = () => {
  const { currentTheme, changeTheme, getCurrentThemeInfo, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeInfo = getCurrentThemeInfo();

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 主题选择按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#495057',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#e9ecef';
          e.target.style.borderColor = '#adb5bd';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.borderColor = '#dee2e6';
        }}
      >
        <span style={{ fontSize: '16px' }}>🎨</span>
        <span>{currentThemeInfo.name}</span>
        <span style={{ 
          fontSize: '12px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {/* 主题选择下拉菜单 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '280px'
        }}>
          <div style={{
            padding: '8px 0'
          }}>
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              color: '#6c757d',
              fontWeight: '600',
              borderBottom: '1px solid #f1f3f4',
              marginBottom: '4px'
            }}>
              选择代码高亮主题
            </div>
            
            {Object.entries(availableThemes).map(([themeKey, theme]) => (
              <div
                key={themeKey}
                onClick={() => handleThemeChange(themeKey)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: currentTheme === themeKey ? '#e3f2fd' : 'transparent',
                  borderLeft: currentTheme === themeKey ? '3px solid #2196f3' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentTheme !== themeKey) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== themeKey) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: currentTheme === themeKey ? '600' : '400',
                    color: currentTheme === themeKey ? '#1976d2' : '#212529'
                  }}>
                    {theme.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    backgroundColor: theme.type === 'dark' ? '#37474f' : '#f5f5f5',
                    color: theme.type === 'dark' ? 'white' : '#616161'
                  }}>
                    {theme.type === 'dark' ? '🌙 深色' : '☀️ 浅色'}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  lineHeight: '1.4'
                }}>
                  {theme.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSelector;