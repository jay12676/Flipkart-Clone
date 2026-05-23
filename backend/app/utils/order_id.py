import secrets

_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
_ORDER_NUMBER_LEN = 16


def generate_order_number() -> str:
    suffix = "".join(secrets.choice(_ALPHABET) for _ in range(_ORDER_NUMBER_LEN))
    return f"OD{suffix}"
