import json
from datetime import datetime
from icecream import ic
"INFO"
"DEBUG"
"INFO"
"ERROR"
class Log:
    _instance = None

    def __new__(cls, debug_mode=True):
        if cls._instance is None:
            cls._instance = super(Log, cls).__new__(cls)
            cls._instance.debug_mode = debug_mode
        return cls._instance

    def _timestamp(self):
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def log_debug(self, *args):
        if self.debug_mode:
            ic(*args)

    def log_info(self, message):
        ic(f"[INFO {self._timestamp()}] {message}")

    def log_error(self, message):
        ic(f"[ERROR {self._timestamp()}] {message}")

    def log_json(self, data):
        try:
            json_str = json.dumps(data, default=str, ensure_ascii=False, indent=2)
            ic(f"[JSON {self._timestamp()}] {json_str}")
        except Exception as e:
            self.log_error(f"Cannot convert to JSON: {e}")

    def show_message(self, message, level="INFO"):
        level = level.upper()
        if level == "DEBUG":
            self.log_debug(message)
        elif level == "INFO":
            self.log_info(message)
        elif level == "ERROR":
            self.log_error(message)
        else:
            ic(f"[{level} {self._timestamp()}] {message}")

gf = Log(debug_mode=True)
