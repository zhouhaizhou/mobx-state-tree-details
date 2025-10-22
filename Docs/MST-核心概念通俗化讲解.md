## MST 核心概念通俗化讲解

## 📖 概述

想象你要用 MST 管理一家「赛博餐厅」，通过这个生动的比喻来理解 MST 的核心概念。

---

## 🏗️ 1. Models（模型）-> 餐厅的「部门架构图」

### 通俗解读
这就是你餐厅的组织结构设计。你规定餐厅必须有「后厨部」、「大堂部」、「采购部」。每个部门下面又要设置哪些岗位。它定义了谁存在以及他们的基本关系。

### 代码示例
```javascript
// 完整的餐厅模型定义
const KitchenModel = types.model("Kitchen", {
  chefName: types.string,
  potatoStock: types.number,
  beefStock: types.number,
  isOpen: types.boolean
});

const DiningHallModel = types.model("DiningHall", {
  tableCount: types.number,
  occupiedTables: types.number,
  waitingCustomers: types.number
});

const RestaurantModel = types.model("Restaurant", {
  kitchen: KitchenModel, // 后厨部
  diningHall: DiningHallModel, // 大堂部
  revenue: types.number
});
```

### 联系
Models 是根基，它用 Types 来定义每个部门的具体构成。

---

## 📋 2. Types（类型）-> 每个部门的「岗位说明书」

### 通俗解读
它规定了每个岗位上必须是什么样的人。比如：「厨师长」岗位必须是一个对象，这个对象必须有「姓名（字符串）」、「工龄（数字）」、「擅长菜系（字符串数组）」。

**运行时类型检查**：如果有人想把一个「数字」塞到「姓名」里，或者给「工龄」赋值为「字符串」，MST 会立刻在程序运行时跳出来大喊：「喂！这不符合岗位要求！」

### 代码示例
```javascript
const ChefModel = types.model("Chef", {
  name: types.string, // 姓名必须是字符串
  experience: types.number, // 工龄必须是数字
  specialties: types.array(types.string), // 擅长菜系是字符串数组
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
// chef.experience = "五年"; // ❌ 类型错误：期望数字，得到字符串
```

### 区别
Models 定义有什么部门（结构），Types 定义每个岗位的具体要求（约束）。它们一起构成了餐厅的「静态蓝图」。

---

## 📝 3. Volatile State（可变状态）-> 部门的「临时便签」

### 通俗解读
一些不需要记录在案的临时信息：

- **后厨部的「今日特价牌」**：写在白板上，今天有效，明天就擦掉。不需要存入公司数据库。
- **服务员手里的「当前服务桌号」**：正在服务A桌，下一秒可能就去B桌了。这个状态变化很快，没必要持久化。

### 代码示例
```javascript
const KitchenModel = types.model("Kitchen", {
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
// 注意：currentSpecial、isLightOn等不在快照中
```

### 区别
Volatile State 是「易失的」，不会出现在 Snapshots 里。而用 Types 定义的字段是「持久的」，是核心业务数据。

---

## 📊 4. Views（视图）-> 经理的「数据看板」

### 通俗解读
这是自动计算出来的信息，而不是手动填写：

- **财务经理看一眼库存**（核心状态），自动算出：「根据当前土豆和牛肉库存，我们还能接待50位客人。」
- 这个「50」不是谁存进去的，是实时算出来的。只要库存不变，这个数字就一直缓存着；库存一变，它自动重新计算。

### 代码示例
```javascript
const RestaurantModel = types.model("Restaurant", {
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
console.log(restaurant.canServeCustomers); // 重新计算
```

### 联系
Views 依赖于 Models 中定义的核心状态。它们是只读的，是状态的「衍生品」。

---

## ⚡ 5. Actions（动作）-> 标准的「工作流程」

### 通俗解读
这是改变餐厅状态的唯一合法途径，而且必须按照标准流程来：

- 你不能让厨师直接去仓库把土豆拿走（直接修改状态）
- 你必须走流程：厨师提交「领料申请」（调用Action），仓库管理员核对后，在库存表上减去相应数量（在Action内部修改状态）
- 这保证了任何时候土豆数量的变化都是可预测、可追踪的

