/**
 * MST 插件基类
 * 提供插件的基础结构和生命周期管理
 */
export class BasePlugin {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.installed = false;
    this.model = null;
    this.options = {};
    this.disposers = [];
  }

  /**
   * 安装插件到模型
   * @param {Object} model - MST 模型实例
   * @param {Object} options - 插件配置选项
   * @returns {BasePlugin} 插件实例
   */
  install(model, options = {}) {
    if (this.installed) {
      throw new Error(`Plugin ${this.name} is already installed`);
    }

    this.model = model;
    this.options = { ...this.getDefaultOptions(), ...options };
    this.installed = true;

    try {
      // 执行安装逻辑
      this.onInstall();
      this.log(`Plugin ${this.name} v${this.version} installed successfully`);
    } catch (error) {
      this.installed = false;
      this.model = null;
      this.options = {};
      throw new Error(`Failed to install plugin ${this.name}: ${error.message}`);
    }
    
    return this;
  }

  /**
   * 卸载插件
   */
  uninstall() {
    if (!this.installed) return;

    try {
      // 清理资源
      this.disposers.forEach(dispose => {
        if (typeof dispose === 'function') {
          dispose();
        }
      });
      this.disposers = [];
      
      // 执行卸载逻辑
      this.onUninstall();
      
      this.log(`Plugin ${this.name} uninstalled successfully`);
    } catch (error) {
      console.error(`Error uninstalling plugin ${this.name}:`, error);
    } finally {
      this.installed = false;
      this.model = null;
      this.options = {};
    }
  }

  /**
   * 获取默认配置选项
   * 子类应该重写此方法
   * @returns {Object} 默认配置
   */
  getDefaultOptions() {
    return {
      debug: false,
      enabled: true
    };
  }

  /**
   * 插件安装时的钩子方法
   * 子类应该重写此方法来实现具体的安装逻辑
   */
  onInstall() {
    // 子类实现
  }

  /**
   * 插件卸载时的钩子方法
   * 子类应该重写此方法来实现具体的卸载逻辑
   */
  onUninstall() {
    // 子类实现
  }

  /**
   * 添加需要在卸载时清理的资源
   * @param {Function} disposer - 清理函数
   */
  addDisposer(disposer) {
    if (typeof disposer === 'function') {
      this.disposers.push(disposer);
    }
  }

  /**
   * 日志输出
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  log(message, ...args) {
    if (this.options.debug) {
      console.log(`[${this.name}]`, message, ...args);
    }
  }

  /**
   * 错误日志输出
   * @param {string} message - 错误消息
   * @param {...any} args - 额外参数
   */
  error(message, ...args) {
    console.error(`[${this.name}] ERROR:`, message, ...args);
  }

  /**
   * 警告日志输出
   * @param {string} message - 警告消息
   * @param {...any} args - 额外参数
   */
  warn(message, ...args) {
    console.warn(`[${this.name}] WARN:`, message, ...args);
  }

  /**
   * 检查插件是否已安装
   * @returns {boolean} 是否已安装
   */
  isInstalled() {
    return this.installed;
  }

  /**
   * 获取插件信息
   * @returns {Object} 插件信息
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      installed: this.installed,
      options: { ...this.options }
    };
  }
}