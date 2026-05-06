import re

with open("app/(tabs)/history.tsx", "r") as f:
    content = f.read()

target = """  TextInput,
  Alert,
  StatusBar,
} from 'react-native';"""

new_target = """  TextInput,
  Alert,
  StatusBar,
  Image,
} from 'react-native';"""

content = content.replace(target, new_target)

with open("app/(tabs)/history.tsx", "w") as f:
    f.write(content)
