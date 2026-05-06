import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  Animated,
  Easing,
  StatusBar,
  Share,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useTheme } from '@/context/ThemeContext';
import { useQRHistory } from '@/hooks/useQRHistory';
import { DEFAULT_QR_CONFIG } from '@/constants/QRTypes';

const JSQR_HTML = `<!DOCTYPE html><html><body><script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script><canvas id="c"></canvas><script>
function post(type,data){window.ReactNativeWebView.postMessage(JSON.stringify({type:type,data:data||null}));}
function tryDecode(imageData){
  var code=jsQR(imageData.data,imageData.width,imageData.height,{inversionAttempts:'attemptBoth'});
  if(code)return code;
  var src=imageData.data;
  var bin=new Uint8ClampedArray(src.length);
  var min=255,max=0;
  for(var i=0;i<src.length;i+=4){var l=0.299*src[i]+0.587*src[i+1]+0.114*src[i+2];if(l<min)min=l;if(l>max)max=l;}
  var threshold=(min+max)/2;
  for(var j=0;j<src.length;j+=4){var lum=0.299*src[j]+0.587*src[j+1]+0.114*src[j+2];var v=lum<threshold?0:255;bin[j]=v;bin[j+1]=v;bin[j+2]=v;bin[j+3]=255;}
  code=jsQR(bin,imageData.width,imageData.height,{inversionAttempts:'attemptBoth'});
  if(code)return code;
  function dilateBlack(input,radius){
    var w=imageData.width,h=imageData.height;
    var out=new Uint8ClampedArray(input.length);
    for(var y=0;y<h;y++){
      for(var x=0;x<w;x++){
        var black=false;
        for(var dy=-radius;dy<=radius&&!black;dy++){
          for(var dx=-radius;dx<=radius;dx++){
            var nx=x+dx,ny=y+dy;
            if(nx<0||ny<0||nx>=w||ny>=h)continue;
            if(input[(ny*w+nx)*4]===0){black=true;break;}
          }
        }
        var p=(y*w+x)*4;
        var v=black?0:255;
        out[p]=v;out[p+1]=v;out[p+2]=v;out[p+3]=255;
      }
    }
    return out;
  }
  code=jsQR(dilateBlack(bin,1),imageData.width,imageData.height,{inversionAttempts:'attemptBoth'});
  if(code)return code;
  return jsQR(dilateBlack(bin,2),imageData.width,imageData.height,{inversionAttempts:'attemptBoth'});
}
function handleMessage(e) {
  try {
    var msg = JSON.parse(e.data);
    if (msg.type === 'scan' && msg.base64) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.getElementById('c');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var code = tryDecode(imageData);
        post(code ? 'result' : 'error', code ? code.data : null);
      };
      img.onerror=function(){post('error');};
      img.src = 'data:' + (msg.mimeType || 'image/jpeg') + ';base64,' + msg.base64;
    }
  } catch(ex) {}
}
window.addEventListener('message', handleMessage);
document.addEventListener('message', handleMessage);
</script></body></html>`;

function ScanLine({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
    return () => anim.stopAnimation();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });
  return <Animated.View style={[styles.scanLine, { backgroundColor: color, shadowColor: color, transform: [{ translateY }] }]} pointerEvents="none" />;
}

