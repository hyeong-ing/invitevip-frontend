import React, { useState } from "react";
import "./PermissionSetting.css";
import AdminAdd from "./adminfunction/AdminAdd";
import AdminEdit from "./adminfunction/AdminEdit";
import AdminSearch from "./adminfunction/AdminSearch.jsx";
import { authFetch } from "../../auth/authFetch.js";
import { useAuth } from "../../auth/useAuth.js";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

const PERMISSION_LABELS = {
    CUSTOMER_READ: "조회",
    CUSTOMER_SEARCH: "검색",
    CUSTOMER_ADD: "추가",
    CUSTOMER_EDIT: "수정",
    CUSTOMER_DELETE: "삭제",
};

const PERMISSION_ORDER = {
    CUSTOMER_READ: 1,
    CUSTOMER_SEARCH: 2,
    CUSTOMER_ADD: 3,
    CUSTOMER_EDIT: 4,
    CUSTOMER_DELETE: 5,
};

const fetchAdmins = async (keyword) => {
    const url = keyword
        ? `/api/admins/search?keyword=${encodeURIComponent(keyword)}`
        : "/api/admins";
    const response = await authFetch(url);

    if (!response.ok) {
        throw new Error(keyword ? "관리자 검색에 실패했습니다." : "관리자 목록을 불러오지 못했습니다.");
    }

    return response.json();
};

const deleteAdmin = async (id) => {
    const response = await authFetch(`/api/admins/${id}`, { method: "DELETE" });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "삭제 실패");
    }

    return id;
};

export default function PermissionSetting() {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const {
        data: rows = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["admins", searchKeyword],
        queryFn: () => fetchAdmins(searchKeyword),
        enabled: !auth.loading && auth.superAdmin,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdmin,
        onSuccess: (deletedId) => {
            queryClient.setQueriesData({ queryKey: ["admins"] }, (oldData) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.filter((admin) => admin.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (mutationError) => {
            alert(mutationError.message || "관리자 삭제 중 오류가 발생했습니다.");
        },
    });
    const formatPerms = (permissions) => {
        if (!Array.isArray(permissions)) {
            return "";
        }

        return [...permissions]
            .sort((a, b) => {
                const orderA = PERMISSION_ORDER[a] || 99;
                const orderB = PERMISSION_ORDER[b] || 99;
                return orderA - orderB;
            })
            .map((code) => PERMISSION_LABELS[code] || code)
            .join(" | ");
    };

    const formatRole = (role) => {
        return role === "SUPER_ADMIN" ? "최고관리자" : "일반관리자";
    };

    const handleRefresh = () => {
        setSearchKeyword("");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        queryClient.invalidateQueries({ queryKey: ["admins"] });
    };

    const handleAdd = () => {
        setSearchKeyword("");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        queryClient.invalidateQueries({ queryKey: ["admins"] });
    };

    const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        setIsEditOpen(false);
        setSelectedAdmin(null);
    };

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        setIsSearchOpen(false);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handleDelete = async (admin) => {
        const result = await Swal.fire({
            title: `${admin.username}님의 정보를 삭제하시겠습니까?`,
            icon: "warning",
            width: "calc(32em + 16px)",
            showCancelButton: true,
            cancelButtonText: "아니오",
            confirmButtonText: "삭제",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            customClass: {
                actions: "delete-alert-actions",
            },
        });

        if (!result.isConfirmed) {
            return;
        }

        deleteMutation.mutate(admin.id);
    };

    const tableColumns = [
        { header: "이름", accessorKey: "name", size: 120 },
        { header: "아이디", accessorKey: "username", size: 120 },
        {
            header: "관리자 종류",
            accessorKey: "role",
            size: 180,
            cell: ({ getValue }) => formatRole(getValue()),
        },
        {
            header: "권한",
            accessorKey: "permissions",
            size: 220,
            cell: ({ getValue }) => formatPerms(getValue()),
        },
        {
            header: "관리",
            id: "actions",
            size: 160,
            cell: ({ row }) => (
                <div className="edit-delete">
                    <button className="btn-edit" onClick={() => {
                        setSelectedAdmin(row.original);
                        setIsEditOpen(true);
                    }}>
                        수정
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(row.original)} disabled={deleteMutation.isPending}>
                        삭제
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: rows,
        columns: tableColumns,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    const totalPages = Math.max(1, table.getPageCount());
    const currentPage = table.getState().pagination.pageIndex + 1;

    if (auth.loading) {
        return <div className="permission-page">권한 확인 중입니다.</div>;
    }

    return (
        <div className="permission">
            <div className="permission-page">
                <h2 className="permission-title">관리자 권한 설정</h2>

                <div className="permission-card">
                    <div className="permission-toolbar">
                        <div className="toolbar-left">
                            <div className="admin-count">등록된 관리자 수: {rows.length}명</div>
                            <button className="btn-refresh" onClick={handleRefresh} disabled={isFetching} aria-label="관리자 목록 새로고침">
                                <RefreshCw size={16} strokeWidth={2.4} />
                            </button>
                        </div>

                        <div className="btn-group">
                            <button className="add" onClick={() => setIsAddOpen(true)}>
                                추가
                            </button>
                            <button className="search" onClick={() => setIsSearchOpen(true)}>
                                검색
                            </button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="sheet">
                            <colgroup>
                                {table.getAllLeafColumns().map((column) => (
                                    <col key={column.id} style={{ width: column.getSize() }} />
                                ))}
                            </colgroup>

                            <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>

                            <tbody>
                            {isLoading ? (
                                <tr className="empty-row">
                                    <td colSpan={tableColumns.length}>관리자 목록을 불러오는 중입니다.</td>
                                </tr>
                            ) : isError ? (
                                <tr className="empty-row">
                                    <td colSpan={tableColumns.length}>
                                        {error?.message || "관리자 목록을 불러오지 못했습니다."}
                                        <button type="button" className="btn-refresh" onClick={() => refetch()}>
                                            다시 시도
                                        </button>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr className="empty-row">
                                    <td colSpan={tableColumns.length}>표시할 데이터가 없습니다.</td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="permission-footnote">
                        <div className="pagination">
                            <button
                                type="button"
                                disabled={!table.getCanPreviousPage()}
                                onClick={() => table.previousPage()}
                                aria-label="이전 페이지"
                            >
                                <ChevronLeft size={17} strokeWidth={2.5} />
                            </button>

                            <div className="page-indicator">
                                {currentPage} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={!table.getCanNextPage()}
                                onClick={() => table.nextPage()}
                                aria-label="다음 페이지"
                            >
                                <ChevronRight size={17} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {isAddOpen && (
                    <AdminAdd
                        onAdd={handleAdd}
                        onClose={() => setIsAddOpen(false)}
                    />
                )}

                {isSearchOpen && (
                    <AdminSearch
                        onClose={() => setIsSearchOpen(false)}
                        onSearch={handleSearch}
                    />
                )}

                {isEditOpen && selectedAdmin && (
                    <AdminEdit
                        admin={selectedAdmin}
                        onUpdate={handleUpdate}
                        onClose={() => {
                            setIsEditOpen(false);
                            setSelectedAdmin(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
