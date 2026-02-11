import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const PYTHON_DIR = path.join(process.cwd(), "python");
const SCRIPT_PATH = path.join(PYTHON_DIR, "run_api.py");

function getPythonExecutable(): string {
  const venvUnix = path.join(PYTHON_DIR, ".venv", "bin", "python");
  const venvWin = path.join(PYTHON_DIR, ".venv", "Scripts", "python.exe");
  if (fs.existsSync(venvUnix)) return venvUnix;
  if (fs.existsSync(venvWin)) return venvWin;
  return "python3";
}

export async function POST(request: NextRequest) {
  if (!fs.existsSync(SCRIPT_PATH)) {
    return NextResponse.json(
      { error: "后端计算脚本未找到，请确认 python/run_api.py 存在。" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体须为 JSON，包含 birth_year, birth_month, birth_day。" },
      { status: 400 }
    );
  }

  const params = body as Record<string, unknown>;
  const birth_year = Number(params?.birth_year);
  const birth_month = Number(params?.birth_month);
  const birth_day = Number(params?.birth_day);
  if (
    !Number.isInteger(birth_year) ||
    !Number.isInteger(birth_month) ||
    !Number.isInteger(birth_day)
  ) {
    return NextResponse.json(
      { error: "请提供有效的 birth_year, birth_month, birth_day（整数）。" },
      { status: 400 }
    );
  }

  const payload = {
    birth_year,
    birth_month,
    birth_day,
    birth_hour:
      params.birth_hour != null && params.birth_hour !== ""
        ? Number(params.birth_hour)
        : null,
    use_lunar: Boolean(params.use_lunar),
    current_month:
      params.current_month != null ? Number(params.current_month) : null,
  };

  const pythonBin = getPythonExecutable();
  return new Promise<NextResponse>((resolve) => {
    const proc = spawn(pythonBin, [SCRIPT_PATH], {
      cwd: PYTHON_DIR,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", (chunk) => (stdout += chunk));
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", (chunk) => (stderr += chunk));

    proc.on("error", (err) => {
      resolve(
        NextResponse.json(
          {
            error: "无法启动 Python 计算服务。请确认已安装 Python 并执行：cd python && pip install -r requirements.txt",
            detail: String(err.message),
          },
          { status: 503 }
        )
      );
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(
          NextResponse.json(
            {
              error: "八字计算失败",
              detail: stderr || stdout || "未知错误",
            },
            { status: 500 }
          )
        );
        return;
      }
      try {
        const result = JSON.parse(stdout) as Record<string, unknown>;
        resolve(NextResponse.json(result));
      } catch {
        resolve(
          NextResponse.json(
            { error: "计算结果格式异常", detail: stdout },
            { status: 500 }
          )
        );
      }
    });

    proc.stdin.write(JSON.stringify(payload), "utf8", () => {
      proc.stdin.end();
    });
  });
}
