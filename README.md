# 🔒 Invite and Management 🔑

<br/>

<p align="center">

  <br/>
  이전 프로젝트에서 회원가입과 로그인을 구현했지만, 로그아웃이나 인증 상태 유지, 권한 처리까지 깊게 다루지 못했습니다. <br/>
  그리고 DB도 H2 위주로만 사용해서 실제 DB를 설계하고 관리하는 경험이 부족하다고 느꼈습니다.<br/>
  그래서 이번 프로젝트에서는 Keycloak을 활용한 인증, Spring Security 기반의 권한 처리,<br/>
  MySQL을 사용한 고객/관리자 데이터 관리까지 경험하기로 했습니다. <br/>
  <br/>

  <br/>

  <img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/25ed9b61-e432-438e-a6c4-a49c78ee17c9" />

</p>

<br/>
<br/>
<br/>

### 🔶 프로젝트 관련 링크

+ [Blog (프로젝트 기록)](https://post-this.tistory.com/category/%F0%9F%92%BB%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/%F0%9F%90%A0%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85%20%ED%8E%98%EC%9D%B4%EC%A7%80%F0%9F%90%A0)
+ YouTube (동작화면)
+ [Figma (다이어그램)](https://www.figma.com/board/pcWxgbFCWQUnnIW3W1hrZi/%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8?node-id=0-1&t=NPUJ2hrnFEb7meeQ-1)


<br/>
<br/>


### 🔶 프로젝트 설명

<br/>

<p align="center">

  <img width="800" height="500" alt="스크린샷 2026-07-03 오후 8 56 27" src="https://github.com/user-attachments/assets/89561780-116a-4091-9e56-ec9c44c8152f" />

</p>

<br/>

+ 사용자가 입력한 정보로 일반 회원가입을 진행합니다. 
+ 아이디와 이메일 중복 확인을 통해 이미 등록된 회원인지 검증합니다.
+ H2 데이터베이스로 회원 정보를 저장합니다.
+ BCryptPasswordEncoder를 사용해 비밀번호를 암호화하여 저장합니다.
+ 카카오와 네이버 OAuth API를 연동해 소셜 로그인 흐름을 구현했습니다.

<br/><br/> 

### 🔶 기술 스택 & 라이브러리
+ 프론트엔드 : JavaScript, React 19, Vite
+ 라우팅 : React Router
+ 서버 상태 관리 : TanStack Query
+ 테이블 관리 : TanStack Table
+ 인증 연동 : keycloak-js
+ 알림 UI : Sonner
  
<br/><br/>

### 🔶 프로젝트 목표
+ 첫 React 프로젝트로 컴포넌트 기반 화면구성과 상태 관리 흐름 이해하기.
+ 백엔드 API와 연동되는 프론트엔드 구조를 설계하고 서버 데이터를 화면에 반영하는 흐름 경험하기.
+ Keycloak 인증 흐름을 프론트엔드와 연결하고 로그인 상태에 따라 화면 접근을 제어하기.
+ 관리자 페이지에 필요한 목록 조회, 입력 화면 등 기본적이 관리형 UI 구현하기.

<br/><br/>

### 🔶 핵심 로직
1) 초대코드 입력 후 등급별 페이지 이동 <br/>
사용자가 초대코드를 입력하면 백엔드에 코드를 전송하고 응답으로 받은 고객 등급에 따라 안내 페이지를 이동합니다.

+ 초대코드를 입력하면 /api/invite/enter API를 호출합니다.
+ 백엔드에서 고객 정보를 찾으면 등급을 확인합니다.
+ `VIP`, `VVIP`, `DIAMOND` 등급에 따라 각 페이지로 이동합니다.

```javascript
const response = await fetch(`${API_BASE_URL}/api/invite/enter`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
});

const data = await response.json();
const grade = (data.grade || "").trim().toUpperCase();
```
```javascript
if (grade === "VIP") navigate("/vip");
else if (grade === "VVIP") navigate("/vvip");
else if (grade === "DIAMOND") navigate("/diamond");
```

<br/><br/>

----

2) TanStack Query 기반 고객 목록 조회 및 화면 갱신<br/>
고객 관리 화면에서는 TanStack Query를 사용해 서버의 고객 목록을 조회하고 등록, 수정, 삭제 후 화면 데이터가 갱신됩니다.

