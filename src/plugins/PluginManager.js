/**
 * MST 插件管理器
 * 负责插件的注册、卸载和生命周期管理
 */
export class PluginManager {
  constructor(model, environment = 'development') {
    this.model = model;
    this.environment = environment;
    this.plugins = new Map();
    this.hooks = new Map();
    this.initialized = false;
  }

  /**
   * 初始化插件管理器
   */
  initialize() {
    if (this.initialized) {
      console.warn('PluginManager is already initialized');
      return this;
    }

    this.initialized = true;
    this.log('PluginManager initialized');
    this.triggerHook('manager:initialized', { manager: this });
    
    return this;
  }

  /**
   * 注册插件
   * @param {BasePlugin} plugin - 插件实例
   * @param {Object} options - 插件配置选项
   * @returns {PluginManager} 插件管理器实例
   */
  register(plugin, options = {}) {
    if (!plugin || typeof plugin.install !== 'function') {
      throw new Error('Invalid plugin: must have an install method');
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    // 检查环境兼容性
    if (options.environments && !options.environments.includes(this.environment)) {
      this.log(`Plugin ${plugin.name} skipped in ${this.environment} environment`);
      return this;
    }

    try {
      // 安装插件
      const installedPlugin = plugin.install(this.model, options);
      this.plugins.set(plugin.name, installedPlugin);
      
      this.log(`Plugin ${plugin.name} registered successfully`);
      
      // 触发钩子
      this.triggerHook('plugin:registered', { 
        plugin: installedPlugin, 
        manager: this 
      });
      
    } catch (error) {
      this.error(`Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }

    return this;
  }

  /**
   * 卸载插件
   * @param {string} pluginName - 插件名称
   * @returns {PluginManager} 插件管理器实例
   */
  unregister(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.warn(`Plugin ${pluginName} is not registered`);
      return this;
    }

    try {
      // 触发卸载前钩子
      this.triggerHook('plugin:before-unregister', { 
        plugin, 
        pluginName, 
        manager: this 
      });

      plugin.uninstall();
      this.plugins.delete(pluginName);
      
      this.log(`Plugin ${pluginName} unregistered successfully`);
      
      // 触发卸载后钩子
      this.triggerHook('plugin:unregistered', { 
        pluginName, 
        manager: this 
      });
      
    } catch (error) {
      this.error(`Failed to unregister plugin ${pluginName}:`, error);
    }

    return this;
  }

  /**
   * 获取插件实例
   * @param {string} pluginName - 插件名称
   * @returns {BasePlugin|undefined} 插件实例
   */
  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  /**
   * 检查插件是否已注册
   * @param {string} pluginName - 插件名称
   * @returns {boolean} 是否已注册
   */
  hasPlugin(pluginName) {
    return this.plugins.has(pluginName);
  }

  /**
   * 列出所有已注册的插件名称
   * @returns {string[]} 插件名称列表
   */
  listPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * 获取插件信息
   * @param {string} pluginName - 插件名称
   * @returns {Object|null} 插件信息
   */
  getPluginInfo(pluginName) {
    const plugin = this.plugins.get(pluginName);
    return plugin ? plugin.getInfo() : null;
  }

  /**
   * 获取所有插件信息
   * @returns {Object[]} 所有插件信息
   */
  getAllPluginInfo() {
    return Array.from(this.plugins.values()).map(plugin => plugin.getInfo());
  }

  /**
   * 添加钩子监听器
   * @param {string} hookName - 钩子名称
   * @param {Function} callback - 回调函数
   */
  addHook(hookName, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Hook callback must be a function');
    }

    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }

  /**
   * 移除钩子监听器
   * @param {string} hookName - 钩子名称
   * @param {Function} callback - 回调函数
   */
  removeHook(hookName, callback) {
    const callbacks = this.hooks.get(hookName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发钩子
   * @param {string} hookName - 钩子名称
   * @param {any} data - 传递给钩子的数据
   */
  triggerHook(hookName, data) {
    const callbacks = this.hooks.get(hookName) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.error(`Hook ${hookName} callback error:`, error);
      }
    });
  }

  /**
   * 批量注册插件
   * @param {Array} pluginConfigs - 插件配置数组
   * @returns {PluginManager} 插件管理器实例
   */
  registerMultiple(pluginConfigs) {
    if (!Array.isArray(pluginConfigs)) {
      throw new Error('pluginConfigs must be an array');
    }

    pluginConfigs.forEach(config => {
      if (!config.plugin) {
        throw new Error('Plugin config must have a plugin property');
      }
      this.register(config.plugin, config.options || {});
    });

    return this;
  }

  /**
   * 清理所有插件和资源
   */
  dispose() {
    // 卸载所有插件
    const pluginNames = Array.from(this.plugins.keys());
    pluginNames.forEach(name => this.unregister(name));
    
    // 清理钩子
    this.hooks.clear();
    
    // 重置状态
    this.initialized = false;
    
    this.log('PluginManager disposed');
    this.triggerHook('manager:disposed', { manager: this });
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      totalPlugins: this.plugins.size,
      environment: this.environment,
      initialized: this.initialized,
      plugins: this.getAllPluginInfo(),
      hooks: Array.from(this.hooks.keys())
    };
  }

  /**
   * 重新加载插件
   * @param {string} pluginName - 插件名称
   * @param {BasePlugin} newPlugin - 新的插件实例
   * @param {Object} options - 插件配置选项
   */
  reload(pluginName, newPlugin, options = {}) {
    if (this.hasPlugin(pluginName)) {
      this.unregister(pluginName);
    }
    this.register(newPlugin, options);
  }

  /**
   * 启用插件
   * @param {string} pluginName - 插件名称
   */
  enable(pluginName) {
    const plugin = this.getPlugin(pluginName);
    if (plugin && plugin.options) {
      plugin.options.enabled = true;
      this.log(`Plugin ${pluginName} enabled`);
    }
  }

  /**
   * 禁用插件
   * @param {string} pluginName - 插件名称
   */
  disable(pluginName) {
    const plugin = this.getPlugin(pluginName);
    if (plugin && plugin.options) {
      plugin.options.enabled = false;
      this.log(`Plugin ${pluginName} disabled`);
    }
  }

  /**
   * 日志输出
   * @param {string} message - 日志消息
   * @param {...any} args - 额外参数
   */
  log(message, ...args) {
    console.log('[PluginManager]', message, ...args);
  }

  /**
   * 错误日志输出
   * @param {string} message - 错误消息
   * @param {...any} args - 额外参数
   */
  error(message, ...args) {
    console.error('[PluginManager] ERROR:', message, ...args);
  }

  /**
   * 警告日志输出
   * @param {string} message - 警告消息
   * @param {...any} args - 额外参数
   */
  warn(message, ...args) {
    console.warn('[PluginManager] WARN:', message, ...args);
  }
}