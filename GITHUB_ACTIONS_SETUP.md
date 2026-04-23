# GitHub Actions 자동 배포 설정 가이드

이 문서는 GitHub Actions를 사용하여 자동으로 빌드하고 GitHub Pages에 배포하는 방법을 설명합니다.

## 📋 현재 상황

- GitHub 저장소: https://github.com/jungnamsik/excellent-companies-portal
- 소스 코드는 `main` 브랜치에 저장됨
- 빌드된 파일은 GitHub에 저장되지 않음 (`.gitignore`에 포함)

## 🚀 GitHub Actions 설정 방법

### 방법 1: GitHub 웹 인터페이스에서 설정 (권장)

#### 단계 1: GitHub 저장소 방문
1. https://github.com/jungnamsik/excellent-companies-portal 방문
2. **Settings** 탭 클릭

#### 단계 2: Pages 설정
1. 왼쪽 메뉴에서 **Pages** 선택
2. **Source** 섹션에서 **GitHub Actions** 선택
3. 저장

#### 단계 3: 워크플로우 파일 생성
1. **Actions** 탭 클릭
2. **New workflow** 클릭
3. **set up a workflow yourself** 클릭
4. 파일명을 `deploy.yml`로 변경
5. 아래 내용을 복사하여 붙여넣기:

```yaml
name: Build and Deploy to GitHub Pages

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

6. **Commit changes** 클릭
7. "Commit directly to the `main` branch" 선택
8. **Commit changes** 클릭

#### 단계 4: 배포 확인
1. **Actions** 탭에서 워크플로우 실행 상황 확인
2. 모든 단계가 완료되면 배포 완료
3. Settings → Pages에서 배포 URL 확인

### 방법 2: 로컬에서 설정 (대체 방법)

만약 GitHub 웹 인터페이스에서 직접 생성하고 싶다면:

1. 로컬에서 새 브랜치 생성:
```bash
git checkout -b add-github-actions
```

2. 워크플로우 파일 생성:
```bash
mkdir -p .github/workflows
```

3. `.github/workflows/deploy.yml` 파일 생성 (위의 YAML 내용 복사)

4. 커밋 및 푸시:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push origin add-github-actions
```

5. GitHub에서 Pull Request 생성 및 병합

## ✅ 배포 확인 체크리스트

- [ ] GitHub 저장소의 **Settings → Pages** 방문
- [ ] **Source**가 "GitHub Actions"로 설정됨
- [ ] **Actions** 탭에서 "Build and Deploy to GitHub Pages" 워크플로우 실행됨
- [ ] 워크플로우의 모든 단계가 초록색(성공) 표시됨
- [ ] Pages 설정에서 배포 URL 표시됨
- [ ] 배포 URL 방문하여 웹사이트 확인 가능

## 🔄 배포 프로세스

GitHub Actions 워크플로우가 자동으로:

1. **코드 체크아웃**: 최신 소스 코드 가져오기
2. **환경 설정**: Node.js 및 pnpm 설치
3. **의존성 설치**: `pnpm install` 실행
4. **빌드**: `pnpm build` 실행
5. **아티팩트 업로드**: `dist/public` 폴더 업로드
6. **배포**: GitHub Pages에 배포

## 📊 배포 모니터링

### 배포 상태 확인
1. GitHub 저장소의 **Actions** 탭 방문
2. "Build and Deploy to GitHub Pages" 워크플로우 클릭
3. 최신 실행 상황 확인

### 배포 로그 확인
1. 워크플로우 실행 클릭
2. **build** 또는 **deploy** 작업 클릭
3. 각 단계의 로그 확인

### 배포 URL 확인
1. Settings → Pages 방문
2. "Your site is live at" 섹션에서 URL 확인
3. 예: `https://jungnamsik.github.io/excellent-companies-portal/`

## 🔧 문제 해결

### 배포가 실패하는 경우

**1. 빌드 실패**
- GitHub Actions 로그에서 에러 메시지 확인
- 로컬에서 `pnpm build` 실행하여 테스트
- 에러 수정 후 다시 푸시

**2. 배포 실패**
- Pages 설정에서 Source가 "GitHub Actions"로 설정되어 있는지 확인
- 워크플로우 파일의 `path: './dist/public'` 확인
- GitHub Actions 로그에서 "Upload artifact" 단계 확인

**3. 페이지가 표시되지 않음**
- 배포 URL이 올바른지 확인
- 브라우저 캐시 초기화 (Ctrl+Shift+Delete)
- 몇 분 기다린 후 새로고침

### 기업 정보 수정 후 배포되지 않음

1. 파일 저장 확인
2. 커밋 및 푸시 확인:
```bash
git add client/src/data/companies.ts
git commit -m "Update company information"
git push origin main
```
3. GitHub Actions 워크플로우 실행 확인 (Actions 탭)

## 📝 주요 포인트

| 항목 | 설명 |
|------|------|
| **소스 코드** | `main` 브랜치에 저장 |
| **빌드 명령** | `pnpm build` |
| **배포 폴더** | `dist/public` |
| **배포 대상** | GitHub Pages |
| **배포 URL** | `https://jungnamsik.github.io/excellent-companies-portal/` |

## 🎯 다음 단계

1. **워크플로우 파일 생성**
   - GitHub 웹 인터페이스에서 위의 YAML 내용으로 파일 생성
   - 또는 로컬에서 생성 후 푸시

2. **배포 확인**
   - Actions 탭에서 워크플로우 실행 확인
   - 배포 URL 방문하여 웹사이트 확인

3. **기업 정보 수정**
   - `client/src/data/companies.ts` 수정
   - 커밋 및 푸시
   - 자동으로 재배포됨

## 💡 팁

- **수동 배포**: Actions 탭에서 "Run workflow" 클릭하여 수동 배포 가능
- **배포 시간**: 일반적으로 2-5분 소요
- **캐싱**: 의존성 캐싱으로 배포 시간 단축
- **로그**: 모든 배포 로그는 Actions 탭에서 확인 가능

---

**마지막 업데이트**: 2026년 4월 23일
