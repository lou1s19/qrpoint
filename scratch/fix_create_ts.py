import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# 1. Fix FileSystem import
content = content.replace("import * as FileSystem from 'expo-file-system';", "import * as FileSystem from 'expo-file-system/legacy';")

# 2. Fix fetchTimeout type
content = content.replace("const fetchTimeout = useRef<NodeJS.Timeout | null>(null);", "const fetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);")

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
