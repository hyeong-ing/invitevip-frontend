import React from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import "../CustomerTable.css";
import {authFetch} from "../../auth/authFetch.js";
import { notify } from "../../common/notify.js";

const defaultValues = {
    name: "",
    grade: "",
    phone: "",
    code: "",
    note: "",
};

export default function CustomerAdd({ onAdd, onClose }) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm({ defaultValues });
    const selectedGrade = watch("grade");

    const handleGradeChange = (grade) => {
        setValue("grade", selectedGrade === grade ? "" : grade, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const onSubmit = async (form) => {
        try {
            const response = await authFetch("/api/customers", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            });

            if (response.status === 409) {
                notify.warning("초대코드가 중복되었습니다. 다른 코드를 입력해주세요.");
                return;
            }

            if (!response.ok) {
                notify.error("저장 실패");
                return;
            }

            const savedCustomer = await response.json();
            if (onAdd) {
                onAdd(savedCustomer);
            }
            reset(defaultValues);
            onClose();
        } catch (error) {
            console.error(error);
            notify.error("오류가 발생했습니다.");
        }
    };

    const onInvalid = () => {
        notify.warning("이름, 등급, 연락처, 코드 입력은 필수이며 코드는 숫자 4자리만 가능합니다.");
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
                            {...register("name", { required: true })}
                        />
                    </div>

                    <div className="form-row">
                        <label>등급</label>
                        <input type="hidden" {...register("grade", { required: true })} />
                        <div className="grade-options">
                            {["VIP", "VVIP", "DIAMOND"].map((grade) => (
                                <label key={grade} className="grade-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedGrade === grade}
                                        onChange={() => handleGradeChange(grade)}
                                    />
                                    {grade}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <label>연락처</label>
                        <input
                            type="text"
                            placeholder="010-0000-0000"
                            {...register("phone", { required: true })}
                        />
                    </div>

                    <div className="form-row">
                        <label>초대 코드</label>
                        <input
                            type="text"
                            maxLength={4}
                            {...register("code", {
                                required: true,
                                pattern: /^\d{4}$/,
                            })}
                        />
                    </div>

                    <div className="form-row">
                        <label>메모</label>
                        <input
                            type="text"
                            placeholder="메모 (선호 시간대, 알레르기 등)"
                            {...register("note")}
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="add-submit" disabled={isSubmitting}>
                            <Save size={17} strokeWidth={2.4} />
                            {isSubmitting ? "저장 중..." : "저장"}
                        </button>
                        <button
                            type="button"
                            className="add-cancel"
                            onClick={onClose}
                        >
                            <X size={17} strokeWidth={2.4} />
                            닫기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
