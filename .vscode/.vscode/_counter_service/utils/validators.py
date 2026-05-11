from typing import Any, Type

class TypeValidator:
    """Validates variable types strictly before executing core functions."""
    
    @staticmethod
    def validate_input(data: Any, expected_type: Type) -> bool:
        """Raises a TypeError if the input data does not match the expected type."""
        if not isinstance(data, expected_type):
            raise TypeError(f"Expected {expected_type.__name__}, got {type(data).__name__}")
        return True