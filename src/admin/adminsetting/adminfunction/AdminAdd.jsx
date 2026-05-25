import React from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import { authFetch } from "../../../auth/authFetch.js";
import { notify } from "../../../common/notify.js";

const PERMISSIONS = [
    { key: "CUSTOMER_READ", label: "조회" },
    { key: "CUSTOMER_SEARCH", label: "검색" },
    { key: "CUSTOMER_ADD", label: "추가" },
    { key: "CUSTOMER_EDIT", label: "수정" },
    { key: "CUSTOMER_DELETE", label: "삭제" },
];

const defaultValues = {
    name: "",
    username: "",
    password: "",
    role: "ADMIN",
    permissions: [],
};

export default function AdminAdd({ onAdd, onClose }) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm({ defaultValues });

    const role = watch("role");
    const permissions = watch("permissions");

    const togglePermission = (permissionKey) => {
        const nextPermissions = permissions.includes(permissionKey)
            ? permissions.filter((permission) => permission !== permissionKey)
            : [...permissions, permissionKey];

        setValue("permissions", nextPermissions, { shouldValidate: true });
    };

    const onSubmit = async (form) => {
        if (form.role === "ADMIN" && form.permissions.length === 0) {
            notify.warning("일반 관리자는 최소 1개 이상의 권한이 필요합니다.");
            return;
        }

        const payload = {
            ...form,
            permissions: form.role === "SUPER_ADMIN" ? [] : form.permissions,
        };

        try {
            const response = await authFetch("/api/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = await response.text();
                notify.error(message || "관리자 추가에 실패했습니다.");
                return;
            }

            const newAdmin = await response.json();
            if (onAdd) onAdd(newAdmin);
            onClose();
        } catch (error) {
            console.error(error);
            notify.error("오류가 발생했습니다.");
        }
    };

    const onInvalid = () => {
        notify.warning("이름, 아이디, 비밀번호는 필수입니다.");
    };

    return (
        <div className="add-back">
            <div className="add-card">
                <h3 className="add-title">회원 정보 추가</h3>

                <form className="add-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                    <div className="form-row">
                        <label>이름</label>
                        <input
                            type="text"
                            placeholder="이름을 입력하세요"
                            {...register("name", { required: true })}
                        />
                    </div>

                    <div className="form-row">
                        <label>아이디</label>
                        <input
                            type="text"
                            placeholder="아이디를 입력하세요"
                            {...register("username", { required: true })}
                        />
                    </div>

                    <div className="form-row">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            placeholder="Keycloak 로그인 비밀번호 설정"
                            {...register("password", { required: true })}
                        />
                    </div>

                    <div className="form-row">
                        <label>역할</label>
                        <select {...register("role")}>
                            <option value="ADMIN">일반 관리자</option>
                            <option value="SUPER_ADMIN">최고 관리자</option>
                        </select>
                    </div>

                    {role === "ADMIN" && (
                        <div className="form-row" style={{ alignItems: "flex-start" }}>
                            <label style={{ paddingTop: 6 }}>권한</label>

                            <div className="perm-col">
                                <div className="perm-grid">
                                    {PERMISSIONS.map((permission) => (
                                        <label key={permission.key} className="perm-item">
                                            <input
                                                type="checkbox"
                                                checked={permissions.includes(permission.key)}
                                                onChange={() => togglePermission(permission.key)}
                                            />
                                            {permission.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-buttons">
                        <button type="submit" className="add-submit" disabled={isSubmitting}>
                            <Save size={17} strokeWidth={2.4} />
                            {isSubmitting ? "저장 중..." : "저장"}
                        </button>
                        <button type="button" className="add-cancel" onClick={onClose}>
                            <X size={17} strokeWidth={2.4} />
                            닫기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
