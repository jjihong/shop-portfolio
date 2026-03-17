# 쇼핑몰 포트폴리오

React + TypeScript · Node.js + Express · PostgreSQL · Prisma · Docker

배포 URL: https://shop-portfolio-six.vercel.app

---

## 프로젝트 소개

JWT 인증, 상품 조회, 장바구니, 주문, 관리자 기능을 갖춘 풀스택 이커머스 서비스입니다.
프론트엔드와 백엔드를 분리 구성하여 REST API 설계부터 배포까지 직접 구현했습니다.

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React, TypeScript, Vite, React Router |
| 백엔드 | Node.js, Express, TypeScript |
| 데이터베이스 | PostgreSQL, Prisma ORM |
| 인증 | JWT, bcrypt |
| 배포 | Vercel (프론트), Railway (백엔드 + DB) |
| 로컬 환경 | Docker Compose |

---

## 주요 기능

- 회원가입 / 로그인 (JWT 인증)
- 상품 목록 조회 (카테고리 필터, 검색)
- 상품 상세 조회
- 장바구니 (담기, 수량 변경, 삭제)
- 주문 생성 및 주문 내역 조회
- 관리자 기능 (상품 등록/수정/삭제, 주문 상태 변경)

---

## 기술 선택 이유

**React + TypeScript**
타입 안정성을 확보하면서 컴포넌트 기반 UI를 구성하기 위해 선택했습니다.

**Node.js + Express**
프론트엔드와 동일한 언어(TypeScript)로 풀스택을 구성해 컨텍스트 스위칭을 줄이고, 빠른 REST API 개발이 가능해 선택했습니다.

**PostgreSQL + Prisma**
관계형 데이터 구조(상품-카테고리-주문-유저)를 명확하게 표현하기 위해 PostgreSQL을 선택했고, Prisma ORM으로 타입 안전한 쿼리를 작성했습니다.

**Docker Compose**
로컬 개발 환경에서 PostgreSQL을 컨테이너로 관리해 환경 의존성 문제를 제거했습니다.

---

## 로컬 실행 방법

### 사전 요구사항
- Node.js 18+
- Docker Desktop

### 실행
```bash
# 1. 레포 클론
git clone https://github.com/jjihong/shop-portfolio.git
cd shop-portfolio

# 2. PostgreSQL 실행
docker-compose up -d

# 3. 백엔드 실행
cd backend
npm install
npx prisma migrate dev
npm run dev

# 4. 프론트엔드 실행
cd ../frontend
npm install
npm run dev
```

### 환경변수

`backend/.env`
```
DATABASE_URL="postgresql://user:password@localhost:5432/shopdb"
JWT_SECRET="임의의 랜덤 문자열"
PORT=4000
```

`frontend/.env`
```
VITE_API_URL=http://localhost:4000
```

---

## 트러블슈팅

**Prisma 버전 호환 문제**
Prisma 7 버전이 `prisma.config.ts` 방식을 요구해 기존 설정과 충돌이 발생했습니다. 5.22.0으로 다운그레이드해 해결했습니다.

**Railway 내부 DB URL 문제**
`prisma migrate deploy` 실행 시 `postgres.railway.internal` 내부 URL은 로컬에서 접근이 불가능합니다. `DATABASE_PUBLIC_URL`로 교체 후 마이그레이션을 실행해 해결했습니다.

**Vercel SPA 라우팅 404 문제**
React Router 사용 시 새로고침하면 404가 발생합니다. `vercel.json`에 rewrite 규칙을 추가해 모든 경로를 `index.html`로 리다이렉트해 해결했습니다.
