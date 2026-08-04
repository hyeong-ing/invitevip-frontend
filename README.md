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
+ [Figma (다이어그램)](https://www.figma.com/board/ymjJijKbxc8MZPF4UT8Ysn/Invite-and-Management?node-id=0-1&t=RE8pZSuCVea9F2X6-1)


<br/>
<br/>


### 🔶 프로젝트 설명

<br/>

<p align="center">

  <img width="1000" height="500" alt="스크린샷 2026-07-03 오후 8 56 27" src="https://github.com/user-attachments/assets/1c970f5a-b9bf-4415-97db-2189df8f5795" />

</p>

<br/>

+ 사용자는 초대코드를 입력해 고객 등급별 안내 페이지로 이동합니다.
+ 관리자는 Keycloak 로그인을 통해 인증을 진행하고 JWT를 포함해 백엔드 API를 호출합니다.
+ 백엔드는 Spring Security로 JWT와 권한을 검증한 뒤 고객 관리, 초대코드 검증, 관리자 권한 관리 로직을 처리합니다.
+ 고객 / 관리자 / 권한 데이터는 MySQL에 저장하고 고객 검색 데이터는 Elasticsearch에 저장해 검색 기능에 활용합니다.
+ Keycloak Admin Client를 사용해 서비스 관리자 정보와 Keycloak 로그인 계정을 함께 관리합니다.


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
+ 관리자 페이지에 필요한 목록 조회, 입력 화면 등 기본적인 관리형 UI 구현하기.

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

### [ 컴포넌트 역할 분리 ] <br/>

1) 현재 처리 방식 <br/>
+ 고객 관리와 관리자 관리 설정 화면에서 목록 조회, 검색, 등록, 수정, 삭제, 모달 제어를 한 화면 안에서 처리하고 있습니다.
+ 현재 프로젝트 규모에서는 전체 흐름을 한 파일에서 확인할 수 있어 구현과 디버깅이 비교적 단순합니다.

<br/><br/>

2) 아쉬운 점 <br/>
+ 기능이 늘어나면 하나의 컴포넌트가 담당하는 역할이 많아져 코드 흐름을 파악하기 어려워질 수 있습니다.
+ 특히 테이블 표시, 검색 상태 관리, 모달 제어, 삭제 처리 로직이 한 파일에 모이면 유지보수가 어려워집니다.

<br/><br/>

3) 개선 방향 <br/>
+ 실제 서비스 규모로 확장한다면 화면 표시 컴포넌트와 상태 관리 로직을 분리할 수 있습니다.
+ 예를 들어 검색 영역은 CustomerToolbar, 테이블 영역은 CustomerTable, 고객 목록 상태 관리는 useCustomerTable 같은 custom hook으로 나눌 수 있습니다.
+ 이렇게 분리하면 각 컴포넌트의 역할이 명확해지고, 기능 추가 시 수정 범위를 줄일 수 있습니다.

<br/><br/>

----

### [ 권한 처리 기준 정리 ] <br/>

1) 현재 처리 방식 <br/>
+ 로그인 후 `/api/auth/me`를 통해 현재 사용자의 역할과 권한을 조회합니다.
+ 조회된 권한을 기준으로 고객 검색, 추가, 수정, 삭제 버튼의 사용 가능 여부를 제어했습니다.
+ 최종 API 접근 제어는 백엔드에서 처리하고 프론트엔드는 권한에 맞는 화면을 보여주는 역할을 했습니다.

<br/><br/>

2) 아쉬운 점 <br/>
+ 현재 구조는 프로젝트 규모에서는 충분하지만, 기능이 늘어나면 어떤 버튼에 어떤 권한이 필요한지 여러 컴포넌트에 흩어질 수 있습니다.
+ 권한 코드와 화면 표시 기준이 분산되면 새로운 권한을 추가할 때 수정해야 할 위치가 많아질 수 있습니다.

<br/><br/>

3) 개선 방향 <br/>
+ 실제 서비스라면 프론트엔드에서도 권한 코드를 하나의 상수 파일로 관리하는 방식을 고려할 수 있습니다.
+ 예를 들어 `CUSTOMER_SEARCH`, `CUSTOMER_ADD`, `CUSTOMER_EDIT`, `CUSTOMER_DELETE` 같은 값을 한 곳에서 관리하면 버튼 표시, 메뉴 노출, 권한 안내 문구를 같은 기준으로 맞출 수 있습니다.
+ 이를 통해 권한 정책이 변경되어도 수정 범위를 줄이고 화면별 권한 처리 기준을 더 명확하게 유지할 수 있습니다.

<br/><br/>



