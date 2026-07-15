/**
 * Language → how to run a code block in the embedded terminal.
 *
 * Shared by both the default `pre` block (ShikiCodeBlock) and the explicit
 * `<RunnableCodeBlock>` rendered for fenced code blocks tagged with the
 * `{executable}` marker in tutorial MDX. Centralised here so the
 * "which languages can run" and "how to wrap them" decisions live in
 * exactly one place — otherwise adding a new language means hunting
 * through three component files.
 */

/** Languages the playground will execute when the user hits "运行". */
export const RUNNABLE_LANGS = new Set([
  "bash", "sh", "zsh", "shell",
  "python", "python3",
  "javascript", "js", "node",
  "powershell", "ps1",
]);

/** A PTY shell that can run bash-style scripts directly (heredoc, $(...), etc). */
function isBashLikeShell(shell: string | null | undefined): boolean {
  if (!shell) return false;
  const s = shell.toLowerCase();
  // Treat bash / zsh / sh as POSIX-compatible. Anything else (cmd, powershell,
  // fish, etc.) needs the wrapping fallback.
  return s === "bash" || s === "zsh" || s === "sh" || s.endsWith("/bash")
      || s.endsWith("/zsh") || s.endsWith("/sh");
}

/**
 * Wrap a code snippet in the right shell incantation for `lang`.
 *
 * `ptyShell` is the *actual* PTY shell spawned by Rust (bash / zsh / sh /
 * cmd). When it's bash-like we send the script verbatim — heredocs and
 * `$(...)` just work. When it's cmd.exe we can't parse bash syntax, so
 * multi-line scripts are written to a temp `.bat` (or `.ps1` for pwsh
 * blocks) via a single `powershell -Command` round-trip.
 *
 * `ptyShell === null` (haven't queried the backend yet) is treated as
 * "assume bash-like" — the tutorials are authored for bash, and if the
 * PTY turns out to be cmd.exe the user will see an obvious error rather
 * than a silent shell-syntax bug.
 */
export function getRunCommand(code: string, lang: string, ptyShell: string | null = null): string {
  const trimmed = code.trim();
  const bashLike = isBashLikeShell(ptyShell);
  const fallbackToCmd = ptyShell !== null && !bashLike;

  switch (lang) {
    case "python":
    case "python3":
      // python3 may not be on PATH on Windows; rely on the py launcher
      // being available, or fall through to the shell branch.
      return `python3 << 'PYEOF'\n${trimmed}\nPYEOF`;

    case "javascript":
    case "js":
    case "node":
      return `node << 'JSEOF'\n${trimmed}\nJSEOF`;

    case "powershell":
    case "ps1":
      if (fallbackToCmd) {
        // PTY is cmd.exe (no bash). pwsh isn't typically the PTY shell
        // itself, so we spawn powershell.exe to interpret the script.
        if (trimmed.includes("\n")) {
          const file = `%TEMP%\\run-tutorial-${Date.now()}.ps1`;
          return [
            `powershell -ExecutionPolicy Bypass -NoProfile -Command `,
            `"$f='${file}';`,
            `$s=@'` + "\n",
            trimmed,
            `\n'@;`,
            `[IO.File]::WriteAllText($f,$s);`,
            `& powershell -ExecutionPolicy Bypass -NoProfile -File $f"`,
          ].join("");
        }
        return `powershell -ExecutionPolicy Bypass -NoProfile -Command "${trimmed.replace(/"/g, `\\"`)}"`;
      }
      // PTY is bash-like: pwsh is unlikely to be installed there, but
      // pass through verbatim — the user explicitly chose powershell.
      return trimmed;

    case "bash":
    case "sh":
    case "zsh":
    case "shell":
    default: {
      const lines = trimmed.split("\n").filter((l) => l.trim());
      if (lines.length <= 1) return trimmed;

      if (fallbackToCmd) {
        // PTY is cmd.exe. Write a .bat via PowerShell and invoke.
        const file = `%TEMP%\\run-tutorial-${Date.now()}.bat`;
        return [
          `powershell -ExecutionPolicy Bypass -NoProfile -Command `,
          `"$f='${file}';`,
          `$s=@'` + "\n",
          `@echo off\r\n`,
          trimmed.replace(/\n/g, "\r\n"),
          `\n'@;`,
          `[IO.File]::WriteAllText($f,$s);`,
          `cmd /c $f"`,
        ].join("");
      }

      // PTY is bash-like (bash / zsh / sh — including Git Bash on Windows):
      // bash heredoc.
      return `cat << 'EOF' > /tmp/run-tutorial.sh\n${trimmed}\nEOF\nbash /tmp/run-tutorial.sh`;
    }
  }
}