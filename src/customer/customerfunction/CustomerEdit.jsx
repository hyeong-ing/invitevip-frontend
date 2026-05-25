import React from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import { authFetch } from "../../auth/authFetch.js";
import { notify } from "../../common/notify.js";

export default function CustomerEdit({ customer, onUpdate, onClose }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            id: customer.id,
            name: customer.name ?? "",
            grade: customer.grade ?? "",
            phone: customer.phone ?? "",
            code: customer.code ?? "",
            note: customer.note ?? "",
        },
    });
    const selectedGrade = watch("grade");

    const handleGradeChange = (grade) => {
        setValue("grade", selectedGrade === grade ? "" : grade, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const onSubmit = async (formData) => {
        try {
            const response = await authFetch(`/api/customers/${formData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.status === 409) {
                notify.warning("초대코드가 이미 사용 중입니다. 다른 코드를 입력해주세요!");
                return;
            }

            if (!response.ok) {
                const message = await response.text();
                notify.error(message || "수정에 실패했습니다.");
                return;
            }

            const updatedCustomer = await response.json();
            onUpdate(updatedCustomer);
            onClose();
        } catch (error) {
            console.error(error);
            notify.error("서버 오류가 발생했습니다.");
        }
    };

    const onInvalid = () => {
        notify.warning("이름, 등급, 연락처, 코드 입력은 필수이며 코드는 숫자 4자리만 가능합니다.");
    };

    return (
        <div className="add-back">
            <div className="add-card">
                <h2 className="add-title">회원 정보 수정</h2>
                <form className="add-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                    <input type="hidden" {...register("id")} />
                    <div className="form-row">
                        <label>이름</label>
                        <input {...register("name", { required: true })} />
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
                        <input {...register("phone", { required: true })} />
                    </div>
                    <div className="form-row">
                        <label>초대 코드</label>
                        <input
                            maxLength={4}
                            {...register("code", {
                                required: true,
                                pattern: /^\d{4}$/,
                            })}
                        />
                    </div>
                    <div className="form-row">
                        <label>메모</label>
                        <input {...register("note")} />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="add-submit" disabled={isSubmitting}>
                            <Save size={17} strokeWidth={2.4} />
                            {isSubmitting ? "저장 중..." : "저장하기"}
                        </button>
                        <button type="button" className="add-cancel" onClick={onClose}>
                            <X size={17} strokeWidth={2.4} />
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
