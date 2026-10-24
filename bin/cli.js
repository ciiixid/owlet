#!/usr/bin/env node

import { spawn } from 'child_process';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const userCommand = argv.command || argv.c;

if (!userCommand) {
  console.error('❌ Error: Please provide a command to run.');
  console.error('💡 Example: owlet --command "npm run build"');
  process.exit(1);
}

const platform = process.platform;
let fullCommand = '';

if (platform === 'darwin') {
  fullCommand = `caffeinate -i -s ${userCommand}`;
} else if (platform === 'linux') {
  fullCommand = `systemd-inhibit --what=sleep:idle --who=Owlet --why="Running heavy development task" --mode=block ${userCommand}`;
} else if (platform === 'win32') {
  const escapedUserCommand = userCommand.replace(/"/g, '`"');
  fullCommand = `powershell -NoProfile -Command "
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class PowerState {
        [DllImport(\"kernel32.dll\", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern EXECUTION_STATE SetThreadExecutionState(EXECUTION_STATE esFlags);
        [Flags]
        public enum EXECUTION_STATE : uint {
            ES_AWAYMODE_REQUIRED = 0x00000040,
            ES_CONTINUOUS = 0x80000000,
            ES_DISPLAY_REQUIRED = 0x00000002,
            ES_SYSTEM_REQUIRED = 0x00000001
        }
    }';
    [PowerState]::SetThreadExecutionState([PowerState+EXECUTION_STATE]::ES_SYSTEM_REQUIRED -bor [PowerState+EXECUTION_STATE]::ES_CONTINUOUS | Out-Null);
    Write-Host '☕ [owlet] Preventing system sleep...';
    try {
        & ${escapedUserCommand};
        $exitCode = $LASTEXITCODE;
        if (\$null -eq \$exitCode) { \$exitCode = 0; }
    } finally {
        [PowerState]::SetThreadExecutionState([PowerState+EXECUTION_STATE]::ES_CONTINUOUS | Out-Null);
        Write-Host '☕ [owlet] System power state restored.';
    }
    exit \$exitCode;
  "`;
} else {
  console.error(`❌ Unsupported platform: ${platform}`);
  process.exit(1);
}

console.log(`🚀 Running sleep protection for: "${userCommand}" (${platform})\n`);

const child = spawn(fullCommand, {
  shell: true,
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('❌ Failed to execute process:', err);
  process.exit(1);
});