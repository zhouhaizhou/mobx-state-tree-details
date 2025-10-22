import { BasePlugin } from './BasePlugin.js';
import { onPatch } from 'mobx-state-tree';

/**
 * 验证插件
 * 为 MST 模型提供数据验证功能
 */
export class ValidationPlugin extends BasePlugin {
  constructor() {
    super('ValidationPlugin', '1.0.0');
    this.validators = new Map();
    this.validationErrors = new Map();
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      validateOn: ['change'], // 验证触发时机: 'change', 'blur', 'submit'
      rules: {}, // 验证规则
      messages: {}, // 自定义错误消息
      stopOnFirstError: false, // 是否在第一个错误时停止验证
      onValidationChange: null, // 验证状态变化回调
      customValidators: {} // 自定义验证器
    };
  }

  onInstall() {
    // 注册内置验证器
    this.registerBuiltinValidators();
    
    // 注册自定义验证器
    this.registerCustomValidators();
    
    // 设置验证规则
    this.setupValidationRules();
    
    // 监听数据变化
    if (this.options.validateOn.includes('change')) {
      this.setupChangeValidation();
    }
  }

  onUninstall() {
    // 清理验证数据
    this.validators.clear();
    this.validationErrors.clear();
  }

  /**
   * 注册内置验证器
   */
  registerBuiltinValidators() {
    // 必填验证
    this.registerValidator('required', (value, rule) => {
      if (rule.required === false) return true;
      
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      
      return true;
    });

    // 最小长度验证
    this.registerValidator('minLength', (value, rule) => {
      if (!rule.minLength) return true;
      if (!value) return true; // 由 required 验证器处理
      
      const length = typeof value === 'string' ? value.length : 
                    Array.isArray(value) ? value.length : 0;
      
      return length >= rule.minLength;
    });

    // 最大长度验证
    this.registerValidator('maxLength', (value, rule) => {
      if (!rule.maxLength) return true;
      if (!value) return true;
      
      const length = typeof value === 'string' ? value.length : 
                    Array.isArray(value) ? value.length : 0;
      
      return length <= rule.maxLength;
    });

    // 最小值验证
    this.registerValidator('min', (value, rule) => {
      if (rule.min === undefined) return true;
      if (value === null || value === undefined) return true;
      
      return Number(value) >= rule.min;
    });

    // 最大值验证
    this.registerValidator('max', (value, rule) => {
      if (rule.max === undefined) return true;
      if (value === null || value === undefined) return true;
      
      return Number(value) <= rule.max;
    });

    // 正则表达式验证
    this.registerValidator('pattern', (value, rule) => {
      if (!rule.pattern) return true;
      if (!value) return true;
      
      const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      return regex.test(String(value));
    });

    // 邮箱验证
    this.registerValidator('email', (value, rule) => {
      if (!rule.email) return true;
      if (!value) return true;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(String(value));
    });

    // URL 验证
    this.registerValidator('url', (value, rule) => {
      if (!rule.url) return true;
      if (!value) return true;
      
      try {
        new URL(String(value));
        return true;
      } catch {
        return false;
      }
    });

    // 数字验证
    this.registerValidator('number', (value, rule) => {
      if (!rule.number) return true;
      if (value === null || value === undefined) return true;
      
      return !isNaN(Number(value)) && isFinite(Number(value));
    });

    // 整数验证
    this.registerValidator('integer', (value, rule) => {
      if (!rule.integer) return true;
      if (value === null || value === undefined) return true;
      
      return Number.isInteger(Number(value));
    });

    // 自定义函数验证
    this.registerValidator('custom', (value, rule) => {
      if (!rule.custom || typeof rule.custom !== 'function') return true;
      
      try {
        return rule.custom(value, this.model);
      } catch (error) {
        this.error('Custom validator error:', error);
        return false;
      }
    });

    // 异步验证
    this.registerValidator('async', async (value, rule) => {
      if (!rule.async || typeof rule.async !== 'function') return true;
      
      try {
        return await rule.async(value, this.model);
      } catch (error) {
        this.error('Async validator error:', error);
        return false;
      }
    });
  }

  /**
   * 注册自定义验证器
   */
  registerCustomValidators() {
    Object.entries(this.options.customValidators).forEach(([name, validator]) => {
      this.registerValidator(name, validator);
    });
  }

  /**
   * 设置验证规则
   */
  setupValidationRules() {
    Object.entries(this.options.rules).forEach(([field, rules]) => {
      this.setFieldRules(field, rules);
    });
  }

  /**
   * 设置变化时验证
   */
  setupChangeValidation() {
    const disposer = onPatch(this.model, (patch) => {
      if (patch.op === 'replace' || patch.op === 'add') {
        const field = this.extractFieldFromPath(patch.path);
        if (field && this.hasRules(field)) {
          // 延迟验证，避免频繁触发
          setTimeout(() => {
            this.validateField(field);
          }, 0);
        }
      }
    });
    
    this.addDisposer(disposer);
  }

  /**
   * 注册验证器
   * @param {string} name - 验证器名称
   * @param {Function} validator - 验证函数
   */
  registerValidator(name, validator) {
    this.validators.set(name, validator);
  }

  /**
   * 设置字段验证规则
   * @param {string} field - 字段名
   * @param {Array|Object} rules - 验证规则
   */
  setFieldRules(field, rules) {
    const normalizedRules = Array.isArray(rules) ? rules : [rules];
    this.options.rules[field] = normalizedRules;
  }

  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @returns {Promise<boolean>} 验证结果
   */
  async validateField(field) {
    const rules = this.options.rules[field];
    if (!rules) return true;

    const value = this.getFieldValue(field);
    const errors = [];

    for (const rule of rules) {
      const result = await this.validateRule(value, rule);
      
      if (!result.valid) {
        errors.push(result.message);
        
        if (this.options.stopOnFirstError) {
          break;
        }
      }
    }

    // 更新验证错误
    if (errors.length > 0) {
      this.validationErrors.set(field, errors);
    } else {
      this.validationErrors.delete(field);
    }

    // 触发验证变化回调
    if (this.options.onValidationChange) {
      this.options.onValidationChange(field, errors, this.getAllErrors());
    }

    return errors.length === 0;
  }

  /**
   * 验证所有字段
   * @returns {Promise<boolean>} 验证结果
   */
  async validateAll() {
    const fields = Object.keys(this.options.rules);
    const results = await Promise.all(
      fields.map(field => this.validateField(field))
    );

    return results.every(result => result);
  }

  /**
   * 验证模型 (别名方法)
   * @returns {Promise<boolean>} 验证结果
   */
  async validateModel() {
    return await this.validateAll();
  }

  /**
   * 验证单个规则
   * @param {any} value - 字段值
   * @param {Object} rule - 验证规则
   * @returns {Promise<Object>} 验证结果
   */
  async validateRule(value, rule) {
    const result = { valid: true, message: '' };

    // 遍历规则中的每个验证器
    for (const [validatorName, validatorRule] of Object.entries(rule)) {
      if (validatorName === 'message') continue; // 跳过消息字段

      const validator = this.validators.get(validatorName);
      if (!validator) {
        this.warn(`Unknown validator: ${validatorName}`);
        continue;
      }

      try {
        const isValid = await validator(value, { [validatorName]: validatorRule });
        
        if (!isValid) {
          result.valid = false;
          result.message = rule.message || 
                          this.options.messages[validatorName] || 
                          this.getDefaultMessage(validatorName, validatorRule);
          break; // 第一个失败的规则
        }
      } catch (error) {
        this.error(`Validator ${validatorName} error:`, error);
        result.valid = false;
        result.message = 'Validation error occurred';
        break;
      }
    }

    return result;
  }

  /**
   * 获取字段值
   * @param {string} field - 字段名
   * @returns {any} 字段值
   */
  getFieldValue(field) {
    try {
      // 支持嵌套字段访问，如 'user.name'
      const parts = field.split('.');
      let value = this.model;
      
      for (const part of parts) {
        value = value[part];
        if (value === undefined || value === null) break;
      }
      
      return value;
    } catch (error) {
      this.error(`Error getting field value for ${field}:`, error);
      return undefined;
    }
  }

  /**
   * 从路径提取字段名
   * @param {string} path - MST 路径
   * @returns {string|null} 字段名
   */
  extractFieldFromPath(path) {
    // 简单实现，提取路径的最后一部分
    const parts = path.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  }

  /**
   * 检查字段是否有验证规则
   * @param {string} field - 字段名
   * @returns {boolean} 是否有规则
   */
  hasRules(field) {
    return Boolean(this.options.rules[field]);
  }

  /**
   * 获取默认错误消息
   * @param {string} validatorName - 验证器名称
   * @param {any} rule - 规则值
   * @returns {string} 错误消息
   */
  getDefaultMessage(validatorName, rule) {
    const messages = {
      required: 'This field is required',
      minLength: `Minimum length is ${rule}`,
      maxLength: `Maximum length is ${rule}`,
      min: `Minimum value is ${rule}`,
      max: `Maximum value is ${rule}`,
      pattern: 'Invalid format',
      email: 'Invalid email address',
      url: 'Invalid URL',
      number: 'Must be a number',
      integer: 'Must be an integer',
      custom: 'Validation failed',
      async: 'Async validation failed'
    };

    return messages[validatorName] || 'Validation failed';
  }

  /**
   * 获取字段错误
   * @param {string} field - 字段名
   * @returns {Array} 错误数组
   */
  getFieldErrors(field) {
    return this.validationErrors.get(field) || [];
  }

  /**
   * 获取所有错误
   * @returns {Object} 所有错误
   */
  getAllErrors() {
    const errors = {};
    this.validationErrors.forEach((fieldErrors, field) => {
      errors[field] = fieldErrors;
    });
    return errors;
  }

  /**
   * 获取验证错误 (别名方法)
   * @returns {Object} 所有错误
   */
  getValidationErrors() {
    return this.getAllErrors();
  }

  /**
   * 检查是否有错误
   * @param {string} field - 字段名（可选）
   * @returns {boolean} 是否有错误
   */
  hasErrors(field = null) {
    if (field) {
      return this.validationErrors.has(field);
    }
    return this.validationErrors.size > 0;
  }

  /**
   * 检查是否有效
   * @param {string} field - 字段名（可选）
   * @returns {boolean} 是否有效
   */
  isValid(field = null) {
    return !this.hasErrors(field);
  }

  /**
   * 清除字段错误
   * @param {string} field - 字段名
   */
  clearFieldErrors(field) {
    this.validationErrors.delete(field);
    
    if (this.options.onValidationChange) {
      this.options.onValidationChange(field, [], this.getAllErrors());
    }
  }

  /**
   * 清除所有错误
   */
  clearAllErrors() {
    this.validationErrors.clear();
    
    if (this.options.onValidationChange) {
      this.options.onValidationChange(null, [], {});
    }
  }

  /**
   * 获取验证统计
   * @returns {Object} 统计信息
   */
  getValidationStats() {
    const totalFields = Object.keys(this.options.rules).length;
    const fieldsWithErrors = this.validationErrors.size;
    const totalErrors = Array.from(this.validationErrors.values())
      .reduce((sum, errors) => sum + errors.length, 0);

    return {
      totalFields,
      fieldsWithErrors,
      validFields: totalFields - fieldsWithErrors,
      totalErrors,
      isValid: fieldsWithErrors === 0
    };
  }

  /**
   * 获取插件状态
   * @returns {Object} 插件状态
   */
  getStatus() {
    return {
      ...this.getInfo(),
      validationStats: this.getValidationStats(),
      registeredValidators: Array.from(this.validators.keys()),
      configuredFields: Object.keys(this.options.rules)
    };
  }
}