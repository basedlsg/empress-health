"""Reproduce the seeded worked example from the Python engine's __main__ block.

Emits {"1": 5, "2": 9, ...} so the JS harness can feed it back through both
engines and compare.
"""
import random
import json
import sys

random.seed(2024)
responses = {q: random.randint(3, 7) for q in range(1, 121)}
responses[2] = 9
responses[41] = 9
responses[99] = 8
responses[13] = None
sys.stdout.write(json.dumps({str(k): v for k, v in responses.items()}))
