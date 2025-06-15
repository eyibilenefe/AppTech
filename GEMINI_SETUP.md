# IYTE-Bot Gemini AI Entegrasyonu

Bu proje, İzmir Yüksek Teknoloji Enstitüsü kampüs asistanı için Google Gemini AI entegrasyonu içerir.

## Kurulum

### 1. Gemini API Key Alma

1. [Google AI Studio](https://makersuite.google.com/app/apikey) sayfasına gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API key'inizi kopyalayın

### 2. Environment Variables Ayarlama

`.env` dosyasında `EXPO_PUBLIC_GEMINI_API_KEY` değerini gerçek API key'iniz ile değiştirin:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Paket Yüklemesi

```bash
npm install @google/generative-ai
```

## Özellikler

- 🤖 **Akıllı Campus Asistanı**: Gemini AI ile desteklenen doğal dil anlama
- 🏫 **Kampüs Bilgileri**: Kafeterya, spor tesisleri, kütüphane bilgileri
- 💬 **Konuşma Geçmişi**: Bağlamsal sohbet deneyimi
- 🔄 **Offline Fallback**: İnternet bağlantısı olmadığında yerel yanıtlar
- 📱 **React Native Uyumlu**: iOS ve Android platformlarında çalışır

## Kullanım

AI chat ekranı şu özellikleri sunar:

- Kampüs hizmetleri hakkında sorular
- Gerçek zamanlı AI yanıtları
- Typing indicator
- Konuşma geçmişi
- Hata durumunda graceful fallback

## API Yanıt Konuları

IYTE-bot şu konularda yardımcı olabilir:

- 🍽️ **Kafeterya**: Menü, saatler, rezervasyon
- 🏃‍♂️ **Spor Tesisleri**: Gym, tenis kortu, havuz rezervasyonu
- 📚 **Kütüphane**: Çalışma odaları, kitap arama
- 💳 **Kampüs Kartı**: Bakiye sorgulama, yükleme
- 🏫 **Genel Bilgiler**: Bina konumları, etkinlikler

## Güvenlik

- API key'ler environment variable olarak saklanır
- Gemini API üzerinden güvenli iletişim
- Hata durumları graceful şekilde handle edilir

## Geliştirme

```bash
# Development server başlat
npx expo start

# Android'de çalıştır
npx expo run:android

# iOS'te çalıştır (sadece macOS'te)
npx expo run:ios
```
