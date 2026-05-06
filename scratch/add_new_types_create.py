import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# 1. Update QR_TYPES array
content = content.replace(
    "const QR_TYPES: QRType[] = ['url', 'wifi', 'vcard', 'text', 'email', 'phone', 'sms'];",
    "const QR_TYPES: QRType[] = ['url', 'text', 'email', 'phone', 'sms', 'vcard', 'mecard', 'location', 'facebook', 'twitter', 'youtube', 'event', 'crypto', 'wifi'];"
)

# 2. Add states for new types
target_states = """  const [vcEmail, setVcEmail] = useState('');
  const [vcCompany, setVcCompany] = useState('');"""

new_states = """  const [vcEmail, setVcEmail] = useState('');
  const [vcCompany, setVcCompany] = useState('');

  const [mcName, setMcName] = useState('');
  const [mcPhone, setMcPhone] = useState('');
  const [mcEmail, setMcEmail] = useState('');
  const [mcUrl, setMcUrl] = useState('');
  const [mcAddress, setMcAddress] = useState('');

  const [locLat, setLocLat] = useState('');
  const [locLng, setLocLng] = useState('');

  const [evTitle, setEvTitle] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');

  const [cryptoCurrency, setCryptoCurrency] = useState<'bitcoin'|'ethereum'|'litecoin'>('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');"""

content = content.replace(target_states, new_states)

# 3. Update currentData
target_currentData = """      case 'wifi': return { ssid: wifiSsid, password: wifiPassword, encryption: wifiEnc, hidden: wifiHidden };
      case 'vcard': return { firstName: vcFirstName, lastName: vcLastName, phone: vcPhone, email: vcEmail, company: vcCompany, website: vcWebsite };
      default: return textContent;"""

new_currentData = """      case 'wifi': return { ssid: wifiSsid, password: wifiPassword, encryption: wifiEnc, hidden: wifiHidden };
      case 'vcard': return { firstName: vcFirstName, lastName: vcLastName, phone: vcPhone, email: vcEmail, company: vcCompany, website: vcWebsite };
      case 'mecard': return { name: mcName, phone: mcPhone, email: mcEmail, url: mcUrl, address: mcAddress };
      case 'location': return { latitude: locLat, longitude: locLng };
      case 'event': return { title: evTitle, location: evLocation, description: evDesc, startDate: evStart, endDate: evEnd };
      case 'crypto': return { currency: cryptoCurrency, address: cryptoAddress, amount: cryptoAmount };
      default: return textContent;"""

content = content.replace(target_currentData, new_currentData)

# 4. Update autoTitle
target_autoTitle = """      case 'wifi': return wifiSsid || 'Wi-Fi QR';
      case 'vcard': return [vcFirstName, vcLastName].filter(Boolean).join(' ') || 'Contact QR';
      default:"""

new_autoTitle = """      case 'wifi': return wifiSsid || 'Wi-Fi QR';
      case 'vcard': return [vcFirstName, vcLastName].filter(Boolean).join(' ') || 'Contact QR';
      case 'mecard': return mcName || 'MeCard QR';
      case 'location': return locLat && locLng ? `Location (${locLat}, ${locLng})` : 'Location QR';
      case 'event': return evTitle || 'Event QR';
      case 'crypto': return `${cryptoCurrency.charAt(0).toUpperCase() + cryptoCurrency.slice(1)} QR`;
      case 'facebook': return 'Facebook QR';
      case 'twitter': return 'Twitter QR';
      case 'youtube': return 'YouTube QR';
      default:"""

content = content.replace(target_autoTitle, new_autoTitle)

# 5. Add UI fields
target_ui = """                {qrType === 'vcard' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>FIRST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Max" placeholderTextColor={C.outline} value={vcFirstName} onChangeText={setVcFirstName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LAST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Smith" placeholderTextColor={C.outline} value={vcLastName} onChangeText={setVcLastName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>PHONE</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={vcPhone} onChangeText={setVcPhone} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>E-MAIL</Text><TextInput style={[styles.input, inputStyle]} placeholder="max@example.com" placeholderTextColor={C.outline} value={vcEmail} onChangeText={setVcEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>COMPANY</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Company Inc." placeholderTextColor={C.outline} value={vcCompany} onChangeText={setVcCompany} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>WEBSITE</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={vcWebsite} onChangeText={setWebsiteDraft} onBlur={() => setWebsiteDraft(vcWebsite)} keyboardType="url" autoCapitalize="none" multiline numberOfLines={2} scrollEnabled /></>}
              </View>"""

