# Game Services

## Servis Ayrıntıları

1. **userService**
   - Kullanıcının verilerini çeken servistir.

2. **productService**
   - Oyun içi ürünleri getiren, oyun içi ürün ekleyen servislerdir.

3. **purchaseService**
   - Oyun içi ürünleri satın almayı sağlayan, satılan adeti artıran, kullanıcıya atayan ve bu işlemler için ürün işlem kaydı yaratan servistir.

4. **paymentService**
   - Kullanıcının kredi kartı ile altın alıp, bu işlemler için ödeme işlem kaydı yaratan servistir.

## Sistem Mimarisi, Güvenlik ve Ölçeklenebilirlik

1. **Tüm Servisler Firebase Cloud Functions ile Hizmete Açıldı**
   - Projenin tüm arka uç işlevleri Firebase Cloud Functions kullanılarak oluşturuldu ve hizmete sunuldu.

2. **Kayıt ve Giriş İşlemleri için Firebase Google Sign-In Kullanıldı**
   - Kullanıcıların hızlı ve güvenli bir şekilde kayıt olup giriş yapabilmeleri için Firebase Google Sign-In entegrasyonu yapıldı.

3. **Firestore Batch Kullanılarak Transactionlar Atomik Hale Getirildi**
   - Firestore'da yapılan çoklu kayıtlar Firestore Batch kullanılarak atomik hale getirildi.

4. **Firestore Production Rule Kuralları Özelleştirildi**
   - Firestore güvenlik kuralları sadece oturum açmış kullanıcıların verilere erişimini sağlayacak şekilde özelleştirildi.

5. **Firebase onCall Fonksiyonları ile Servisler Erişime Açıldı**
   - Servisler, Firebase Client SDK ile erişime açık hale getirildi ve Firebase Authentication ile otomatik doğrulama sağlandı.

6. **Firestore ve Firebase Fonksiyon ve Triggerları Aynı Bölgeye Deploy Edildi**
   - Tüm Firestore ve Firebase fonksiyonları ile tetikleyiciler aynı bölgede (Frankfurt) deploy edildi.

7. **Braintree Gateway erişimi Firebase Authentication ile doğrulanarak sağlandı**
   - Ödeme yapacak kullanıcılar Firebase Function kullanılarak Firebase Authentication doğrulaması ile Gateway erişimine sunuldu. 

## Trigger Servisleri

1. **createUserTrigger**
   - Kullanıcı ilk kez oturum açtığında, otomatik olarak bir Firestore dokümanı yaratan bir trigger oluşturuldu.

2. **paymentTransactionTrigger**
   - Ödeme işlemi sonrasında otomatik olarak tetiklenen ve işlemleri loglayan bir trigger oluşturuldu.

## Veritabanı Şeması

![Veritabanı Şeması](dbschema.png)

---

## Kullanılan Teknolojiler

- **Firebase Cloud Functions**
- **Firebase Firestore**
- **Firebase Authentication**
- **Firebase Google Sign-In**
- **Node.js**
- **Express.js**
- **Braintree Sandbox**
- **PayPal**

## Kurulum ve Kullanım

    - web dizininin terminalinden "npm start" ile çalıştırın
