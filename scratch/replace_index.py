import re

with open("app/(tabs)/index.tsx", "r") as f:
    content = f.read()

target = """import QRCode from 'react-native-qrcode-svg';"""
new_target = """import QRCode from 'react-native-qrcode-svg';
import { Image } from 'react-native';"""

if "import { Image } from 'react-native';" not in content:
    content = content.replace(target, new_target)

target_qr = """        <View style={[styles.miniQR, { backgroundColor: previewBg }]}>
          <QRCode
            value={item.content || 'https://example.com'}
            size={74}
            color={item.config.fgColor || '#000000'}
            backgroundColor={previewBg}
            ecl="H"
          />
        </View>"""

new_qr = """        <View style={[styles.miniQR, { backgroundColor: previewBg }]}>
          {item.localImagePath ? (
            <Image source={{ uri: item.localImagePath }} style={{ width: 74, height: 74 }} resizeMode="contain" />
          ) : (
            <QRCode
              value={item.content || 'https://example.com'}
              size={74}
              color={item.config.fgColor || '#000000'}
              backgroundColor={previewBg}
              ecl="H"
            />
          )}
        </View>"""

content = content.replace(target_qr, new_qr)

with open("app/(tabs)/index.tsx", "w") as f:
    f.write(content)
