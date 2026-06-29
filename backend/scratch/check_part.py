from google.genai import types
import base64

part = types.Part.from_bytes(data=b"hello", mime_type="image/jpeg")
print(f"Type: {type(part)}")
print(f"Attributes: {dir(part)}")
if hasattr(part, 'inline_data'):
    print(f"Inline Data: {part.inline_data}")
    print(f"Mime Type: {part.inline_data.mime_type}")
    print(f"Data type: {type(part.inline_data.data)}")
