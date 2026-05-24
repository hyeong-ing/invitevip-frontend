import React from "react";
import { useForm } from "react-hook-form";
import { CornerDownLeft, X } from "lucide-react";
import "../PermissionSetting.css";

export default function AdminSearch({ onClose, onSearch }) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            keyword: "",
        },
    });

    const onSubmit = ({ keyword }) => {
        if (onSearch) {
            onSearch(keyword.trim());
        }
    };

    const onInvalid = () => {
        alert("이름 또는 아이디를 입력하세요.");
    };

    return (
        <div className="search-overlay">
            <div className="search-box">
                <div className="search-header">
                    <span className="search-title">검색</span>
                    <button
                        type="button"
                        className="search-close"
                        onClick={onClose}
                        aria-label="검색 닫기"
                    >
                        <X size={18} strokeWidth={2.4} />
                    </button>
                </div>

                <div className="search-field">
                    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                        <div className="search-input-row">
                            <input
                                type="text"
                                placeholder="이름 또는 아이디를 입력하세요"
                                {...register("keyword", {
                                    required: true,
                                    setValueAs: (value) => value.trim(),
                                })}
                            />
                            <button type="submit" className="search-icon-btn" aria-label="검색 실행">
                                <CornerDownLeft size={20} strokeWidth={2.4} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
