#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
供 Next.js API 通过 child_process 调用：从 stdin 读 JSON，向 stdout 写 JSON。
用法: echo '{"birth_year":1990,"birth_month":5,"birth_day":15}' | python run_api.py
"""

import json
import sys

from bazi_nail_logic import run_from_dict


def main() -> None:
    try:
        raw = sys.stdin.read()
        params = json.loads(raw)
        result = run_from_dict(params)
        sys.stdout.write(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()
