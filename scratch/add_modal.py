import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

content = content.replace("import { Image } from 'react-native';", "import { Image, Modal } from 'react-native';")

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