+ 고객 목록 조회는 `useQuery`로 관리했습니다. 
+ 고객 추가, 수정, 삭제 후에는 고객 목록 쿼리를 다시 불러와 최신 데이터를 화면에 반영했습니다.
+ API 요청 상태와 화면 데이터를 분리해 관리했습니다.

```javascript
const {
    data: customers = [],
    isLoading,
    isError,
} = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
});
```
```javascript
const addMutation = useMutation({
    mutationFn: addCustomer,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        notify.success("고객이 등록되었습니다.");
        onClose();
    },
});
```
```javascript
const editMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        notify.success("고객 정보가 수정되었습니다.");
        onClose();
    },
});
```
```javascript
const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        notify.success("고객이 삭제되었습니다.");
    },
});
```

<br/><br/>

----

3) Keycloak 초기화 및 전역 인증 상태 구성 <br/>
프론트엔드 앱이 시작될 때 Keycloak을 먼저 초기화하고, 이후 React 앱을 렌더링하도록 구성했습니다.

+ `keycloak-js`를 통해 로그인 상태를 확인합니다.
+ `AuthProvider`에서 현재 로그인 사용자의 권한 정보를 불러옵니다.
+ 전체 앱에서 인증 상태를 사용할 수 있도록 Context로 관리했습니다.

```javascript
keycloak.init({ onLoad: "check-sso" })
    .then(() => {
        root.render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </QueryClientProvider>
        );
    });
```
```javascript
useEffect(() => {
    async function loadMe() {
        const data = await authFetch("/api/auth/me");

        setAuthState({
            authenticated: true,
            username: data.username,
            roles: data.roles,
            permissions: data.permissions,
        });
    }

    if (keycloak.authenticated) {
        loadMe();
    }
}, []);
```


<br/><br/>

----

4) JWT를 포함한 인증 API 요청 처리 <br/>
백엔드의 인증이 필요한 API를 호출할 때는 Keycloak에서 발급받은 JWT를 요청 헤더에 포함했습니다.

+ API 요청 전 `updateToken()`으로 토큰 갱신을 시도합니다.
+ 요청 헤더에 `Authorization: Bearer Token`을 추가합니다.
+ 토큰 갱신에 실패하면 인증 상태를 초기화할 수 있도록 처리했습니다.

```javascript
await keycloak.updateToken(30);

const headers = {
    ...options.headers,
    Authorization: `Bearer ${keycloak.token}`,
};

return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
});
```
```javascript
catch (error) {
    keycloak.clearToken();
    window.dispatchEvent(new Event("auth-token-refresh-failed"));
    throw error;
}
```

<br/><br/>

----

5) 로그인 여부와 권한에 따른 페이지 접근 제어 <br/>
관리자 페이지와 권한 설정 페이지는 로그인 상태와 역할에 따라 접근할 수 있도록 분리했습니다.

+ 로그인하지 않은 사용자는 보호된 페이지에 접근할 수 없습니다.
+ 특정 페이지는 `SUPER_ADMIN` 역할을 가진 사용자만 접근할 수 있습니다.
+ 권한이 없는 사용자가 직접 URL로 접근하는 상황을 막았습니다.

```javascript
if (!authState.authenticated) {
    return <Navigate to="/login" replace />;
}

if (requiredRole && !authState.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />;
}

return children;
```
```javascript
<Route
    path="/admin/customers"
    element={
        <ProtectedRoute>
            <CustomerPage />
        </ProtectedRoute>
    }
/>

<Route
    path="/permission"
    element={
        <ProtectedRoute requiredRole="SUPER_ADMIN">
            <PermissionPage />
        </ProtectedRoute>
    }
/>
```


<br/><br/><br/>


### 🔶 문제 해결

### [ 검색 상태에서 고객 수정 후 화면 미반영 문제 ] <br/>

1) 문제 발생 <br/>
+ 고객 검색 결과 화면에서 고객 정보를 수정했습니다.
+ 수정 요청은 성공했지만 화면에는 이전 데이터가 여전히 남아있었습니다.

