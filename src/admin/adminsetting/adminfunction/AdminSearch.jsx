import { useState } from "react";
import "../PermissionSetting.css";

export default function AdminSearch({ onClose, onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmed = keyword.trim();

        if (!trimmed) {
            alert("이름 또는 아이디를 입력하세요.");
            return;
        }

        if (onSearch) {
            onSearch(trimmed);
        }
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
                    >
                        ✕
                    </button>
                </div>

                <div className="search-field">
                    <form onSubmit={handleSubmit}>
                        <div className="search-input-row">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="이름 또는 아이디를 입력하세요"
                            />
                            <button type="submit" className="search-icon-btn">
                                ⏎
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
