# C&Y Engineering 사내 인트라넷

GitHub + Cloudflare로 빌드/배포하는 **정적(static) 사내 인트라넷** 시작 코드입니다.
빌드 도구 없이 순수 HTML/CSS/JS로 동작하므로, GitHub에 올리고 Cloudflare에 연결만 하면 됩니다.

---

## 0. 이게 어떻게 동작하나요 (전체 그림)

```
[ 내가 GitHub에 코드 push ]
            │  (자동 감지)
            ▼
[ Cloudflare Pages 가 자동 빌드·배포 ]  →  전 세계 엣지에 공개 URL 생성
            │
            ▼
[ Cloudflare Access(Zero Trust) 가 앞단에서 인증 ]  ← 사내 직원만 통과
            │
            ▼
[ 인증된 직원만 인트라넷 화면 접속 ]
```

> 핵심: 정적 사이트 자체에는 로그인 기능이 없습니다.
> **반드시 Cloudflare Access로 감싸야** "사내 전용"이 됩니다. (4단계)

---

## 1. 파일 구조

| 파일 | 역할 | 누가 수정 |
|---|---|---|
| `index.html` | 화면 뼈대 | 개발자 |
| `styles.css` | 디자인(색/폰트는 상단 토큰만 바꾸면 됨) | 개발자 |
| `data.js` | **공지·바로가기·구성원 내용** | 콘텐츠 담당(여기만!) |
| `app.js` | 렌더링 로직 | 보통 안 건드림 |
| `_headers` | 보안 헤더 | 개발자 |
| `.gitignore` | Git 제외 목록 | — |

---

## 2. 준비물

- GitHub 계정 (조직 계정 권장: `github.com/cny-engineering` 등)
- Cloudflare 계정 (무료 플랜으로 충분)
- (선택) 회사 도메인이 Cloudflare에 등록되어 있으면 `intranet.cnystructure.com` 같은 주소 사용 가능

---

## 3. 단계별 배포

### STEP 1 — GitHub에 코드 올리기

이 폴더(`cny-intranet/`)를 통째로 새 저장소에 올립니다. **Private(비공개) 저장소**로 만드세요.

터미널로 한다면:

```bash
cd cny-intranet
git init
git add .
git commit -m "사내 인트라넷 초기 버전"
git branch -M main
# 아래 URL은 GitHub에서 새 저장소 만든 뒤 나오는 주소로 교체
git remote add origin https://github.com/<조직>/<저장소>.git
git push -u origin main
```

> GitHub 웹에서 "Add file → Upload files"로 드래그 업로드해도 됩니다(터미널 없이 가능).

---

### STEP 2 — Cloudflare Pages에 연결 (자동 배포)

> 2026년 기준, Cloudflare는 새 프로젝트에 **Workers(정적 자산 포함)** 를 권장하지만,
> "git push → 자동 배포"가 목적인 단순 정적 사이트는 **Pages가 여전히 가장 간단**합니다.
> 나중에 동적 기능(DB, API)이 필요해지면 Workers로 확장하면 됩니다(아래 8번 참고).

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 계정 연결 → 방금 만든 저장소 선택
3. 빌드 설정:
   - **Framework preset**: `None`
   - **Build command**: (비워둠)
   - **Build output directory**: `/`  *(루트에 index.html이 있으므로)*
4. **Save and Deploy** 클릭

→ 잠시 후 `https://<프로젝트명>.pages.dev` 형태의 URL이 생성됩니다.
이제 `main` 브랜치에 push할 때마다 자동 재배포됩니다.

---

### STEP 3 — (선택) 회사 도메인 연결

`*.pages.dev` 대신 `intranet.cnystructure.com`을 쓰려면:

1. Pages 프로젝트 → **Custom domains** → **Set up a custom domain**
2. `intranet.cnystructure.com` 입력
3. 도메인이 이미 Cloudflare에 있으면 DNS 레코드가 자동 생성됩니다.
   (외부 DNS면 안내되는 CNAME 레코드를 직접 추가)

---

### STEP 4 — Cloudflare Access로 "사내 전용" 잠그기 ⭐ (가장 중요)

이 단계를 빼면 누구나 URL로 접속할 수 있습니다. 반드시 설정하세요.