### 代码示例
```javascript
const RestaurantModel = types.model("Restaurant", {
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
      self.orderHistory.push(`订单${orderId}: 消耗土豆${amount}个`);
      return true;
    } else {
      throw new Error(`土豆库存不足！当前库存：${self.potatoStock}，需要：${amount}`);
    }
  },
  
  // 补货流程
  restockIngredients(potatoes, beef) {
    self.potatoStock += potatoes;
    self.beefStock += beef;
    self.orderHistory.push(`补货: 土豆+${potatoes}, 牛肉+${beef}`);
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
    self.orderHistory.push(`订单${orderId}: ${customerCount}份菜，收入${orderValue}元`);
    
    return orderId;
  }
}));

// 使用示例
try {
  const orderId = restaurant.processOrder(3); // 处理3人的订单
  console.log(`订单${orderId}处理成功`);
} catch (error) {
  console.error("订单处理失败:", error.message);
}
```

### 联系与区别
- **Actions 是因**，它负责修改 Models 中定义的状态（果）
- **Actions 是命令，Views 是查询**。一个负责改，一个负责看

---

## 📸 6. Snapshots（快照）-> 「每日营业报表」

### 通俗解读
在每天打烊的时候，给整个餐厅的核心数据拍一张静态照片：

- 这张照片里记录了：土豆还剩XX斤，牛肉还剩YY斤，营业额ZZ元
- 这张照片（一个纯JSON对象）可以：
  - **存盘**：交给老板看（序列化）
  - **复盘**：第二天开业时，按照这张照片把食材摆好，完全还原到打烊时的状态（反序列化/水合）
  - **时间旅行**：你可以翻看过去任何一天的报表，看看当时是什么情况（调试）

### 代码示例
```javascript
// 创建餐厅实例
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
applySnapshot(restaurant, historicalSnapshot); // 回到开业初始状态
```

### 联系
Snapshots 只包含 Models 中用 Types 定义的持久化状态，不包含 Volatile State。

---

## 🔧 7. Patches（补丁）-> 「监控录像的回放」

### 通俗解读
如果说 Snapshots 是每天的一张全景照片，那 Patches 就是高清监控录像：

- 它记录的不是最终结果，而是每一个细小的动作
- 「下午2:03，厨师从仓库取走了3个土豆。」
- 「下午2:05，采购员向仓库补货了20个土豆。」

### 这有什么用？

- **同步**：你可以把这个「监控录像记录」（一串JSON改动记录）实时发给你的分店，分店就能同步你的每一个操作，保持总店和分店的库存完全一致
- **协作**：像Google Docs一样，记录每一个细小的修改，用于协同编辑

### 代码示例
```javascript
// 监听餐厅的所有变化
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
}
```

### 区别
- **Snapshots** 是全局状态，很大，但获取简单
- **Patches** 是增量改动，很小，非常高效，适合实时同步

---

## 🎯 核心概念关系总结

可以把这7个概念分成三组：

### 1. 结构组（定义「是什么」）
- **Models & Types**：共同定义了状态的静态蓝图，是数据的骨架

### 2. 动态组（定义「怎么动」）
- **Actions**：是唯一能改变骨架（状态）的动作
- **Views**：是观察骨架后自动计算出的信息
- **Volatile State**：是挂在骨架上的临时装饰品

### 3. 观察组（定义「如何看」）
- **Snapshots**：给整个骨架拍全景照
- **Patches**：记录骨架的每一个微小动作

## 🚀 它们如何协作？

你用 **Models 和 Types** 设计好餐厅的架构。然后通过 **Actions** 来运营它，改变它的状态。通过 **Views** 来监控它的健康状况。用 **Volatile State** 来处理一些临时事务。最后，你可以通过 **Snapshots** 来备份/还原整个餐厅，或者通过 **Patches** 来实时同步它的每一步变化。

## 💡 总结

通过「赛博餐厅」这个生动的比喻，我们可以更好地理解 MST 的核心概念：

- 🏗️ **Models & Types** = 餐厅架构设计
- 📝 **Volatile State** = 临时便签
- 📊 **Views** = 自动数据看板
- ⚡ **Actions** = 标准工作流程
- 📸 **Snapshots** = 每日营业报表
- 🔧 **Patches** = 监控录像回放

这些概念相互配合，构成了一个完整、可靠、可追踪的状态管理系统。