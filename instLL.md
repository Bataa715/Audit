# 🏦 Банкны дотоод сүлжээнд хөгжүүлэлт хийх заавар

## ⚠️ Интернэт хандалт хязгаарлагдмал орчин

Банкны дотоод компьютер дээр ажиллахад дараах асуудлууд тохиолдож болно:

### 🚫 Хаалттай эсвэл хязгаарлагдсан:
- ✖ npm registry (registry.npmjs.org)
- ✖ GitHub raw content
- ✖ CDN servers
- ✖ Docker Hub (зарим тохиолдолд)
- ✖ Гадны API-ууд

---

## 📦 Урьдчилан бэлтгэх (Гэрээсээ эсвэл интернэттэй газраас)

### 1. Dependencies бүгдийг татах

```powershell
# Таны одоогийн project folder-т
cd "C:\Users\Dell\Documents\Golomt 2026\Internal Audit"

# node_modules бүгдийг шинээр татах
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item apps\backend\node_modules -Recurse -Force -ErrorAction SilentlyContinue

npm install
cd apps\backend
npm install
cd ..\..

# SUCCESS: node_modules бүгд татагдлаа
```

### 2. Offline package cache үүсгэх

```powershell
# Package-уудыг cache folder-т хадгалах
npm cache verify
npm pack

# Эсвэл npm-bundle ашиглах
npm install -g npm-bundle
npm-bundle
```

### 3. Docker image урьдчилан татах/бүтээх

```powershell
# Docker image бүтээх (интернэттэй үед)
docker-compose build

# Image-г файл болгож хадгалах
docker save internal-audit:latest -o internal-audit-docker.tar

# Хэмжээ шалгах
ls -lh internal-audit-docker.tar
```

---

## 💾 Зөөх иж бүрдэл бэлтгэх

### Үүсгэх folder бүтэц:

```
Internal-Audit-Offline/
├── source/                    # Таны бүх код
│   ├── apps/
│   ├── node_modules/         # ✅ Татагдсан dependencies
│   ├── package.json
│   └── ...
├── docker/
│   └── internal-audit-docker.tar    # Docker image
├── installers/
│   ├── node-v20-win-x64.msi        # Node.js installer
│   └── docker-desktop.exe          # Docker Desktop
└── README-OFFLINE.txt
```

### Бэлтгэх командууд:

```powershell
# Өөрийн project-г багцлах (node_modules-тай хамт)
$zipName = "Internal-Audit-$(Get-Date -Format 'yyyy-MM-dd').zip"
Compress-Archive -Path "C:\Users\Dell\Documents\Golomt 2026\Internal Audit\*" `
                 -DestinationPath "C:\Users\Dell\Desktop\$zipName" `
                 -CompressionLevel Optimal

Write-Host "✅ Багцлагдсан: Desktop\$zipName" -ForegroundColor Green
```

---

## 🏪 Банкны компьютер дээр суулгах

### Шаардлагатай:
1. ✅ Node.js 20+ (offline installer)
2. ✅ Docker Desktop (offline installer)  
3. ✅ Таны project файлууд (node_modules-тай)

### Алхам 1: Node.js суулгах

```powershell
# Өмнө нь татаж авсан node-v20-win-x64.msi ажиллуулах
# Next, Next, Install...

# Шалгах
node --version
npm --version
```

### Алхам 2: Project задлах

```powershell
# ZIP задлах
Expand-Archive -Path "Internal-Audit-2026-02-12.zip" `
               -DestinationPath "C:\Projects\Internal-Audit"

cd "C:\Projects\Internal-Audit"
```

### Алхам 3: Шууд ажиллуулах (node_modules байгаа учраас)

```powershell
# Backend эхлүүлэх
cd apps\backend
npm run start:prod

# Өөр terminal дээр Frontend эхлүүлэх  
cd apps\nextn
npm run start
```

---

## 🐳 Docker ашиглах (Offline)

### Docker image load хийх:

```powershell
# Татаж ирсэн .tar файлаас
docker load -i internal-audit-docker.tar

# Шалгах
docker images | Select-String "internal-audit"

# Ажиллуулах
docker-compose up -d
```

---

## 🔧 Асуудал гарвал

### 1. npm install хийх шаардлагатай бол

**Хэрэв node_modules байхгүй эсвэл алдаатай бол:**

```powershell
# Option A: Өмнө нь татсан node_modules-ээ copy хийх
# Гэрээсээ: node_modules folder-г USB руу copy
# Банкнаас: USB-аас project folder руу copy

# Option B: Private registry ашиглах (Банк тохируулсан бол)
npm config set registry http://internal-npm-registry.bank.local

# Option C: Offline cache ашиглах
npm install --prefer-offline --no-audit
```

### 2. Ports хаалттай бол

```powershell
# Port солих - .env файл засах
# Backend: 3001 → 8080
# Frontend: 9002 → 8081

# Эсвэл docker-compose.yml дээр:
ports:
  - "8080:3001"  # Backend
  - "8081:9002"  # Frontend
```

### 3. Database файл эвдэрсэн бол

```powershell
cd apps\backend\prisma

# Шинэ database үүсгэх
Remove-Item dev.db -ErrorAction SilentlyContinue
npx prisma db push

# Default admin үүсгэх
npx prisma db seed
```

---

## 📝 Offline Development Checklist

**Урьдчилан хийх (Интернэттэй үед):**

- [ ] `npm install` бүх dependencies татах
- [ ] `node_modules` folders бүгдийг хадгалах
- [ ] Docker image бүтээх (`docker-compose build`)
- [ ] Docker image-г .tar файл болгох
- [ ] Node.js installer татаж авах
- [ ] Docker Desktop installer татаж авах
- [ ] Бүгдийг багцлан zip хийх
- [ ] README файлууд хавсаргах

**Банкны компьютер дээр хийх:**

- [ ] Node.js суулгах
- [ ] Docker Desktop суулгах (хэрэв шаардлагатай)
- [ ] Project файлууд задлах
- [ ] node_modules байгаа эсэхийг шалгах
- [ ] `npm run start` эсвэл `docker-compose up`
- [ ] Browser дээр localhost:9002 нээх

---

## 🔐 Proxy тохиргоо (Хэрэв шаардлагатай бол)

Банк proxy ашигладаг бол:

```powershell
# npm proxy тохируулах
npm config set proxy http://proxy.bank.local:8080
npm config set https-proxy http://proxy.bank.local:8080

# Git proxy
git config --global http.proxy http://proxy.bank.local:8080
git config --global https.proxy http://proxy.bank.local:8080

# Environment variables
$env:HTTP_PROXY = "http://proxy.bank.local:8080"
$env:HTTPS_PROXY = "http://proxy.bank.local:8080"
```

---

## 🆘 Support

Асуудал гарвал:
1. Log файлууд шалгах: `apps/backend/logs/`, `apps/nextn/.next/`
2. `npm run start:dev` ажиллуулж алдааг харах
3. `docker logs internal-audit` шалгах
4. IT Support-той холбогдох

**Анхаар:** Банкны бодлоготой нийцүүлэн зөвшөөрөл авч ажиллаарай! 🏦
