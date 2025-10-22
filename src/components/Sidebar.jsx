import React, { useState } from 'react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      id: 'core-concepts',
      title: 'MST核心概念解读及示例',
      icon: '📚',
      description: 'MobX-State-Tree 核心概念、设计思想和基本用法'
    },
    {
      id: 'flow-demo',
      title: 'Flow模式异步处理案例',
      icon: '🔄',
      description: 'Flow 模式在异步操作中的应用和最佳实践'
    },
    {
      id: 'plugin-system',
      title: 'MST插件系统介绍及演示',
      icon: '🔌',
      description: '插件系统架构、实现原理和实际应用演示'
    },
    {
      id: 'document-library',
      title: '项目文档库',
      icon: '📖',
      description: '完整的项目文档、API 参考和开发指南'
    }
  ];

  const handleItemClick = (itemId) => {
    onSectionChange(itemId);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div style={{
      width: isCollapsed ? '60px' : '280px',
      minHeight: '100vh',
      backgroundColor: '#2c3e50',
      color: 'white',
      transition: 'width 0.3s ease',
      position: 'relative',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }}>
      {/* 折叠按钮 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '-15px',
        width: '30px',
        height: '30px',
        backgroundColor: '#34495e',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }} onClick={toggleSidebar}>
        <span style={{ 
          fontSize: '14px',
          transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ◀
        </span>
      </div>

      {/* 侧边栏头部 */}
      <div style={{
        padding: isCollapsed ? '20px 10px' : '20px',
        borderBottom: '1px solid #34495e',
        textAlign: 'center'
      }}>
        {!isCollapsed ? (
          <>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px',
              color: '#ecf0f1'
            }}>
              🔌 MST 演示系统
            </h2>
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '12px',
              color: '#bdc3c7',
              lineHeight: '1.4'
            }}>
              完整的插件系统架构演示
            </p>
          </>
        ) : (
          <div style={{ fontSize: '24px' }}>🔌</div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav style={{ padding: isCollapsed ? '10px 5px' : '20px 0' }}>
        {navigationItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            style={{
              padding: isCollapsed ? '15px 10px' : '15px 20px',
              margin: isCollapsed ? '5px 0' : '0',
              cursor: 'pointer',
              backgroundColor: activeSection === item.id ? '#3498db' : 'transparent',
              borderLeft: activeSection === item.id ? '4px solid #2980b9' : '4px solid transparent',
              transition: 'all 0.3s ease',
              borderRadius: isCollapsed ? '8px' : '0',
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? '0' : '12px'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.target.style.backgroundColor = '#34495e';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ 
              fontSize: '20px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {item.icon}
            </span>
            
            {!isCollapsed && (
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: activeSection === item.id ? '600' : '400',
                  marginBottom: '4px',
                  lineHeight: '1.3'
                }}>
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  color: '#bdc3c7',
                  lineHeight: '1.3'
                }}>
                  {item.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 底部信息 */}
      {!isCollapsed && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '15px',
          backgroundColor: '#34495e',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#bdc3c7',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#ecf0f1' }}>MST 插件系统</strong>
          </div>
          <div>
            完整的状态管理解决方案
          </div>
          <div style={{ 
            marginTop: '8px',
            fontSize: '10px',
            color: '#95a5a6'
          }}>
            v1.0.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;