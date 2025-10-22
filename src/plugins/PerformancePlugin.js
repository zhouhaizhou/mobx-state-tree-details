import { BasePlugin } from './BasePlugin.js';
import { onAction, onPatch } from 'mobx-state-tree';

/**
 * 性能监控插件
 * 监控 MST 模型的性能指标，包括 Action 执行时间、内存使用等
 */
export class PerformancePlugin extends BasePlugin {
  constructor() {
    super('PerformancePlugin', '1.0.0');
    this.metrics = {
      actions: new Map(),
      patches: [],
      memory: [],
      startTime: Date.now()
    };
    this.reportTimer = null;
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      trackActions: true, // 跟踪 action 性能
      trackPatches: true, // 跟踪 patch 性能
      trackMemory: true,  // 跟踪内存使用
      sampleRate: 1.0,    // 采样率 (0.0 - 1.0)
      reportInterval: 60000, // 报告间隔（毫秒）
      maxMetrics: 1000,   // 最大指标数量
      onReport: null,     // 报告回调函数
      thresholds: {
        actionTime: 100,  // Action 执行时间阈值（毫秒）
        memoryUsage: 50   // 内存使用阈值（MB）
      }
    };
  }

  onInstall() {
    // 设置性能监控
    if (this.options.trackActions) {
      this.setupActionTracking();
    }

    if (this.options.trackPatches) {
      this.setupPatchTracking();
    }

    if (this.options.trackMemory) {
      this.setupMemoryTracking();
    }

    // 设置定期报告
    if (this.options.reportInterval > 0) {
      this.setupPeriodicReporting();
    }
  }

  onUninstall() {
    // 清理定时器
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    // 清理数据
    this.clearMetrics();
  }

  /**
   * 设置 Action 性能跟踪
   */
  setupActionTracking() {
    const disposer = onAction(this.model, (action) => {
      if (!this.shouldSample()) return;

      const startTime = performance.now();
      const actionName = action.name;
      const actionPath = action.path;

      // 监听 action 完成
      const originalHandler = action.handler;
      action.handler = (...args) => {
        try {
          const result = originalHandler.apply(action.context, args);
          
          // 如果是 Promise，等待完成
          if (result && typeof result.then === 'function') {
            return result.finally(() => {
              this.recordActionMetric(actionName, actionPath, startTime);
            });
          } else {
            this.recordActionMetric(actionName, actionPath, startTime);
            return result;
          }
        } catch (error) {
          this.recordActionMetric(actionName, actionPath, startTime, error);
          throw error;
        }
      };
    });

    this.addDisposer(disposer);
  }

  /**
   * 设置 Patch 性能跟踪
   */
  setupPatchTracking() {
    const disposer = onPatch(this.model, (patch) => {
      if (!this.shouldSample()) return;

      this.recordPatchMetric(patch);
    });

    this.addDisposer(disposer);
  }

  /**
   * 设置内存使用跟踪
   */
  setupMemoryTracking() {
    const trackMemory = () => {
      if (!this.shouldSample()) return;

      try {
        // 获取内存信息（如果可用）
        const memoryInfo = this.getMemoryInfo();
        if (memoryInfo) {
          this.recordMemoryMetric(memoryInfo);
        }
      } catch (error) {
        this.log('Memory tracking error:', error);
      }
    };

    // 定期跟踪内存
    const memoryTimer = setInterval(trackMemory, 5000); // 每5秒跟踪一次
    this.addDisposer(() => clearInterval(memoryTimer));
  }

  /**
   * 设置定期报告
   */
  setupPeriodicReporting() {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport();
      
      if (this.options.onReport && typeof this.options.onReport === 'function') {
        try {
          this.options.onReport(report);
        } catch (error) {
          this.error('Report callback error:', error);
        }
      }

      this.log('Performance report generated:', report);
    }, this.options.reportInterval);
  }

  /**
   * 判断是否应该采样
   * @returns {boolean} 是否采样
   */
  shouldSample() {
    return Math.random() < this.options.sampleRate;
  }

  /**
   * 记录 Action 性能指标
   * @param {string} actionName - Action 名称
   * @param {string} actionPath - Action 路径
   * @param {number} startTime - 开始时间
   * @param {Error} error - 错误信息（可选）
   */
  recordActionMetric(actionName, actionPath, startTime, error = null) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    const key = `${actionPath}/${actionName}`;
    
    if (!this.metrics.actions.has(key)) {
      this.metrics.actions.set(key, {
        name: actionName,
        path: actionPath,
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        lastExecuted: null
      });
    }

    const metric = this.metrics.actions.get(key);
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.lastExecuted = new Date();

    if (error) {
      metric.errors++;
    }

    // 检查阈值
    if (duration > this.options.thresholds.actionTime) {
      this.warn(`Slow action detected: ${key} took ${duration.toFixed(2)}ms`);
    }

    this.limitMetricsSize();
  }

  /**
   * 记录 Patch 性能指标
   * @param {Object} patch - Patch 信息
   */
  recordPatchMetric(patch) {
    const metric = {
      op: patch.op,
      path: patch.path,
      timestamp: new Date(),
      value: patch.value
    };

    this.metrics.patches.push(metric);
    this.limitMetricsSize();
  }

  /**
   * 记录内存使用指标
   * @param {Object} memoryInfo - 内存信息
   */
  recordMemoryMetric(memoryInfo) {
    const metric = {
      ...memoryInfo,
      timestamp: new Date()
    };

    this.metrics.memory.push(metric);

    // 检查内存阈值
    if (memoryInfo.usedJSHeapSize && memoryInfo.usedJSHeapSize > this.options.thresholds.memoryUsage * 1024 * 1024) {
      this.warn(`High memory usage detected: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }

    this.limitMetricsSize();
  }

  /**
   * 获取内存信息
   * @returns {Object|null} 内存信息
   */
  getMemoryInfo() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      return {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
      };
    }

    // Node.js 环境
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external
      };
    }

    return null;
  }

  /**
   * 限制指标数据大小
   */
  limitMetricsSize() {
    // 限制 patches 数量
    if (this.metrics.patches.length > this.options.maxMetrics) {
      this.metrics.patches = this.metrics.patches.slice(-this.options.maxMetrics);
    }

    // 限制 memory 数量
    if (this.metrics.memory.length > this.options.maxMetrics) {
      this.metrics.memory = this.metrics.memory.slice(-this.options.maxMetrics);
    }

    // 限制 actions 数量
    if (this.metrics.actions.size > this.options.maxMetrics) {
      const entries = Array.from(this.metrics.actions.entries());
      entries.sort((a, b) => b[1].lastExecuted - a[1].lastExecuted);
      
      this.metrics.actions.clear();
      entries.slice(0, this.options.maxMetrics).forEach(([key, value]) => {
        this.metrics.actions.set(key, value);
      });
    }
  }

  /**
   * 生成性能报告
   * @returns {Object} 性能报告
   */
  generateReport() {
    const now = Date.now();
    const uptime = now - this.metrics.startTime;

    // Action 统计
    const actionStats = this.generateActionStats();
    
    // Patch 统计
    const patchStats = this.generatePatchStats();
    
    // 内存统计
    const memoryStats = this.generateMemoryStats();

    return {
      timestamp: new Date(),
      uptime,
      actions: actionStats,
      patches: patchStats,
      memory: memoryStats,
      summary: {
        totalActions: actionStats.total,
        totalPatches: patchStats.total,
        averageActionTime: actionStats.averageTime,
        slowestAction: actionStats.slowest,
        currentMemory: memoryStats.current
      }
    };
  }

  /**
   * 生成 Action 统计
   * @returns {Object} Action 统计
   */
  generateActionStats() {
    const actions = Array.from(this.metrics.actions.values());
    
    if (actions.length === 0) {
      return { total: 0, averageTime: 0, slowest: null };
    }

    const total = actions.reduce((sum, action) => sum + action.count, 0);
    const totalTime = actions.reduce((sum, action) => sum + action.totalTime, 0);
    const averageTime = totalTime / total;

    const slowest = actions.reduce((prev, current) => 
      (current.maxTime > prev.maxTime) ? current : prev
    );

    return {
      total,
      averageTime: parseFloat(averageTime.toFixed(2)),
      slowest: {
        name: slowest.name,
        path: slowest.path,
        maxTime: parseFloat(slowest.maxTime.toFixed(2))
      },
      details: actions.map(action => ({
        name: action.name,
        path: action.path,
        count: action.count,
        averageTime: parseFloat((action.totalTime / action.count).toFixed(2)),
        minTime: parseFloat(action.minTime.toFixed(2)),
        maxTime: parseFloat(action.maxTime.toFixed(2)),
        errors: action.errors
      }))
    };
  }

  /**
   * 生成 Patch 统计
   * @returns {Object} Patch 统计
   */
  generatePatchStats() {
    const patches = this.metrics.patches;
    
    if (patches.length === 0) {
      return { total: 0, byOperation: {} };
    }

    const byOperation = patches.reduce((acc, patch) => {
      acc[patch.op] = (acc[patch.op] || 0) + 1;
      return acc;
    }, {});

    return {
      total: patches.length,
      byOperation,
      recent: patches.slice(-10) // 最近10个patch
    };
  }

  /**
   * 生成内存统计
   * @returns {Object} 内存统计
   */
  generateMemoryStats() {
    const memory = this.metrics.memory;
    
    if (memory.length === 0) {
      return { current: null, trend: null };
    }

    const current = memory[memory.length - 1];
    
    // 计算趋势（最近10个数据点）
    const recent = memory.slice(-10);
    const trend = recent.length > 1 ? 
      recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize : 0;

    return {
      current,
      trend,
      history: recent
    };
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    return this.generateReport();
  }

  /**
   * 清除性能数据
   */
  clearPerformanceData() {
    this.metrics.actions.clear();
    this.metrics.patches = [];
    this.metrics.memory = [];
    this.metrics.startTime = Date.now();
    this.log('Performance data cleared');
  }

  /**
   * 清除指标数据
   */
  clearMetrics() {
    this.clearPerformanceData();
  }

  /**
   * 获取插件状态
   * @returns {Object} 插件状态
   */
  getStatus() {
    return {
      ...this.getInfo(),
      metricsCount: {
        actions: this.metrics.actions.size,
        patches: this.metrics.patches.length,
        memory: this.metrics.memory.length
      },
      uptime: Date.now() - this.metrics.startTime
    };
  }
}