const CUSTOMER_PERMISSIONS = [
    { key: "customerRead", label: "조회" },
    { key: "customerAdd", label: "추가" },
    { key: "customerSearch", label: "검색" },
    { key: "customerEdit", label: "수정" },
    { key: "customerDelete", label: "삭제" },
];

export function getAdminRoleLabel(auth) {
    return auth.superAdmin ? "최고" : "일반";
}

export function getCustomerPermissionText(auth) {
    const permissions = auth.superAdmin
        ? CUSTOMER_PERMISSIONS
        : CUSTOMER_PERMISSIONS.filter((permission) => auth[permission.key]);

    if (permissions.length === 0) {
        return "권한 없음";
    }

    return permissions.map((permission) => permission.label).join(" | ");
}
