import re

with open("app/(tabs)/history.tsx", "r") as f:
    content = f.read()

target_qr = """              <View style={[styles.cardQRWrap, { backgroundColor: previewBg }]}>
                <QRCode
                  value={item.content || 'https://example.com'}
                  size={64}
                  color={item.config.fgColor || '#000000'}
                  backgroundColor={previewBg}
                  ecl="H"
                />
              </View>"""

new_qr = """              <View style={[styles.cardQRWrap, { backgroundColor: previewBg }]}>
                {item.localImagePath ? (
                  <Image source={{ uri: item.localImagePath }} style={{ width: 64, height: 64 }} resizeMode="contain" />
                ) : (
                  <QRCode
                    value={item.content || 'https://example.com'}
                    size={64}
                    color={item.config.fgColor || '#000000'}
                    backgroundColor={previewBg}
                    ecl="H"
                  />
                )}
              </View>"""

content = content.replace(target_qr, new_qr)

with open("app/(tabs)/history.tsx", "w") as f:
    f.write(content)
