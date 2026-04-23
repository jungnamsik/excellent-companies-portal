# 기업성장브릿지 맵

영등포구, 강서구, 양천구의 우수 기업을 홍보하는 인터랙티브 포털 웹사이트입니다.

## 🌟 주요 기능

### 📍 구글 지도 통합
- 모든 기업의 위치를 지도에 마커로 표시
- 기업 목록 클릭 시 해당 위치로 자동 이동
- 마우스 오버 시 위치 강조 표시

### 🔍 검색 및 필터
- **실시간 검색**: 기업명, 업종, 인증, 수상내역으로 검색
- **지역 필터**: 영등포구, 강서구, 양천구별 필터링
- **기업 목록**: 50개 기업 정보 표시

### 📋 상세 기업 정보
- 회사명, 로고, 업종
- 근로자수
- 정부인증내역
- 수상내역
- 복지혜택
- 근무환경특징
- 기업소개사진
- 홈페이지 링크

### 📱 반응형 디자인
- 데스크톱, 태블릿, 모바일 최적화
- 직관적인 사용자 인터페이스

## 🛠️ 기술 스택

- **프론트엔드**: React 19 + TypeScript
- **스타일링**: Tailwind CSS 4 + 커스텀 CSS
- **지도**: Google Maps API
- **빌드**: Vite
- **데이터**: 정적 JavaScript 객체 (companies.ts)

## 📁 프로젝트 구조

```
excellent-companies-portal/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx          # 메인 페이지
│   │   ├── components/
│   │   │   └── Map.tsx           # 구글 지도 컴포넌트
│   │   ├── data/
│   │   │   └── companies.ts      # 기업 데이터 (50개)
│   │   ├── styles/
│   │   │   └── home.css          # 커스텀 스타일
│   │   └── index.css             # 글로벌 스타일
│   ├── public/
│   └── index.html
├── dist/                          # 빌드 결과물
└── README.md
```

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드된 파일 미리보기
pnpm preview
```

## 📊 기업 데이터 관리

### 데이터 파일 위치
`client/src/data/companies.ts`

### 기업 정보 구조

```typescript
interface Company {
  id: string;                    // 고유 식별자 (예: 'yeo-001')
  name: string;                  // 회사명
  region: 'yeongdeungpo' | 'gangseo' | 'yangcheon';  // 지역
  lat: number;                   // 위도
  lng: number;                   // 경도
  logo: string;                  // 로고 URL
  industry: string;              // 업종/주요사업내용
  employees: number;             // 근로자수
  certifications: string[];      // 정부인증내역
  awards: string[];              // 수상내역
  benefits: string[];            // 복지혜택
  workEnvironment: string[];     // 근무환경특징
  images: string[];              // 기업소개사진 URL
  website: string;               // 홈페이지 주소
}
```

### 기업 추가/수정 방법

1. `client/src/data/companies.ts` 파일 열기
2. `companies` 배열에 새 기업 객체 추가 또는 기존 정보 수정
3. 파일 저장 (개발 서버 실행 중이면 자동 반영)

**예시**:
```typescript
{
  id: 'yeo-051',
  name: '새로운 회사',
  region: 'yeongdeungpo',
  lat: 37.5200,
  lng: 126.9000,
  logo: 'https://example.com/logo.png',
  industry: '업종명',
  employees: 100,
  certifications: ['인증1', '인증2'],
  awards: ['수상1', '수상2'],
  benefits: ['복지1', '복지2'],
  workEnvironment: ['특징1', '특징2'],
  images: ['https://example.com/image1.jpg'],
  website: 'https://example.com'
}
```

## 🎨 색상 팔레트

| 용도 | 색상 | 코드 |
|------|------|------|
| 주색상 | 진한 파란색 | #1e40af |
| 강조색 | 밝은 파란색 | #3b82f6 |
| 보조색 | 하늘색 | #0ea5e9 |
| 배경 | 밝은 회색 | #f8fafc |

## 📋 지역별 기업 수

- **영등포구** (yeongdeungpo): 10개 기업
- **강서구** (gangseo): 10개 기업
- **양천구** (yangcheon): 30개 기업
- **총계**: 50개 기업

## 🔗 배포

### GitHub Pages 배포

1. GitHub 저장소 설정
2. `dist/public` 폴더의 내용을 GitHub Pages로 배포
3. 자동 배포 설정 (GitHub Actions)

### Manus 호스팅

현재 Manus 플랫폼에서 호스팅 중입니다.
- 도메인: `excellentco-e6wq2man.manus.space`
- 자동 배포 및 HTTPS 지원

## 📝 주요 파일 설명

| 파일 | 설명 |
|------|------|
| `Home.tsx` | 메인 페이지 - 지도, 검색, 필터, 기업 목록 |
| `Map.tsx` | 구글 지도 컴포넌트 |
| `companies.ts` | 50개 기업의 정적 데이터 |
| `home.css` | 페이지 스타일 |
| `index.css` | 글로벌 스타일 및 색상 변수 |

## 🎯 사용 가이드

### 기업 검색
1. 검색창에 기업명, 업종, 인증, 수상내역 입력
2. 실시간으로 일치하는 기업 표시

### 지역 필터
1. "지역 선택" 섹션에서 지역 선택
2. 해당 지역의 기업만 표시

### 기업 정보 확인
1. 기업 목록에서 기업 클릭
2. 우측 상단에 기업 정보 모달 표시
3. 지도에 해당 위치 표시

### 지도 상호작용
1. 기업 목록 마우스 오버 시 지도에 위치 강조
2. 기업 선택 시 지도 자동 이동
3. 마커 클릭으로 기업 정보 확인

## 🔧 개발 팁

### 환경 변수
- Google Maps API는 Manus 프록시를 통해 자동 인증됨
- 별도의 API 키 설정 불필요

### 성능 최적화
- 정적 데이터 사용으로 빠른 로딩
- 마커 캐싱으로 지도 성능 최적화
- 반응형 이미지 처리

### 커스터마이징
- `home.css`에서 색상 및 레이아웃 수정 가능
- `companies.ts`에서 기업 정보 관리
- React 컴포넌트 구조로 확장 용이

## 📞 지원

문제 발생 시:
1. 브라우저 개발자 도구 콘솔 확인
2. 기업 데이터 형식 검증 (`companies.ts`)
3. 지도 마커 위도/경도 확인

## 📄 라이선스

MIT License

## 👥 기여

기업 정보 추가 또는 기능 개선 시 Pull Request 제출 부탁드립니다.

---

**마지막 업데이트**: 2026년 4월 22일

**버전**: 1.0.0
