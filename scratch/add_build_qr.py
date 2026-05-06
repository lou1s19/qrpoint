import re

with open("constants/QRTypes.ts", "r") as f:
    content = f.read()

target = """    case 'wifi': {
      const d = data as WiFiData;
      return `WIFI:T:${d.encryption};S:${d.ssid};P:${d.password};H:${d.hidden};`;
    }
    default:
      return String(data);"""

new_target = """    case 'wifi': {
      const d = data as WiFiData;
      return `WIFI:T:${d.encryption};S:${d.ssid};P:${d.password};H:${d.hidden};`;
    }
    case 'mecard': {
      const d = data as MeCardData;
      return `MECARD:N:${d.name};TEL:${d.phone};EMAIL:${d.email};URL:${d.url};ADR:${d.address};;`;
    }
    case 'location': {
      const d = data as LocationData;
      return `geo:${d.latitude},${d.longitude}`;
    }
    case 'facebook':
    case 'twitter':
    case 'youtube': {
      // These are just URLs
      let url = String(data);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url;
    }
    case 'crypto': {
      const d = data as CryptoData;
      return `${d.currency}:${d.address}?amount=${d.amount}`;
    }
    case 'event': {
      const d = data as EventData;
      const formatTime = (t: string) => {
        // Simple formatter, in real app needs date-fns or similar, but for now just strip dashes/colons
        return t.replace(/[-:]/g, '').split('.')[0] + 'Z'; 
      };
      // Expecting ISO string or similar
      return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${d.title}\nLOCATION:${d.location}\nDESCRIPTION:${d.description}\nDTSTART:${formatTime(d.startDate)}\nDTEND:${formatTime(d.endDate)}\nEND:VEVENT\nEND:VCALENDAR`;
    }
    default:
      return String(data);"""

content = content.replace(target, new_target)

with open("constants/QRTypes.ts", "w") as f:
    f.write(content)
