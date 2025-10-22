import { BasePlugin } from './BasePlugin.js';
import { onAction, onSnapshot, onPatch } from 'mobx-state-tree';

/**
 * 日志插件
 * 记录 MST 模型的所有操作和状态变化
 */
export class LoggerPlugin extends BasePlugin {
  constructor() {
    super('LoggerPlugin', '1.0.0');
    this.logs = [];
    this.logId = 0;
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      logActions: true,
      logSnapshots: false,
      logPatches: true,
      logLevel: 'info',
      maxLogs: 1000,
      prefix: '[MST]',
      outputToConsole: true,
      formatters: {
        action: this.formatAction.bind(this),
        snapshot: this.formatSnapshot.bind(this),
        patch: this.formatPatch.bind(this)
      },
      filters: {
        actions: [], // 要过滤的 action 名称
        paths: []    // 要过滤的路径
      }
    };
  }

  onInstall() {
    if (this.options.logActions) {
      this.setupActionLogging();
    }
    
    if (this.options.logSnapshots) {
      this.setupSnapshotLogging();
    }
    
    if (this.options.logPatches) {
      this.setupPatchLogging();
    }
  }

  onUninstall() {
    // 清理日志数据
    this.logs = [];
    this.logId = 0;
  }

  /**
   * 设置 Action 日志记录
   */
  setupActionLogging() {
    const disposer = onAction(this.model, (action) => {
      // 检查过滤器
      if (this.shouldFilterAction(action)) {
        return;
      }

      const startTime = performance.now();
      
      this.addLog('action', {
        id: action.id,
        name: action.name,
        path: action.path,
        args: this.sanitizeArgs(action.args),
        startTime: new Date(),
        status: 'started'
      });

      // 监听 action 完成
      const originalHandler = action.handler;
      action.handler = (...args) => {
        try {
          const result = originalHandler.apply(action.context, args);
          
          // 如果是 Promise，等待完成
          if (result && typeof result.then === 'function') {
            return result
              .then((res) => {
                this.logActionComplete(action, startTime, 'success', res);
                return res;
              })
              .catch((error) => {
                this.logActionComplete(action, startTime, 'error', error);
                throw error;
              });
          } else {
            this.logActionComplete(action, startTime, 'success', result);
            return result;
          }
        } catch (error) {
          this.logActionComplete(action, startTime, 'error', error);
          throw error;
        }
      };
    });
    
    this.addDisposer(disposer);
  }

  /**
   * 设置快照日志记录
   */
  setupSnapshotLogging() {
    const disposer = onSnapshot(this.model, (snapshot) => {
      this.addLog('snapshot', {
        snapshot: this.sanitizeSnapshot(snapshot),
        size: JSON.stringify(snapshot).length
      });
    });
    
    this.addDisposer(disposer);
  }

  /**
   * 设置补丁日志记录
   */
  setupPatchLogging() {
    const disposer = onPatch(this.model, (patch) => {
      // 检查路径过滤器
      if (this.shouldFilterPath(patch.path)) {
        return;
      }

      this.addLog('patch', {
        op: patch.op,
        path: patch.path,
        value: this.sanitizeValue(patch.value)
      });
    });
    
    this.addDisposer(disposer);
  }

  /**
   * 记录 Action 完成
   * @param {Object} action - Action 信息
   * @param {number} startTime - 开始时间
   * @param {string} status - 状态
   * @param {any} result - 结果或错误
   */
  logActionComplete(action, startTime, status, result) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.addLog('action', {
      id: action.id,
      name: action.name,
      path: action.path,
      duration: parseFloat(duration.toFixed(2)),
      status,
      result: status === 'error' ? this.sanitizeError(result) : this.sanitizeValue(result),
      endTime: new Date()
    });
  }

  /**
   * 添加日志条目
   * @param {string} type - 日志类型
   * @param {Object} data - 日志数据
   */
  addLog(type, data) {
    if (!this.options.enabled) return;

    const log = {
      id: ++this.logId,
      type,
      data,
      timestamp: new Date(),
      level: this.options.logLevel
    };

    this.logs.push(log);
    
    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    if (this.options.outputToConsole) {
      this.outputLog(log);
    }
  }

  /**
   * 输出日志到控制台
   * @param {Object} log - 日志对象
   */
  outputLog(log) {
    const formatter = this.options.formatters[log.type];
    const message = formatter ? formatter(log) : this.formatDefault(log);
    
    switch (log.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
      default:
        console.log(message);
        break;
    }
  }

  /**
   * 格式化 Action 日志
   * @param {Object} log - 日志对象
   * @returns {string} 格式化后的消息
   */
  formatAction(log) {
    const { data } = log;
    const prefix = `${this.options.prefix} [ACTION]`;
    
    if (data.status === 'started') {
      return `${prefix} ${data.name} started at ${data.path}`;
    } else {
      const statusIcon = data.status === 'success' ? '✅' : '❌';
      return `${prefix} ${statusIcon} ${data.name} ${data.status} (${data.duration}ms)`;
    }
  }

  /**
   * 格式化快照日志
   * @param {Object} log - 日志对象
   * @returns {string} 格式化后的消息
   */
  formatSnapshot(log) {
    const { data } = log;
    const prefix = `${this.options.prefix} [SNAPSHOT]`;
    return `${prefix} State snapshot captured (${data.size} bytes)`;
  }

  /**
   * 格式化补丁日志
   * @param {Object} log - 日志对象
   * @returns {string} 格式化后的消息
   */
  formatPatch(log) {
    const { data } = log;
    const prefix = `${this.options.prefix} [PATCH]`;
    return `${prefix} ${data.op.toUpperCase()} ${data.path}`;
  }

  /**
   * 默认格式化
   * @param {Object} log - 日志对象
   * @returns {string} 格式化后的消息
   */
  formatDefault(log) {
    const prefix = `${this.options.prefix} [${log.type.toUpperCase()}]`;
    return `${prefix} ${JSON.stringify(log.data)}`;
  }

  /**
   * 检查是否应该过滤 Action
   * @param {Object} action - Action 信息
   * @returns {boolean} 是否过滤
   */
  shouldFilterAction(action) {
    return this.options.filters.actions.includes(action.name);
  }

  /**
   * 检查是否应该过滤路径
   * @param {string} path - 路径
   * @returns {boolean} 是否过滤
   */
  shouldFilterPath(path) {
    return this.options.filters.paths.some(filterPath => 
      path.startsWith(filterPath)
    );
  }

  /**
   * 清理参数数据
   * @param {Array} args - 参数数组
   * @returns {Array} 清理后的参数
   */
  sanitizeArgs(args) {
    return args.map(arg => this.sanitizeValue(arg));
  }

  /**
   * 清理快照数据
   * @param {Object} snapshot - 快照对象
   * @returns {Object} 清理后的快照
   */
  sanitizeSnapshot(snapshot) {
    // 对于大型快照，只记录结构信息
    if (JSON.stringify(snapshot).length > 10000) {
      return { 
        _summary: 'Large snapshot (truncated)',
        keys: Object.keys(snapshot)
      };
    }
    return snapshot;
  }

  /**
   * 清理值数据
   * @param {any} value - 值
   * @returns {any} 清理后的值
   */
  sanitizeValue(value) {
    if (value === null || value === undefined) {
      return value;
    }

    // 处理函数
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    // 处理循环引用
    try {
      JSON.stringify(value);
      return value;
    } catch (error) {
      return '[Circular Reference]';
    }
  }

  /**
   * 清理错误对象
   * @param {Error} error - 错误对象
   * @returns {Object} 清理后的错误信息
   */
  sanitizeError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    return error;
  }

  /**
   * 获取日志
   * @param {string} type - 日志类型（可选）
   * @param {number} limit - 限制数量（可选）
   * @returns {Array} 日志数组
   */
  getLogs(type = null, limit = null) {
    let logs = this.logs;
    
    if (type) {
      logs = logs.filter(log => log.type === type);
    }
    
    if (limit) {
      logs = logs.slice(-limit);
    }
    
    return logs;
  }

  /**
   * 清除日志
   * @param {string} type - 日志类型（可选）
   */
  clearLogs(type = null) {
    if (type) {
      this.logs = this.logs.filter(log => log.type !== type);
    } else {
      this.logs = [];
      this.logId = 0;
    }
    this.log('Logs cleared');
  }

  /**
   * 导出日志
   * @param {string} format - 导出格式 ('json' | 'csv' | 'text')
   * @returns {string} 导出的日志数据
   */
  exportLogs(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      
      case 'csv':
        return this.exportToCsv();
      
      case 'text':
        return this.exportToText();
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * 导出为 CSV 格式
   * @returns {string} CSV 数据
   */
  exportToCsv() {
    const headers = ['ID', 'Type', 'Timestamp', 'Level', 'Data'];
    const rows = this.logs.map(log => [
      log.id,
      log.type,
      log.timestamp.toISOString(),
      log.level,
      JSON.stringify(log.data)
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * 导出为文本格式
   * @returns {string} 文本数据
   */
  exportToText() {
    return this.logs
      .map(log => {
        const formatter = this.options.formatters[log.type];
        const message = formatter ? formatter(log) : this.formatDefault(log);
        return `${log.timestamp.toISOString()} ${message}`;
      })
      .join('\n');
  }

  /**
   * 搜索日志
   * @param {string} query - 搜索查询
   * @param {Object} options - 搜索选项
   * @returns {Array} 匹配的日志
   */
  searchLogs(query, options = {}) {
    const {
      type = null,
      level = null,
      startDate = null,
      endDate = null,
      caseSensitive = false
    } = options;

    const searchQuery = caseSensitive ? query : query.toLowerCase();

    return this.logs.filter(log => {
      // 类型过滤
      if (type && log.type !== type) return false;
      
      // 级别过滤
      if (level && log.level !== level) return false;
      
      // 日期过滤
      if (startDate && log.timestamp < startDate) return false;
      if (endDate && log.timestamp > endDate) return false;
      
      // 内容搜索
      const logContent = JSON.stringify(log.data);
      const searchContent = caseSensitive ? logContent : logContent.toLowerCase();
      
      return searchContent.includes(searchQuery);
    });
  }

  /**
   * 获取日志统计
   * @returns {Object} 统计信息
   */
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byType: {},
      byLevel: {},
      timeRange: null
    };

    if (this.logs.length === 0) return stats;

    // 按类型统计
    this.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    // 时间范围
    const timestamps = this.logs.map(log => log.timestamp);
    stats.timeRange = {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps))
    };

    return stats;
  }

  /**
   * 获取插件状态
   * @returns {Object} 插件状态
   */
  getStatus() {
    return {
      ...this.getInfo(),
      logCount: this.logs.length,
      stats: this.getLogStats()
    };
  }
}