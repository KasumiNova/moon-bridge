# API 接口

Moon Bridge 对外暴露 OpenAI Responses 兼容端点、模型列表端点和可选的管理 API。

## 基础信息

- **Base URL**：`http://127.0.0.1:38440`（默认）
- **认证**：通过 `auth_token` 配置启用 Bearer Token
- **内容类型**：`application/json`

## Web Console

生产二进制会在 `/console/` 提供嵌入式 Web Console。Console 使用同源 RPC：

- `/api/v1/*`：管理 API，用于状态、Provider/Model/Route、配置导入导出、待应用变更等。
- `/v1/models`、`/v1/responses`：RPC smoke test 面板使用的 OpenAI-compatible 端点。

管理 API 只有在配置启用 `persistence.active_provider` 且配置存储初始化成功时可用；否则 `/api/v1/*` 可能返回 404 或 `store_unavailable`。Console 中生成或导入的配置不会立即成为运行态配置，必须先 stage pending changes，再通过 `/api/v1/changes/apply` 应用。

## 核心端点

### POST /v1/responses

OpenAI Responses API 兼容的聊天/补全端点。

**关键请求字段**：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model` | string | 模型名或路由别名 |
| `input` | string/array | 输入文本或消息数组 |
| `include` | array | 控制返回内容（如推理内容） |
| `tools` | array | 工具定义列表 |
| `tool_choice` | object | 工具选择策略 |
| `max_output_tokens` | number | 最大输出 token 数 |
| `temperature` | number | 采样温度 |
| `stream` | boolean | 是否启用流式响应 |

**响应格式**：

```json
{
  "id": "resp_xxx",
  "status": "completed",
  "model": "deepseek-v4-flash(deepseek)",
  "output": [
    {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "Hello!"}]}
  ],
  "usage": {
    "input_tokens": 10,
    "output_tokens": 42,
    "total_tokens": 52
  }
}
```

**流式响应**（`stream: true`）使用 Server-Sent Events 格式：

```
event: response.output_item.added
data: {"type": "reasoning", ...}
event: response.output_text.delta
data: {"delta": "Hello"}
event: response.completed
data: {"response": {...}}
```

### GET /v1/models

列出所有可用模型列表。

响应为 Moon Bridge 目录形态：

```json
{
  "models": [
    {"slug": "moonbridge", "name": "Moon Bridge", "provider": "route", "model": "claude-sonnet"}
  ]
}
```

## 管理 API

当 `persistence.active_provider` 启用时，管理 API 在 `/api/v1/` 下可用。写操作会创建待应用变更，通常返回 `202` 和 `change_id`，不会绕过变更队列直接修改运行态。

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/v1/status` | GET | 运行态状态 |
| `/api/v1/providers` | GET | 分页列出 Provider |
| `/api/v1/providers/{key}` | GET/PUT/PATCH/DELETE | 查看、创建、更新、删除 Provider |
| `/api/v1/providers/{key}/offers` | POST | 新增 Provider offer |
| `/api/v1/providers/{key}/offers/{model}` | PATCH/DELETE | 更新或删除 Provider offer |
| `/api/v1/models` | GET | 分页列出模型定义 |
| `/api/v1/models/{slug}` | GET/PUT/DELETE | 查看、创建、删除模型定义 |
| `/api/v1/routes` | GET | 分页列出路由别名 |
| `/api/v1/routes/{alias}` | GET/PUT/DELETE | 查看、创建、删除路由别名 |
| `/api/v1/defaults` | GET/PUT | 查看和 stage 默认模型设置 |
| `/api/v1/web-search` | GET/PUT | 查看和 stage Web Search 设置 |
| `/api/v1/extensions` | GET | 列出扩展名 |
| `/api/v1/extensions/{name}` | GET/PUT | 查看和 stage 扩展 JSON 配置 |
| `/api/v1/config/effective` | GET | 获取 masked 有效配置 |
| `/api/v1/config/export` | GET | 导出 YAML 配置 |
| `/api/v1/config/import` | POST | 导入 YAML 并 stage 变更 |
| `/api/v1/config/validate` | POST | 校验 YAML |
| `/api/v1/changes` | GET | 列出待应用变更 |
| `/api/v1/changes/apply` | POST | 应用待变更并 reload |
| `/api/v1/changes/discard` | POST | 丢弃待变更 |
| `/api/v1/sessions` | GET | 获取会话用量统计 |

导出带 secrets 的配置时必须使用：

```http
GET /api/v1/config/export?include_secrets=true
X-Confirm-Secrets: true
```

`POST /api/v1/config/validate` 请求字段名为 `config`，内容是 YAML 字符串；校验失败时可能返回 `200` 且 `{"valid":false,"errors":[...]}`。

## 错误处理

错误响应格式：

```json
{"error": {"message": "...", "code": "error_code"}}
```

| HTTP 状态码 | 场景 |
|--------------|------|
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 404 | 模型/端点不存在 |
| 502 | 上游 Provider 错误 |

## 与 Codex CLI 集成

在 Codex 配置中指向 Moon Bridge 地址：

```toml
[openai]
base_url = "http://127.0.0.1:38440/v1"
api_key = "any-non-empty-value"
```

Moon Bridge 自动处理路由和协议转换。
