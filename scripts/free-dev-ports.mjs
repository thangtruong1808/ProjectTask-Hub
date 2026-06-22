import { execSync, spawnSync } from 'node:child_process'

const DEFAULT_PORTS = ['5181', '5173']
const ports = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_PORTS

function sleepMs(ms) {
  if (process.platform === 'win32') {
    try {
      execSync(`ping 127.0.0.1 -n ${Math.max(1, Math.ceil(ms / 1000))} > nul`, {
        stdio: 'ignore',
        windowsHide: true,
      })
    } catch {
      // Ignore timing fallback errors.
    }
    return
  }

  try {
    execSync(`sleep ${Math.max(1, Math.ceil(ms / 1000))}`, { stdio: 'ignore' })
  } catch {
    // Ignore timing fallback errors.
  }
}

function killProcess(pid) {
  if (!pid || pid === '0') return false

  const result = spawnSync('taskkill', ['/PID', String(pid), '/F'], {
    stdio: 'ignore',
    windowsHide: true,
  })

  return result.status === 0
}

function killWindowsPort(targetPort) {
  const pids = new Set()

  try {
    const ps = execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
      { encoding: 'utf8', windowsHide: true },
    )

    for (const line of ps.split(/\r?\n/)) {
      const pid = line.trim()
      if (/^\d+$/.test(pid)) pids.add(pid)
    }
  } catch {
    // Fall back to netstat parsing below.
  }

  if (pids.size === 0) {
    try {
      const output = execSync(`netstat -ano -p tcp | findstr :${targetPort}`, {
        encoding: 'utf8',
        windowsHide: true,
      })

      for (const line of output.split(/\r?\n/)) {
        if (!line.includes('LISTENING')) continue
        const parts = line.trim().split(/\s+/)
        const pid = parts.at(-1)
        if (/^\d+$/.test(pid ?? '')) pids.add(pid)
      }
    } catch {
      return
    }
  }

  for (const pid of pids) {
    if (killProcess(pid)) {
      console.log(`[predev] Freed port ${targetPort} (PID ${pid})`)
    }
  }
}

function killUnixPort(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    for (const pid of output.split(/\r?\n/)) {
      const trimmed = pid.trim()
      if (!trimmed) continue
      try {
        process.kill(Number(trimmed), 'SIGTERM')
        console.log(`[predev] Freed port ${targetPort} (PID ${trimmed})`)
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // No process bound to the port.
  }
}

function killKnownDevProcesses() {
  if (process.platform !== 'win32') return

  for (const imageName of ['TodoList.Api.exe']) {
    spawnSync('taskkill', ['/IM', imageName, '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    })
  }
}

killKnownDevProcesses()

for (const port of ports) {
  if (process.platform === 'win32') {
    killWindowsPort(port)
  } else {
    killUnixPort(port)
  }
}

sleepMs(600)
