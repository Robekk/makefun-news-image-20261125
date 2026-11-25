#!/usr/bin/env python3
"""make.fun entry: news-image-20261125, "Sum up 25 November's world news
in one image".

The front page itself is committed beside this file as entry.png. Running
this program publishes that page into the harness output directory under
the same name. It uses only the Python standard library, touches no
network, and produces the identical bytes on every run.
"""

import hashlib
import os
import shutil
import sys

PAGE_NAME = "entry.png"
ENV_VARS = ("MAKEFUN_OUTPUT_DIR", "OUTPUT_DIR")
FALLBACK_DIR = "/output"


def pick_output_dir() -> str:
    """First non-empty output variable wins; /output is the fallback."""
    for name in ENV_VARS:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return FALLBACK_DIR


def digest(path: str) -> str:
    """SHA-256 of a file, read in blocks so a big page stays cheap."""
    hasher = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(65536), b""):
            hasher.update(block)
    return hasher.hexdigest()


def publish() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    source = os.path.join(here, PAGE_NAME)
    target_dir = pick_output_dir()
    os.makedirs(target_dir, exist_ok=True)
    target = os.path.join(target_dir, PAGE_NAME)
    shutil.copyfile(source, target)
    return 0 if digest(source) == digest(target) else 1


if __name__ == "__main__":
    sys.exit(publish())
