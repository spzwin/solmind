# TokenTon26 Hackathon - SolMind AI Agent

## 项目目标
构建 SolMind：一个以 AI 为大脑的 Solana 链上智能投资分析 Agent。
参赛 TokenTon26 AI Track ($8,500 USDC) + Grand Prize ($10,500 USDC)。

## 核心功能（必须实现）
1. **链上数据获取**：通过 Solana 公共 RPC 获取实时链上数据（代币价格、交易量、DeFi TVL）
2. **AI 分析引擎**：将链上数据喂给 AI（使用 OpenAI GPT-4o-mini API 或 Anthropic API），生成投资洞察
3. **Agent 自主循环**：AI 自动定时分析、生成报告、触发告警——无需人工干预
4. **Web 界面**：Next.js 简洁仪表盘展示 AI 分析结果
5. **Token 门控**：持有特定 SPL Token 才能访问高级功能（体现 token utility）

## 技术栈
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: @solana/web3.js，连接 mainnet-beta 公共 RPC
- **AI**: OpenAI API (gpt-4o-mini) — 用 process.env.OPENAI_API_KEY
- **部署**: Vercel（必须有可访问的公网 URL）
- **数据源**: Solana RPC + Jupiter Price API (免费，无需 key)

## 目录结构
```
solmind/
  app/
    page.tsx          # 首页 - AI 分析仪表盘
    api/
      analyze/route.ts    # AI 分析 API
      onchain/route.ts    # 链上数据获取 API
      agent/route.ts      # 自主 Agent 循环
  components/
    Dashboard.tsx
    AgentFeed.tsx
    TokenGate.tsx
  lib/
    solana.ts         # 链上数据获取
    ai.ts             # AI 分析逻辑
    agent.ts          # Agent 循环逻辑
  package.json
  README.md           # 必须有详细说明
```

## AI Agent 核心逻辑
```
每 5 分钟自动执行一次：
1. 从 Solana RPC 获取 SOL/USDC/JUP/BONK 的交易量、价格变化
2. 从 Jupiter Price API 获取实时价格
3. 将数据格式化为 AI prompt
4. 调用 GPT-4o-mini 生成分析报告
5. 将报告存入内存（数组），最多保留 20 条
6. 前端实时展示最新报告
```

## 评分重点（TokenTon26 要求）
- AI 真正影响产品功能（不只是聊天界面）
- 使用真实链上数据
- 展示自主/预测/代理驱动系统
- 有清晰的 token 使用场景
- 代码干净，有 README

## 注意事项
- 使用 process.env.OPENAI_API_KEY 作为 AI key 占位符（用户自己填）
- Solana RPC 用公共端点：https://api.mainnet-beta.solana.com
- Jupiter Price API: https://price.jup.ag/v4/price?ids=SOL,USDC,JUP,BONK
- 不需要用户连接钱包（简化 UX）
- 先跑通 MVP，然后再优化

## 完成后必须做
1. 确保 `npm run build` 无报错
2. 更新 README.md（包含：项目介绍、截图描述、如何运行、技术架构、token utility 说明）
3. git add . && git commit -m "feat: SolMind AI Agent MVP"
4. 运行: openclaw system event --text "SolMind MVP built! Ready for Vercel deploy." --mode now
