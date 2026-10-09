# Desa Kula VO Studio V2 — Online-ready

Paket frontend sederhana + serverless API TTS. API key dibaca hanya di backend dari environment variable `OPENAI_API_KEY`.

## Deploy menggunakan GitHub + Vercel
1. Buat repository GitHub baru, misalnya `desa-kula-vo-studio`.
2. Upload isi folder ini ke root repository. Jangan upload API key.
3. Import repository ke Vercel dan deploy.
4. Buka Project Settings → Environment Variables.
5. Tambahkan variable `OPENAI_API_KEY` dan isi dengan API key OpenAI Anda.
6. Redeploy setelah variable disimpan.
7. Buka URL deployment, masukkan naskah pendek, pilih preset dan klik Generate VO.

## Catatan penting
- Perlu API key OpenAI dan API billing yang aktif; tiap generate dapat dikenai biaya.
- Maksimum 4.096 karakter per request.
- Teks dikirim ke penyedia TTS untuk diproses; jangan kirim informasi rahasia.
- Audio adalah suara AI. Preset mengatur instruksi gaya bicara, bukan melatih suara eksklusif atau menjamin suara identik setiap kali.
- Sebelum dipakai publik, tambahkan autentikasi dan rate limiting agar endpoint tidak disalahgunakan.
