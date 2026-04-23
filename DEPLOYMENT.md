# GitHub Pages 배포 가이드

이 문서는 기업성장브릿지 맵을 GitHub Pages에 배포하는 방법을 설명합니다.

## 📋 전제 조건

- GitHub 계정
- Git이 설치된 로컬 환경
- Node.js 및 pnpm 설치

## 🚀 배포 단계

### 1단계: 저장소 설정

GitHub에서 새 저장소를 생성하거나 기존 저장소를 사용합니다.

```bash
# 저장소 클론 (이미 있는 경우)
git clone https://github.com/your-username/excellent-companies-portal.git
cd excellent-companies-portal
```

### 2단계: 로컬에서 빌드

```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm build
```

빌드 완료 후 `dist/public` 폴더에 정적 파일이 생성됩니다.

### 3단계: GitHub Pages 설정

#### 방법 1: 자동 배포 (권장)

GitHub Actions를 사용한 자동 배포:

1. `.github/workflows/deploy.yml` 파일 생성 (아래 내용 참고)
2. 저장소 Settings → Pages → Source를 "GitHub Actions"로 설정
3. main 브랜치에 푸시하면 자동 배포

#### 방법 2: 수동 배포

1. `dist/public` 폴더의 모든 파일을 `gh-pages` 브랜치로 푸시
2. 저장소 Settings → Pages → Source를 `gh-pages` 브랜치로 설정

```bash
# gh-pages 브랜치 생성 및 배포
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/public/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 4단계: 배포 확인

1. GitHub 저장소의 Settings → Pages 확인
2. "Your site is live at" 링크 클릭
3. 웹사이트가 정상 작동하는지 확인

## 🔄 자동 배포 워크플로우

`.github/workflows/deploy.yml` 파일 내용:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './dist/public'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## 📝 기업 정보 수정 후 배포

1. `client/src/data/companies.ts` 파일 수정
2. 로컬에서 테스트:
   ```bash
   pnpm dev
   ```
3. 변경사항 커밋 및 푸시:
   ```bash
   git add .
   git commit -m "Update company information"
   git push origin main
   ```
4. GitHub Actions가 자동으로 빌드 및 배포

## 🔗 커스텀 도메인 설정

GitHub Pages에서 커스텀 도메인을 사용하려면:

1. 저장소 Settings → Pages
2. "Custom domain" 입력
3. DNS 레코드 설정 (도메인 제공자에서)
4. `CNAME` 파일이 자동 생성됨

## 🐛 문제 해결

### 배포 후 페이지가 빈 화면

- `dist/public/index.html` 파일 확인
- 빌드 로그에서 에러 확인
- 브라우저 개발자 도구 콘솔 확인

### 자산 파일(CSS, JS)이 로드되지 않음

- 저장소 Settings → Pages → Source 설정 확인
- 빌드 경로 확인 (`dist/public`)
- 캐시 초기화 (Ctrl+Shift+Delete)

### 지도가 표시되지 않음

- Google Maps API 프록시 설정 확인
- 브라우저 콘솔의 CORS 에러 확인
- 위도/경도 값 검증

## 📊 배포 상태 모니터링

GitHub 저장소의 "Actions" 탭에서:
- 배포 진행 상황 확인
- 빌드 로그 확인
- 배포 실패 시 에러 메시지 확인

## 🔐 보안 고려사항

- GitHub 토큰 관리 (자동 생성됨)
- 민감한 정보는 환경 변수로 관리
- 정기적인 의존성 업데이트

## 📈 성능 최적화

배포된 사이트의 성능을 향상시키기 위해:

1. **이미지 최적화**: 기업 로고 및 사진 압축
2. **캐싱**: GitHub Pages의 기본 캐싱 활용
3. **CDN**: Cloudflare 같은 CDN 서비스 추가 (선택사항)

## 📞 지원

배포 관련 문제 발생 시:

1. GitHub Actions 로그 확인
2. 빌드 명령 로컬에서 테스트
3. 저장소 설정 재확인

---

**마지막 업데이트**: 2026년 4월 23일
