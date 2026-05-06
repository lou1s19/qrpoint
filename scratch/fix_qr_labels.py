import re

with open("constants/QRTypes.ts", "r") as f:
    content = f.read()

target_labels = """export const QR_TYPE_LABELS: Record<QRType, string> = {
  url: 'URL',
  wifi: 'Wi-Fi',
  vcard: 'vCard',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
};"""

new_labels = """export const QR_TYPE_LABELS: Record<QRType, string> = {
  url: 'URL',
  wifi: 'Wi-Fi',
  vcard: 'vCard',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  mecard: 'MeCard',
  location: 'Location',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
  event: 'Event',
  crypto: 'Crypto',
};"""

content = content.replace(target_labels, new_labels)

target_colors = """export const QR_TYPE_COLORS: Record<QRType, string> = {
  url: '#4648d4',
  wifi: '#00b4d8',
  vcard: '#2d6a4f',
  text: '#6c757d',
  email: '#e63946',
  phone: '#f77f00',
  sms: '#f4a261',
};"""

new_colors = """export const QR_TYPE_COLORS: Record<QRType, string> = {
  url: '#4648d4',
  wifi: '#00b4d8',
  vcard: '#2d6a4f',
  text: '#6c757d',
  email: '#e63946',
  phone: '#f77f00',
  sms: '#f4a261',
  mecard: '#2d6a4f',
  location: '#e63946',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  event: '#7b2d8b',
  crypto: '#f7931A',
};"""

content = content.replace(target_colors, new_colors)

with open("constants/QRTypes.ts", "w") as f:
    f.write(content)
