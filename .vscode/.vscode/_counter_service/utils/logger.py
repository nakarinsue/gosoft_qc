import traceback
import pprint
from icecream import ic

class SystemLogger:
    """Handles system logging, deep error tracebacks, and formatting outputs."""
    
    @staticmethod
    def error_traceback(exception_obj: Exception) -> str:
        """Extracts and displays the exact line and details of an error."""
        error_details = "".join(traceback.format_exception(type(exception_obj), exception_obj, exception_obj.__traceback__))
        print(f"\n[CRITICAL ERROR]\n{error_details}")
        return error_details

    @staticmethod
    def display(data: any) -> None: # type: ignore
        """Pretty prints dictionary or list structures for readability."""
        pprint.pprint(data, indent=4)

    @staticmethod
    def show(message: str) -> None:
        """Prints standard system information and state messages."""
        print(f"[SYSTEM INFO] {message}")

    @staticmethod
    def debug_ic(data: any) -> None: # type: ignore
        """Uses Icecream for variable inspection and deep debugging."""
        ic(data)