<br/><br/>

2) 원인 파악 <br/>
+ 기본 고객 목록은 TanStack Query로 관리하고 있었습니다.
+ 그러나 검색 결과는 별도 상태인 `searchRows`로 관리하고 있었습니다.
+ 수정 성공 후 기본 목록만 갱신하고 현재 화면에 표시 중인 `searchRows`는 갱신하지 않아 발생한 문제였습니다.

<br/><br/>

3) 문제 해결 <br/>
+ 수정된 고객 데이터를 부모 컴포넌트로 전달했습니다.
+ 이후 searchRows와 TanStackQuery 캐시를 함께 갱신해 검색 화면에서도 수정 결과가 바로 반영되도록 했습니다.
  
```javascript
setSearchRows((oldData) => {
    if (!Array.isArray(oldData)) return oldData;

    return oldData.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
    );
});
queryClient.setQueriesData({ queryKey: ["customers"] }, (oldData) => {
    if (!Array.isArray(oldData)) return oldData;

    return oldData.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
    );
});
```

<br/><br/>

### [ 인증 API 요청과 토큰 갱신 실패 공통 처리 ] <br/>

1) 문제 발생 <br/>
+ Keycloak 로그인 후에도 백엔드 보호 API 요청에 JWT가 포함되지 않으면 인증 요청으로 처리되지 않는 문제가 발생했습니다.
+ 또한 토큰 갱신 실패 시 로그인 상태가 화면에 남아 있을 수 있었습니다.

<br/><br/>

2) 원인 파악 <br/>
+ Keycloak 로그인 상태와 백엔드 API 요청은 별개의 과정이었습니다.
+ 백엔드에서 사용자를 인증하려면 요청 헤더에 `Authorization: Bearer Token`을 포함해야 했습니다.

<br/><br/>

3) 문제 해결 <br/>
+ 공통 요청 함수인 `authFetch`를 만들고 API 요청 전에 토큰 갱신과 JWT 헤더 추가를 처리했습니다.
+ 토큰 갱신에 실패하면 토큰을 비우고 공통 이벤트를 발생시켜 인증 상태를 초기화하도록 했습니다.
  
```javascript
try {
    if (keycloak.authenticated) {
        await keycloak.updateToken(30);
    }
} catch (error) {
    keycloak.clearToken();
    window.dispatchEvent(new Event(AUTH_TOKEN_REFRESH_FAILED_EVENT));
    throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
}
const headers = new Headers(options.headers || {});

if (keycloak.token) {
    headers.set("Authorization", `Bearer ${keycloak.token}`);
}

return fetch(url, {
    ...options,
    headers,
});
```

<br/><br/><br/>

### 🔶 아쉬운 점 및 개선 방향

### [ 외부 검색 인덱스 반영 방식 ] <br/>

1) 현재 처리 방식 <br/>
+ 고객 원본 데이터는 MySQL에 저장하고, 검색에 사용할 데이터는 Elasticsearch 인덱스에도 함께 저장했습니다.
+ 고객 등록, 수정, 삭제 시점에 Elasticsearch를 바로 호출해 검색 결과가 최신 상태에 가깝게 유지되도록 처리했습니다.
+ 또한 검색 인덱스가 MySQL 데이터와 어긋났을 때를 대비해, MySQL 기준 고객 데이터를 Elasticsearch에 다시 저장하는 수동 동기화 API를 두었습니다.


<br/><br/>

2) 아쉬운 점 <br/>
+ MySQL과 Elasticsearch는 서로 다른 저장소이기 때문에 하나의 트랜잭션으로 완전히 묶이지는 않습니다.
+ 따라서 실제 운영 환경에서는 MySQL 반영은 성공했지만 Elasticsearch 반영이 실패하는 상황을 더 세밀하게 추적하고 복구할 필요가 있습니다.

<br/><br/>

