import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskStats from './TaskStats';
import FlowDemo from './FlowDemo';
import PluginDemo from './PluginDemo';
import PluginShowcase from './PluginShowcase';
import DocumentViewer from './DocumentViewer';
import PluginTutorial from './PluginTutorial';
import CodeBlock from './CodeBlock';
import CodeThemeSelector from './CodeThemeSelector';

const MainContent = ({ activeSection }) => {
  // 代码主题状态管理
  const [codeTheme, setCodeTheme] = useState('github');
  const renderContent = () => {
    switch (activeSection) {
      case 'core-concepts':
        return (
          <div
            style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
            <h2 style={{
              color: '#007bff',
              marginTop: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🏪 MST 核心概念解读 - 赛博餐厅管理系统
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
              通过「赛博餐厅」的生动比喻，深入理解 MobX-State-Tree 的核心概念。
              从餐厅的组织架构到日常运营，掌握状态管理的精髓和最佳实践。
            </p>

            {/* 代码主题选择器 */}
            <CodeThemeSelector 
              currentTheme={codeTheme}
              onThemeChange={setCodeTheme}
            />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  🏗️ Models & Types
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  餐厅的「部门架构图」+ 每个部门的「岗位说明书」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  定义餐厅的组织结构和每个岗位的具体要求。Models 规定有哪些部门，Types 规定每个岗位必须是什么样的人，
                  并提供运行时类型检查保障。
                </p>
                <CodeBlock
                  code={`const ChefModel = types.model("Chef", {
  name: types.string, // 姓名必须是字符串
  experience: types.number, // 工龄必须是数字
  specialties: types.array(types.string), // 擅长菜系
  salary: types.optional(types.number, 0), // 可选字段，默认值为0
  isOnDuty: types.boolean // 是否在岗
});

// 运行时类型检查示例
const chef = ChefModel.create({
  name: "张师傅",
  experience: 5,
  specialties: ["川菜", "粤菜"],
  isOnDuty: true
});

// 这会在运行时报错！
// chef.experience = "五年"; // ❌ 类型错误：期望数字，得到字符串`}
                  theme={codeTheme}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：构建应用的静态蓝图和数据约束
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  📝 Volatile State
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  部门的「临时便签」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  存储不需要持久化的临时信息，如今日特价牌、当前服务桌号等。
                  这些状态变化频繁，不会出现在快照中。
                </p>
                <CodeBlock
                  code={`const KitchenModel = types.model("Kitchen", {
  // 持久化状态
  chefName: types.string,
  potatoStock: types.number
})
.volatile((self) => ({
  // 临时状态，不会被序列化
  currentSpecial: "今日暂无", // 今日特价，临时状态
  isLightOn: false, // 厨房灯是否打开，UI状态
  currentOrder: null, // 当前正在处理的订单
  kitchenTemperature: 25, // 厨房温度，实时变化
}))
.actions((self) => ({
  updateSpecial(special) {
    self.currentSpecial = special; // 修改临时状态
  },
  toggleLight() {
    self.isLightOn = !self.isLightOn;
  }
}));

// 快照中不包含volatile状态
const snapshot = getSnapshot(kitchen);
// { chefName: "张师傅", potatoStock: 50 }
// 注意：currentSpecial、isLightOn等不在快照中`}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：管理易失的UI状态和临时数据
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  📊 Views
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  经理的「数据看板」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  基于核心状态自动计算的派生数据。如根据库存自动计算可接待客人数量，
                  具有智能缓存，状态不变时复用计算结果。
                </p>
                <CodeBlock
                  code={`const RestaurantModel = types.model("Restaurant", {
  potatoStock: types.number,
  beefStock: types.number,
  tableCount: types.number,
  occupiedTables: types.number
})
.views((self) => ({
  // 基于库存计算可接待客人数
  get canServeCustomers() {
    return Math.min(
      Math.floor(self.potatoStock / 2), // 每份菜需要2个土豆
      Math.floor(self.beefStock / 1)    // 每份菜需要1份牛肉
    );
  },
  
  // 计算空闲桌位
  get availableTables() {
    return self.tableCount - self.occupiedTables;
  },
  
  // 餐厅是否已满
  get isFull() {
    return self.occupiedTables >= self.tableCount;
  },
  
  // 综合营业状态
  get operationStatus() {
    if (this.canServeCustomers === 0) return "缺少食材";
    if (this.isFull) return "座位已满";
    return "正常营业";
  }
}));

// Views会自动缓存，只有依赖的状态改变时才重新计算
console.log(restaurant.canServeCustomers); // 第一次计算
console.log(restaurant.canServeCustomers); // 使用缓存结果
restaurant.potatoStock = 100; // 修改依赖状态
console.log(restaurant.canServeCustomers); // 重新计算`}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：提供高性能的计算属性和派生状态
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  ⚡ Actions
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  标准的「工作流程」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  修改状态的唯一合法途径。如厨师领料必须走标准流程，
                  确保所有状态变更都是可预测、可追踪的。
                </p>
                <CodeBlock
                  code={`const RestaurantModel = types.model("Restaurant", {
  potatoStock: types.number,
  beefStock: types.number,
  revenue: types.number,
  orderHistory: types.array(types.string)
})
.actions((self) => ({
  // 标准的库存消耗流程
  usePotatoes(amount, orderId) {
    if (self.potatoStock >= amount) {
      self.potatoStock -= amount;
      self.orderHistory.push(\`订单\${orderId}: 消耗土豆\${amount}个\`);
      return true;
    } else {
      throw new Error(\`土豆库存不足！当前库存：\${self.potatoStock}，需要：\${amount}\`);
    }
  },
  
  // 补货流程
  restockIngredients(potatoes, beef) {
    self.potatoStock += potatoes;
    self.beefStock += beef;
    self.orderHistory.push(\`补货: 土豆+\${potatoes}, 牛肉+\${beef}\`);
  },
  
  // 完整的下单流程
  processOrder(customerCount) {
    const potatoesNeeded = customerCount * 2;
    const beefNeeded = customerCount * 1;
    
    // 检查库存
    if (self.potatoStock < potatoesNeeded) {
      throw new Error("土豆库存不足，无法接单");
    }
    if (self.beefStock < beefNeeded) {
      throw new Error("牛肉库存不足，无法接单");
    }
    
    // 消耗库存
    self.potatoStock -= potatoesNeeded;
    self.beefStock -= beefNeeded;
    
    // 增加收入
    const orderValue = customerCount * 50; // 每份菜50元
    self.revenue += orderValue;
    
    // 记录订单
    const orderId = Date.now();
    self.orderHistory.push(\`订单\${orderId}: \${customerCount}份菜，收入\${orderValue}元\`);
    
    return orderId;
  }
}));

// 使用示例
try {
  const orderId = restaurant.processOrder(3); // 处理3人的订单
  console.log(\`订单\${orderId}处理成功\`);
} catch (error) {
  console.error("订单处理失败:", error.message);
}`}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：确保状态变更的一致性和可追踪性
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  📸 Snapshots
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  「每日营业报表」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  给整个餐厅状态拍的静态照片，记录所有核心数据。
                  可用于状态序列化、持久化和时间旅行调试。
                </p>
                <CodeBlock
                  code={`// 创建餐厅实例
const restaurant = RestaurantModel.create({
  potatoStock: 100,
  beefStock: 50,
  revenue: 0,
  orderHistory: []
});

// 营业一天后...
restaurant.processOrder(5); // 处理几个订单
restaurant.processOrder(3);

// 每日结束，保存快照
const endOfDaySnapshot = getSnapshot(restaurant);
console.log("今日营业报表:", endOfDaySnapshot);
// {
//   potatoStock: 84,
//   beefStock: 42,
//   revenue: 400,
//   orderHistory: ["订单1634567890: 5份菜，收入250元", ...]
// }

// 第二天开业，恢复到昨天的状态
const newRestaurant = RestaurantModel.create(endOfDaySnapshot);

// 或者直接应用到现有实例
applySnapshot(restaurant, endOfDaySnapshot);

// 时间旅行调试：回到某个历史状态
const historicalSnapshot = {
  potatoStock: 100,
  beefStock: 50,
  revenue: 0,
  orderHistory: []
};
applySnapshot(restaurant, historicalSnapshot); // 回到开业初始状态`}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：实现状态的备份、还原和调试功能
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <h4 style={{ color: '#495057', marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                  🔧 Patches
                </h4>
                <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
                  「监控录像的回放」
                </div>
                <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6', marginBottom: '12px' }}>
                  记录每一个细小的状态变化动作，如监控录像般详细。
                  适用于实时同步、协同编辑和精确的变更追踪。
                </p>
                <CodeBlock
                  code={`// 监听餐厅的所有变化
onPatch(restaurant, (patch) => {
  console.log("检测到变化:", patch);
  
  // 实时同步到其他分店
  sendToOtherBranches(patch);
  
  // 记录操作日志
  logOperation(patch);
});

// 执行一些操作
restaurant.usePotatoes(5, "ORDER001");
// 输出: {op: "replace", path: "/potatoStock", value: 95}

restaurant.processOrder(2);
// 输出多个patch:
// {op: "replace", path: "/potatoStock", value: 91}
// {op: "replace", path: "/beefStock", value: 48}
// {op: "replace", path: "/revenue", value: 100}
// {op: "add", path: "/orderHistory/0", value: "订单1634567890: 2份菜，收入100元"}

// 在其他客户端应用这些变化
function syncFromMainBranch(patches) {
  patches.forEach(patch => {
    applyPatch(localRestaurant, patch);
  });
}

// 逆向操作：撤销最后一个操作
onPatch(restaurant, (patch, inversePatch) => {
  // inversePatch 可以用来撤销这个操作
  undoStack.push(inversePatch);
});

function undo() {
  const lastInversePatch = undoStack.pop();
  if (lastInversePatch) {
    applyPatch(restaurant, lastInversePatch);
  }
}`}
                  language="javascript"
                  compact={true}
                  copyable={true}
                />
                <div style={{ fontSize: '12px', color: '#007bff', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px' }}>
                  💡 核心作用：提供增量同步和协作编辑能力
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ color: '#495057', marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
                🎯 概念关系总结
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                  <h5 style={{ color: '#007bff', marginTop: 0, marginBottom: '8px' }}>🏗️ 结构组</h5>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: 0, lineHeight: '1.5' }}>
                    <strong>Models & Types</strong><br />
                    定义「是什么」- 数据的静态蓝图
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                  <h5 style={{ color: '#28a745', marginTop: 0, marginBottom: '8px' }}>⚡ 动态组</h5>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: 0, lineHeight: '1.5' }}>
                    <strong>Actions, Views, Volatile</strong><br />
                    定义「怎么动」- 状态的运行机制
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                  <h5 style={{ color: '#dc3545', marginTop: 0, marginBottom: '8px' }}>👀 观察组</h5>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: 0, lineHeight: '1.5' }}>
                    <strong>Snapshots & Patches</strong><br />
                    定义「如何看」- 状态的观察方式
                  </p>
                </div>
              </div>
            </div>
            
            {/* 展示任务统计和任务列表作为实际示例 */}
            <TaskStats />
            <TaskList />
          </div>
        );
        
      case 'flow-demo':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{
                color: '#007bff',
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔄 Flow 模式异步处理案例
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                演示 MST Flow 模式在异步操作中的应用，包括错误处理、状态管理和最佳实践。
              </p>
            </div>
            <FlowDemo />
          </div>
        );
        
      case 'plugin-system':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{
                color: '#007bff',
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔌 MST 插件系统介绍及演示
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                完整的插件系统架构演示，包括插件管理、中间件、钩子函数和扩展机制。
              </p>
            </div>
            <PluginShowcase />
            <PluginDemo />
            <PluginTutorial />
          </div>
        );
        
      case 'document-library':
        return (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{
                color: '#007bff',
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📖 项目文档库
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                完整的项目文档、API 参考、开发指南和最佳实践集合。
              </p>
            </div>
            <DocumentViewer />
          </div>
        );
        
      default:
        return (
          <div style={{
            padding: '50px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <h3>欢迎使用 MST 插件系统演示</h3>
            <p>请从左侧导航选择要查看的内容</p>
          </div>
        );
    }
  };

return (
  <div style={{
    flex: 1,
    padding: '0 20px',
    minHeight: '100vh',
    backgroundColor: '#ffffff'
  }}>
    {renderContent()}
  </div>
);
};

export default MainContent;