curl -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 975cdfa3bee946418b364987e9cc2318.jNuTw6J889gDgo74" \
    -d '{
        "model": "glm-5",
        "messages": [
        {
            "role": "user",
            "content": "作为一名营销专家，请为我的产品创作一个吸引人的口号"
        },
        {
            "role": "assistant",
            "content": "当然，要创作一个吸引人的口号，请告诉我一些关于您产品的信息"
        },
        {
            "role": "user",
            "content": "智谱AI 开放平台"
        }
            ],
            "thinking": {
            "type": "enabled"
        },
            "max_tokens": 65536,
            "temperature": 1.0
        }'