3) 개선 방향 <br/>
+ 실제 서비스라면 고객 데이터 변경 시 Elasticsearch를 바로 호출하기보다 변경 이벤트를 별도로 저장하는 방식을 고려할 수 있습니다.
+ 예를 들어 Outbox Pattern이나 메시지 큐를 사용하면 DB 변경 이력을 안전하게 남기고 Elasticsearch 반영 실패 시 재시도하거나 실패 상태를 추적할 수 있습니다.
+ 현재 프로젝트에서는 개인 프로젝트 규모를 고려해 CRUD 시점에 즉시 반영하고, 필요 시 수동 동기화 API로 복구할 수 있는 단순한 구조를 선택했습니다.

<br/><br/>

----

### [ Keycloak 계정 연동 안정성 ] <br/>

1) 현재 처리 방식 <br/>
+ 관리자 정보는 MySQL에 저장하고 실제 로그인 계정은 Keycloak에 생성했습니다.
+ 관리자 생성 시 `saveAndFlush()`로 DB insert와 제약 조건 검사를 먼저 실행한 뒤 Keycloak 사용자 생성을 진행했습니다.
+ 생성된 Keycloak 사용자 id를 `admin.keycloakId`에 저장해 MySQL 관리자 데이터와 Keycloak 계정을 연결했습니다.

<br/><br/>

2) 아쉬운 점 <br/>
+ MySQL과 Keycloak 역시 서로 다른 시스템이기 때문에 완전히 하나의 트랜잭션으로 처리되지는 않습니다.
+ 예를 들어 Keycloak 사용자 생성은 성공했지만 이후 DB 커밋이 실패하거나, 수정 과정에서 일부 정보만 반영되는 상황이 생길 수 있습니다.

<br/><br/>

3) 개선 방향 <br/>
+ 실제 서비스라면 관리자 생성, 수정, 삭제 요청을 상태값으로 관리하는 방식을 고려할 수 있습니다.
+ 예를 들어 관리자 생성 요청을 먼저 DB에 저장하고, Keycloak 연동 작업은 별도 작업 큐에서 처리한 뒤 성공 시 ACTIVE, 실패 시 FAILED 상태로 관리할 수 있습니다.
+ 이렇게 하면 Keycloak 장애나 중간 실패 상황을 추적하고 재시도하기 쉬워집니다.
+ 현재 프로젝트에서는 구조가 지나치게 무거워지지 않도록 flush()와 keycloakId를 활용해 두 시스템의 연결 순서를 명확히 하는 방식으로 처리했습니다.

<br/><br/>

----

### [ 운영 환경을 고려한 설정 및 테스트 보강 ] <br/>

1) 현재 처리방식 <br/>
+ 개발 과정에서는 로컬 환경에서 MySQL, Elasticsearch, Keycloak을 실행하며 기능 구현과 흐름 확인에 집중했습니다.
+ 인증, 권한, 고객 검색, 관리자 관리 기능이 연결되는 전체 흐름을 우선적으로 구현했습니다.

<br/><br/>

2) 아쉬운 점 <br/>
+ 현재 프로젝트는 로컬 실행과 시연을 기준으로 작성되어 있어, 실제 운영 환경을 기준으로 보면 설정값 관리와 외부 시스템 연동 테스트를 더 보강할 여지가 있습니다.
+ 특히 DB, Elasticsearch, Keycloak처럼 외부 시스템에 의존하는 기능은 환경에 따라 동작 차이가 생길 수 있습니다.

<br/><br/>

3) 개선 방향 <br/>
+ 실제 서비스라면 DB 비밀번호, Keycloak 관리자 계정, Elasticsearch 접속 정보 같은 설정값을 환경 변수나 별도 Secret 관리 방식으로 분리하는 것이 좋습니다.
+ 또한 Testcontainers 등을 활용해 MySQL과 Elasticsearch 연동 흐름을 실제 환경과 가깝게 검증할 수 있습니다.
+ Keycloak의 경우 테스트 컨테이너나 테스트 Realm 구성을 추가해 인증 서버 연동 흐름까지 단계적으로 검증하는 방향으로 확장할 수 있습니다.
+ 현재 프로젝트에서는 개인 학습과 기능 구현을 우선했기 때문에, 추후에는 설정 분리와 외부 시스템 통합 테스트를 보강하는 방향으로 개선할 수 있습니다.

<br/><br/>


