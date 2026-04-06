"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [platform, setPlatform] = useState("");

  async function testGreet() {
    const result = await invoke<string>("greet", { name: "Innate" });
    setGreeting(result);
  }

  async function testPlatform() {
    const result = await invoke<string>("get_platform");
    setPlatform(result);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          Innate Playground
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          AI Agent 学习桌面应用
        </p>

        <div className="flex gap-4">
          <button
            onClick={testGreet}
            className="rounded-lg bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Test Tauri IPC
          </button>
          <button
            onClick={testPlatform}
            className="rounded-lg border border-zinc-300 px-6 py-3 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors"
          >
            Detect Platform
          </button>
        </div>

        {greeting && (
          <p className="text-green-600 dark:text-green-400 text-lg">{greeting}</p>
        )}
        {platform && (
          <p className="text-blue-600 dark:text-blue-400 text-lg">
            Platform: {platform}
          </p>
        )}
      </main>
    </div>
  );
}
