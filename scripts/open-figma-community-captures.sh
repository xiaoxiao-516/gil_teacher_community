#!/usr/bin/env bash
# 在已运行 `npm run dev` 的前提下，依次打开带 Figma 捕获参数的页面（开发环境为 BrowserRouter）。
# 目标文件：教师端-社区 ly4UfSlEOGmuBImHw2uu0m，node 0:1（由 MCP generate_figma_design 生成各 captureId）。
# 用法：先为每页调用 MCP 拿到新 captureId，替换下方 ID 后再执行本脚本；或逐条复制 open 命令。

BASE="http://localhost:5173"
delay="figmadelay=2500"

open_capture() {
  local id="$1"
  local path="$2"
  local enc
  enc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('https://mcp.figma.com/mcp/capture/${id}/submit', safe=''))")
  open "${BASE}${path}#figmacapture=${id}&figmaendpoint=${enc}&${delay}"
}

# 以下为一次性生成的 ID；若已过期请重新 generate_figma_design 并替换
open_capture "8c45597e-d430-4e51-98a8-08f8036f6a42" "/community"
open_capture "635c9af6-9915-4e33-a8fd-b23ec619db7b" "/community/submit"
open_capture "339d6d74-83bb-453e-9f7e-30976f61aad7" "/community/post-1"
open_capture "2dbc5e78-ee79-4a13-9659-16afdb493094" "/community-pad"
open_capture "dc7f358a-d375-49ab-97af-9815d1eb5823" "/community-pad/submit"
open_capture "9e1dc3d1-3103-4fd1-86ca-55d320ec8847" "/community-pad/post-1"