1. Cloudflare 대시보드 → **Zero Trust** (처음이면 팀 이름 설정, 무료 플랜 선택 — **최대 50명 무료**)
2. **Settings → Authentication**에서 로그인 방식 추가
   - 가장 간단: **One-time PIN(OTP)** → 이메일로 일회용 코드 전송 (Google/MS SSO 설정 불필요)
   - 회사가 Google Workspace를 쓰면 **Google**을 IdP로 연결하면 더 편합니다.
3. **Access controls → Applications → Create new application** → **Self-hosted and private**
4. **Add public hostname** → 3단계의 도메인(예: `intranet.cnystructure.com`) 선택, Path는 `*`
   - (Pages 기본 도메인 `*.pages.dev`도 보호 가능)
5. **Access policies → Create policy**
   - Action: **Allow**
   - Rule: **Emails ending in** → `@cnystructure.com`
     (또는 **Emails**로 허용할 직원 이메일을 직접 나열)
6. 저장.

> Access는 **기본이 deny(차단)** 입니다. Allow 정책에 맞는 사람만 통과합니다.
> 회사 이메일 도메인으로 거르면, 신규 입사자는 이메일만 있으면 자동 허용되어 관리가 편합니다.

설정 후 인트라넷 헤더 우측에 로그인한 사용자의 이메일이 표시됩니다
(`app.js`가 Access의 `/cdn-cgi/access/get-identity`를 호출).

---

### STEP 5 — 내용 수정하고 반영하기

1. `data.js`를 열어 공지·바로가기·구성원을 수정
2. GitHub에 저장(commit & push) — 웹에서 파일 편집 후 "Commit changes"만 눌러도 됨
3. 1~2분 뒤 Cloudflare가 자동 재배포 → 사이트에 반영

> 콘텐츠 담당자는 `data.js` **한 파일만** 다루면 됩니다.

---

## 6. 비용

| 항목 | 비용 |
|---|---|
| Cloudflare Pages (정적 호스팅, 무제한 대역폭) | 무료 |
| Cloudflare Access (Zero Trust) | **50명까지 무료** |
| 도메인 | 기존 회사 도메인 사용 시 추가 비용 없음 |

소규모 사무실 인트라넷은 사실상 **무료**로 운영 가능합니다.

---

## 7. 보안 체크리스트

- [ ] 저장소는 **Private**으로 (정적 파일은 Access를 안 붙이면 공개로 노출됨)
- [ ] **Cloudflare Access** 정책으로 회사 이메일만 허용 (4단계)
- [ ] `data.js`에 **비밀번호·API 키·민감정보 절대 금지** (브라우저로 그대로 노출됨)
- [ ] `_headers`의 보안 헤더 적용 확인 (CSP, X-Frame-Options 등)
- [ ] 외부 바로가기 링크는 `app.js`가 자동으로 `rel="noopener"` 처리함

---

## 8. 다음 단계 (확장이 필요해지면)

이 시작 코드는 **정적**이라 공지/구성원을 코드로 관리합니다.
아래 기능이 필요해지면 **Cloudflare Workers + 저장소**로 확장하세요.

| 원하는 기능 | 추천 방식 | 비고 |
|---|---|---|
| 공지를 화면에서 직접 작성/수정 | Workers + **D1**(SQLite DB) | 간단한 CRUD API |
| 파일/문서 업로드 | Workers + **R2**(오브젝트 스토리지) | S3 호환 |
| 간단한 설정/세션 저장 | Workers + **KV** | 키-값 저장 |
| 시스템 현황 자동 모니터링 | Workers Cron + 헬스체크 | `data.js` 수동 표시 대체 |

> 확장 시에도 **Cloudflare Access**가 그대로 인증을 담당하므로,
> Worker 코드에서는 Access가 검증한 사용자 이메일을 신뢰하고 쓰면 됩니다.

---

## 로컬에서 미리 보기

빌드가 없으므로 파일을 그대로 열어도 되지만,
일부 브라우저는 `file://`에서 fetch를 막으므로 간단한 로컬 서버를 권장합니다:

```bash
# Python이 있으면
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```

(로컬에서는 Access가 없으므로 로그인 칩이 "게스트 미리보기"로 표시됩니다 — 정상)
