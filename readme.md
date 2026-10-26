# Owlet 🦉

Cross-platform CLI tool to prevent your operating system from going to sleep while running heavy tasks (like benchmarking, large data transfers, or long builds).

## The Problem

When running intensive tasks in the terminal—such as flashing external drives, moving hundreds of gigabytes of data, or compiling heavy codebases—your OS might step in, trigger idle/system sleep, and brutally kill your process halfway through.

**Owlet** acts as a bodyguard. It tells your OS to stay awake until your command completes, then safely restores your power management settings.

## Platform Support

Owlet uses native system utilities under the hood for zero-dependency reliability:
* **macOS (`darwin`):** Uses `caffeinate`
* **Linux (`linux`):** Uses `systemd-inhibit`
* **Windows (`win32`):** Uses PowerShell & Windows API (`SetThreadExecutionState`)

## Installation & Usage

You can run it directly without permanent installation using `npx`:

```bash
npx @nitefine/owlet --command "npm run build"
```

Or install it globally:

```bash
npm install -g @nitefine/owlet
```

Then use it anywhere:

```bash
owlet --command "your-heavy-command-here"
```

## Examples

* **Building a project:**
  ```bash
  owlet --command "npm run build"
  ```
* **Simulating a long-running process / benchmark:**
  ```bash
  owlet --command "node benchmark.js"
  ```

## License

[MIT](LICENSE)