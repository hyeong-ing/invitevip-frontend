import { useState } from "react";
import "../CustomerTable.css";


export default function CustomerSearch({ onClose, onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmed = keyword.trim();

        if (!trimmed) {
            alert("검색어를 입력하세요.");
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
                                placeholder="검색어를 입력하세요"
                            />
                            <button
                                type="submit"
                                className="search-icon-btn"
                            >
                                ⏎
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