new_ui = """                {qrType === 'vcard' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>FIRST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Max" placeholderTextColor={C.outline} value={vcFirstName} onChangeText={setVcFirstName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LAST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Smith" placeholderTextColor={C.outline} value={vcLastName} onChangeText={setVcLastName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>PHONE</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={vcPhone} onChangeText={setVcPhone} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>E-MAIL</Text><TextInput style={[styles.input, inputStyle]} placeholder="max@example.com" placeholderTextColor={C.outline} value={vcEmail} onChangeText={setVcEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>COMPANY</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Company Inc." placeholderTextColor={C.outline} value={vcCompany} onChangeText={setVcCompany} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>WEBSITE</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={vcWebsite} onChangeText={setWebsiteDraft} onBlur={() => setWebsiteDraft(vcWebsite)} keyboardType="url" autoCapitalize="none" multiline numberOfLines={2} scrollEnabled /></>}
                
                {qrType === 'mecard' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Max Smith" placeholderTextColor={C.outline} value={mcName} onChangeText={setMcName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>PHONE</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={mcPhone} onChangeText={setMcPhone} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>E-MAIL</Text><TextInput style={[styles.input, inputStyle]} placeholder="max@example.com" placeholderTextColor={C.outline} value={mcEmail} onChangeText={setMcEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>WEBSITE</Text><TextInput style={[styles.input, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={mcUrl} onChangeText={setMcUrl} keyboardType="url" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>ADDRESS</Text><TextInput style={[styles.input, inputStyle]} placeholder="123 Main St" placeholderTextColor={C.outline} value={mcAddress} onChangeText={setMcAddress} /></>}
                
                {qrType === 'location' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>LATITUDE</Text><TextInput style={[styles.input, inputStyle]} placeholder="e.g. 52.5200" placeholderTextColor={C.outline} value={locLat} onChangeText={setLocLat} keyboardType="numeric" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LONGITUDE</Text><TextInput style={[styles.input, inputStyle]} placeholder="e.g. 13.4050" placeholderTextColor={C.outline} value={locLng} onChangeText={setLocLng} keyboardType="numeric" /></>}
                
                {qrType === 'event' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>EVENT TITLE</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Event" placeholderTextColor={C.outline} value={evTitle} onChangeText={setEvTitle} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LOCATION</Text><TextInput style={[styles.input, inputStyle]} placeholder="Event Location" placeholderTextColor={C.outline} value={evLocation} onChangeText={setEvLocation} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>START DATE (YYYYMMDDTHHMMSS)</Text><TextInput style={[styles.input, inputStyle]} placeholder="20261231T200000" placeholderTextColor={C.outline} value={evStart} onChangeText={setEvStart} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>END DATE (YYYYMMDDTHHMMSS)</Text><TextInput style={[styles.input, inputStyle]} placeholder="20261231T235959" placeholderTextColor={C.outline} value={evEnd} onChangeText={setEvEnd} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>DESCRIPTION</Text><TextInput style={[styles.input, inputStyle, { height: 80 }]} placeholder="Event details..." placeholderTextColor={C.outline} value={evDesc} onChangeText={setEvDesc} multiline /></>}

                {qrType === 'crypto' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>CURRENCY</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.sm }}>
                    {['bitcoin', 'ethereum', 'litecoin'].map(c => (
                      <Pressable key={c} style={[styles.typeBtn, { paddingVertical: 8, paddingHorizontal: 12 }, cryptoCurrency === c && styles.typeBtnActive]} onPress={() => setCryptoCurrency(c as any)}>
                        <Text style={[styles.typeBtnText, cryptoCurrency === c && styles.typeBtnTextActive]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>ADDRESS</Text><TextInput style={[styles.input, inputStyle]} placeholder="Wallet Address" placeholderTextColor={C.outline} value={cryptoAddress} onChangeText={setCryptoAddress} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>AMOUNT</Text><TextInput style={[styles.input, inputStyle]} placeholder="0.0" placeholderTextColor={C.outline} value={cryptoAmount} onChangeText={setCryptoAmount} keyboardType="numeric" /></>}
                
                {['facebook', 'twitter', 'youtube'].includes(qrType) && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>{QR_TYPE_LABELS[qrType]} URL</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder={`https://${qrType}.com/username`} placeholderTextColor={C.outline} value={textContent} onChangeText={setTextContent} onBlur={() => setTextContent(textContent)} keyboardType="url" autoCapitalize="none" multiline numberOfLines={2} scrollEnabled /></>}
              </View>"""

content = content.replace(target_ui, new_ui)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
