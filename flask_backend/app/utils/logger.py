"""
utils/logger.py
---------------
Configures a single named logger used across the entire application.
Provides both a rotating file handler and a coloured console handler.

Usage
-----
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Model loaded in %.2fs", elapsed)
"""

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path


# ── ANSI colour codes for the console handler ─────────────────────────
_LEVEL_COLOURS = {
    "DEBUG":    "\033[36m",   # cyan
    "INFO":     "\033[32m",   # green
    "WARNING":  "\033[33m",   # yellow
    "ERROR":    "\033[31m",   # red
    "CRITICAL": "\033[35m",   # magenta
}
_RESET = "\033[0m"


class _ColourFormatter(logging.Formatter):
    """Adds ANSI colour to the levelname in console output."""

    _FMT = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"
    _DATEFMT = "%H:%M:%S"

    def format(self, record: logging.LogRecord) -> str:
        colour = _LEVEL_COLOURS.get(record.levelname, "")
        record.levelname = f"{colour}{record.levelname}{_RESET}"
        formatter = logging.Formatter(self._FMT, datefmt=self._DATEFMT)
        return formatter.format(record)


def setup_logging(log_dir: Path, level: str = "INFO") -> None:
    """
    Call once from the app factory to initialise root logging.

    Parameters
    ----------
    log_dir : Path
        Directory where tomato_api.log will be written.
    level : str
        Logging level string, e.g. "DEBUG", "INFO", "WARNING".
    """
    log_dir.mkdir(parents=True, exist_ok=True)
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid adding duplicate handlers on hot-reload
    if root_logger.handlers:
        return

    # ── Console handler ───────────────────────────────────────────────
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(_ColourFormatter())
    root_logger.addHandler(console_handler)

    # ── Rotating file handler (10 MB × 5 backups) ─────────────────────
    log_file = log_dir / "tomato_api.log"
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(numeric_level)
    file_handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.  Always call setup_logging() first via the
    app factory — this function is a thin convenience wrapper.
    """
    return logging.getLogger(name)