function ResultSheet({ data, onClose, onSave, C }: { data: string; onClose: () => void; onSave: () => void; C: any }) {
  const isURL = /^https?:\/\//i.test(data);
  const isPhone = /^tel:/i.test(data);
  const isEmail = /^mailto:/i.test(data);

  return (
    <View style={[styles.resultSheet, { backgroundColor: C.white }]}>
      <View style={[styles.resultHandle, { backgroundColor: C.outlineVariant }]} />
      <View style={styles.resultHeader}>
        <View style={[styles.resultIconWrap, { backgroundColor: `${C.primary}18` }]}>
          <MaterialIcons name={isURL ? 'link' : isPhone ? 'phone' : isEmail ? 'email' : 'text-snippet'} size={30} color={C.primary} />
        </View>
        <View style={styles.resultMeta}>
          <Text style={[styles.resultType, { color: C.primary }]}>{isURL ? 'URL' : isPhone ? 'PHONE' : isEmail ? 'E-MAIL' : 'TEXT'}</Text>
          <Text style={[styles.resultTitle, { color: C.onSurface }]}>Code scanned</Text>
        </View>
        <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: C.surfaceContainerHigh }]}><MaterialIcons name="close" size={20} color={C.onSurfaceVariant} /></Pressable>
      </View>
      <View style={[styles.resultContentBox, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
        <Text style={[styles.resultData, { color: C.onSurface }]} numberOfLines={4}>{data}</Text>
      </View>
      <View style={styles.resultActions}>
        {(isURL || isPhone || isEmail) && (
          <Pressable style={[styles.resultBtn, styles.resultBtnPrimary, { backgroundColor: C.primary }]} onPress={() => Linking.openURL(data)}>
            <MaterialIcons name="open-in-new" size={20} color="#fff" />
            <Text style={styles.resultBtnPrimaryText}>Open</Text>
          </Pressable>
        )}
        <View style={styles.resultSecondaryRow}>
          <Pressable style={[styles.resultBtnSecondary, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]} onPress={() => Share.share({ message: data })}><MaterialIcons name="share" size={18} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '700' }}>Share</Text></Pressable>
          <Pressable style={[styles.resultBtnSecondary, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]} onPress={onSave}><MaterialIcons name="bookmark" size={18} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '700' }}>Save</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const { colors: C, isDark } = useTheme();
  const webRef = useRef<WebView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const { addItem } = useQRHistory();

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true); setResult(data);
  }

  async function handleSave() {
    if (!result) return;
    await addItem({ id: `scan-${Date.now()}`, title: result.slice(0, 30), type: 'text', content: result, createdAt: Date.now(), isScanned: true, config: DEFAULT_QR_CONFIG });
    Alert.alert('Saved', 'QR code was saved to history.');
  }

  if (!permission || !permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <MaterialIcons name="qr-code-scanner" size={72} color="rgba(255,255,255,0.4)" />
        <Text style={{ ...TYPOGRAPHY.headlineMd, color: '#fff', marginTop: 20, textAlign: 'center' }}>Camera access required</Text>
        <Pressable style={{ marginTop: 20, padding: 15, backgroundColor: C.primary, borderRadius: 10 }} onPress={requestPermission}><Text style={{ color: '#fff' }}>Allow</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" enableTorch={torchOn} onBarcodeScanned={handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} />
      <View style={{ width: 0, height: 0, opacity: 0 }}><WebView ref={webRef} source={{ html: JSQR_HTML }} onMessage={e => {
        const m = JSON.parse(e.nativeEvent.data);
        setScanningImage(false);
        if (m.type === 'result') handleBarcodeScanned({ data: m.data });
        else Alert.alert('Error', 'No QR code found');
      }} javaScriptEnabled /></View>

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan</Text>
          <Pressable style={styles.headerBtn} onPress={() => setTorchOn(v => !v)}><MaterialIcons name={torchOn ? 'flashlight-on' : 'flashlight-off'} size={22} color="white" /></Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.viewfinderWrap} pointerEvents="none">
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: C.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: C.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: C.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: C.primary }]} />
              <ScanLine color={C.primary} />
        </View>
        <Text style={{ color: '#fff', marginTop: 20 }}>Align the code in the frame</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <Pressable style={styles.galleryBtn} onPress={async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ base64: true });
          if (!r.canceled) {
            const asset = r.assets[0];
            const mimeType = asset.mimeType ?? (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
            setScanningImage(true);
            webRef.current?.postMessage(JSON.stringify({ type: 'scan', base64: asset.base64, mimeType }));
          }
        }}>
          {scanningImage ? <ActivityIndicator color="#000" /> : <MaterialIcons name="image" size={20} color="#000" />}
          <Text style={{ color: '#000', fontWeight: 'bold' }}>Gallery</Text>
        </Pressable>
      </SafeAreaView>

      {result && <View style={styles.resultOverlay}><ResultSheet data={result} C={C} onClose={() => { setResult(null); setScanned(false); }} onSave={handleSave} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { ...TYPOGRAPHY.headlineSm, color: 'white' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  viewfinderWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.containerPadding },
  viewfinder: { width: 280, height: 280, borderRadius: 28, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', padding: 16 },
  corner: { position: 'absolute', width: 44, height: 44 },
  cornerTL: { top: 14, left: 14, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
  scanLine: { position: 'absolute', left: 28, right: 28, height: 2, borderRadius: 1 },
  bottomSafe: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 15, backgroundColor: '#fff', borderRadius: 30, elevation: 5 },
  resultOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  resultSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 42, gap: 16 },
  resultHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  resultHeader: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  resultIconWrap: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  resultMeta: { flex: 1 },
  resultType: { ...TYPOGRAPHY.labelSm, letterSpacing: 0.8 },
  resultTitle: { ...TYPOGRAPHY.headlineSm, marginTop: 2 },
  resultContentBox: { borderWidth: 1, borderRadius: 18, padding: 14, minHeight: 74, justifyContent: 'center' },
  resultData: { ...TYPOGRAPHY.bodyMd, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resultActions: { gap: 10 },
  resultBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  resultBtnPrimary: { elevation: 3 },
  resultBtnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultSecondaryRow: { flexDirection: 'row', gap: 10 },
  resultBtnSecondary: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
});
