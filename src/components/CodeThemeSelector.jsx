import React from 'react';

const CodeThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: 'github', name: 'GitHub Dark', description: 'GitHub 深色主题' },
    { id: 'vscode', name: 'VS Code Dark', description: 'VS Code 深色主题' }
  ];

  return (
    <div style={{
      background: '#f6f8fa',
      border: '1px solid #d0d7de',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#24292f'
      }}>
        🎨 代码主题选择
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            style={{
              background: currentTheme === theme.id ? '#0969da' : '#ffffff',
              color: currentTheme === theme.id ? '#ffffff' : '#24292f',
              border: `1px solid ${currentTheme === theme.id ? '#0969da' : '#d0d7de'}`,
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              if (currentTheme !== theme.id) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#8b949e';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTheme !== theme.id) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d0d7de';
              }
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
              {theme.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.7,
              textAlign: 'center'
            }}>
              {theme.description}
            </div>
          </button>
        ))}
      </div>
      
      <div style={{
        marginTop: '12px',
        fontSize: '13px',
        color: '#656d76',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>💡</span>
        <span>选择不同的主题来改变代码块的配色方案</span>
      </div>
    </div>
  );
};

export default CodeThemeSelector;