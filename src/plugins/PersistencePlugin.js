import { BasePlugin } from './BasePlugin.js';
import { onSnapshot, applySnapshot, getSnapshot } from 'mobx-state-tree';

/**
 * 持久化插件
 * 自动将 MST 状态持久化到存储介质（localStorage、sessionStorage 等）
 */
export class PersistencePlugin extends BasePlugin {
  constructor() {
    super('PersistencePlugin', '1.0.0');
    this.throttleTimer = null;
    this.lastSnapshot = null;
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      key: 'mst-store',
      storage: typeof window !== 'undefined' ? window.localStorage : null,
      whitelist: null, // 要持久化的字段列表，null 表示全部
      blacklist: [], // 不持久化的字段列表
      throttle: 1000, // 节流时间（毫秒）
      transform: {
        in: (data) => data, // 恢复时的数据转换
        out: (data) => data // 保存时的数据转换
      },
      autoRestore: true, // 是否自动恢复数据
      compress: false, // 是否压缩数据
      encrypt: false // 是否加密数据（需要提供加密函数）
    };
  }

  onInstall() {
    if (!this.options.storage) {
      throw new Error('PersistencePlugin requires a storage option');
    }

    // 自动恢复数据
    if (this.options.autoRestore) {
      this.restoreState();
    }

    // 监听状态变化并持久化
    this.setupStatePersistence();
  }

  onUninstall() {
    // 清理定时器
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
  }

  /**
   * 设置状态持久化监听
   */
  setupStatePersistence() {
    const disposer = onSnapshot(this.model, (snapshot) => {
      this.persistState(snapshot);
    });
    
    this.addDisposer(disposer);
  }

  /**
   * 持久化状态
   * @param {Object} snapshot - 状态快照
   */
  persistState(snapshot) {
    if (!this.options.enabled) return;

    // 节流处理
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
    }

    this.throttleTimer = setTimeout(() => {
      try {
        // 过滤数据
        const filteredSnapshot = this.filterSnapshot(snapshot);
        
        // 转换数据
        const transformedData = this.options.transform.out(filteredSnapshot);
        
        // 处理数据（压缩、加密等）
        const processedData = this.processData(transformedData);
        
        // 保存到存储
        this.options.storage.setItem(this.options.key, JSON.stringify(processedData));
        
        this.lastSnapshot = snapshot;
        this.log('State persisted successfully');
        
      } catch (error) {
        this.error('Failed to persist state:', error);
      }
    }, this.options.throttle);
  }

  /**
   * 恢复状态
   */
  restoreState() {
    try {
      const savedData = this.options.storage.getItem(this.options.key);
      if (!savedData) {
        this.log('No saved state found');
        return false;
      }

      const parsedData = JSON.parse(savedData);
      
      // 处理数据（解压缩、解密等）
      const processedData = this.unprocessData(parsedData);
      
      // 转换数据
      const transformedData = this.options.transform.in(processedData);
      
      // 应用快照
      applySnapshot(this.model, transformedData);
      
      this.log('State restored successfully');
      return true;
      
    } catch (error) {
      this.error('Failed to restore state:', error);
      return false;
    }
  }

  /**
   * 过滤快照数据
   * @param {Object} snapshot - 原始快照
   * @returns {Object} 过滤后的快照
   */
  filterSnapshot(snapshot) {
    let filtered = { ...snapshot };

    // 白名单过滤
    if (this.options.whitelist && Array.isArray(this.options.whitelist)) {
      const whitelisted = {};
      this.options.whitelist.forEach(key => {
        if (key in filtered) {
          whitelisted[key] = filtered[key];
        }
      });
      filtered = whitelisted;
    }

    // 黑名单过滤
    if (this.options.blacklist && Array.isArray(this.options.blacklist)) {
      this.options.blacklist.forEach(key => {
        delete filtered[key];
      });
    }

    return filtered;
  }

  /**
   * 处理数据（压缩、加密等）
   * @param {Object} data - 原始数据
   * @returns {Object} 处理后的数据
   */
  processData(data) {
    let processed = data;

    // 压缩处理
    if (this.options.compress && typeof this.options.compress === 'function') {
      processed = this.options.compress(processed);
    }

    // 加密处理
    if (this.options.encrypt && typeof this.options.encrypt === 'function') {
      processed = this.options.encrypt(processed);
    }

    return processed;
  }

  /**
   * 反处理数据（解压缩、解密等）
   * @param {Object} data - 处理过的数据
   * @returns {Object} 原始数据
   */
  unprocessData(data) {
    let unprocessed = data;

    // 解密处理
    if (this.options.decrypt && typeof this.options.decrypt === 'function') {
      unprocessed = this.options.decrypt(unprocessed);
    }

    // 解压缩处理
    if (this.options.decompress && typeof this.options.decompress === 'function') {
      unprocessed = this.options.decompress(unprocessed);
    }

    return unprocessed;
  }

  /**
   * 手动保存当前状态
   */
  save() {
    const snapshot = getSnapshot(this.model);
    this.persistState(snapshot);
  }

  /**
   * 手动恢复状态
   */
  restore() {
    return this.restoreState();
  }

  /**
   * 清除持久化数据
   */
  clear() {
    try {
      this.options.storage.removeItem(this.options.key);
      this.log('Persisted data cleared');
    } catch (error) {
      this.error('Failed to clear persisted data:', error);
    }
  }

  /**
   * 清除持久化数据 (别名方法)
   */
  clearPersistedData() {
    return this.clear();
  }

  /**
   * 检查是否有持久化数据
   * @returns {boolean} 是否有数据
   */
  hasPersistedData() {
    try {
      const data = this.options.storage.getItem(this.options.key);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 加载初始数据
   * @returns {Object|null} 初始数据或null
   */
  loadInitialData() {
    try {
      const savedData = this.options.storage.getItem(this.options.key);
      if (!savedData) {
        this.log('No saved state found');
        return null;
      }

      const parsedData = JSON.parse(savedData);
      
      // 处理数据（解压缩、解密等）
      const processedData = this.unprocessData(parsedData);
      
      // 转换数据
      const transformedData = this.options.transform.in(processedData);
      
      this.log('Initial data loaded successfully');
      return transformedData;
      
    } catch (error) {
      this.error('Failed to load initial data:', error);
      return null;
    }
  }

  /**
   * 获取持久化数据大小（字节）
   * @returns {number} 数据大小
   */
  getDataSize() {
    try {
      const data = this.options.storage.getItem(this.options.key);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取插件状态
   * @returns {Object} 插件状态
   */
  getStatus() {
    return {
      ...this.getInfo(),
      hasPersistedData: this.hasPersistedData(),
      dataSize: this.getDataSize(),
      lastSnapshot: this.lastSnapshot ? new Date().toISOString() : null
    };
  }
}