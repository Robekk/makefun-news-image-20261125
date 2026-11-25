#!/usr/bin/env python3
"""Entry point for the make.fun bounty news-image-20261125.

Writes the committed front-page image to the output directory as
entry.png. Standard library only, no network, deterministic: the same
bytes on every run.
"""
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(HERE, "entry.png")


def output_dir() -> str:
    for var in ("MAKEFUN_OUTPUT_DIR", "OUTPUT_DIR"):
        value = os.environ.get(var)
        if value:
            return value
    return "/output"


def main() -> int:
    dest_dir = output_dir()
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, "entry.png")
    shutil.copyfile(SOURCE, dest)
    if os.path.getsize(dest) != os.path.getsize(SOURCE):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
