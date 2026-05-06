import re

with open("constants/QRTypes.ts", "r") as f:
    content = f.read()

# Update QRType
content = content.replace(
    "export type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'vcard' | 'wifi';",
    "export type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'vcard' | 'wifi' | 'mecard' | 'location' | 'facebook' | 'twitter' | 'youtube' | 'event' | 'crypto';"
)

# Update QR_TYPE_LABELS
target_labels = """export const QR_TYPE_LABELS: Record<QRType, string> = {
  url: 'URL',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  vcard: 'vCard',
  wifi: 'Wi-Fi',
};"""

new_labels = """export const QR_TYPE_LABELS: Record<QRType, string> = {
  url: 'URL',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  vcard: 'vCard',
  mecard: 'MeCard',
  location: 'Location',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
  event: 'Event',
  crypto: 'Crypto',
  wifi: 'Wi-Fi',
};"""

content = content.replace(target_labels, new_labels)

# We need to add types for these new data structures
target_interfaces = """export interface WiFiData {"""
new_interfaces = """export interface MeCardData {
  name: string;
  phone: string;
  email: string;
  url: string;
  address: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
}

export interface EventData {
  title: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CryptoData {
  currency: 'bitcoin' | 'ethereum' | 'litecoin';
  address: string;
  amount: string;
}

export interface WiFiData {"""

content = content.replace(target_interfaces, new_interfaces)

with open("constants/QRTypes.ts", "w") as f:
    f.write(content)
