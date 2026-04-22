---
layout: page
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const lang = navigator.language || navigator.userLanguage || ''
  if (lang.startsWith('zh')) {
    window.location.href = '/hello-claw/cn/adopt/intro'
  } else {
    window.location.href = '/hello-claw/en/adopt/intro'
  }
})
</script>

<div style="text-align: center; padding: 100px 20px;">
  <h1>🦞 Hello Claw</h1>
  <p>Redirecting...</p>
  <p>
    <a href="/hello-claw/cn/adopt/intro">简体中文</a> |
    <a href="/hello-claw/en/adopt/intro">English</a>
  </p>
</div>
