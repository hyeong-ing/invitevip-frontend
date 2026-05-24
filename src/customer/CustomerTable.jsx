import React, { useEffect, useMemo, useState } from "react";
import "./CustomerTable.css";
import CustomerAdd from "./customerfunction/CustomerAdd.jsx";
import CustomerSearch from "./customerfunction/CustomerSearch.jsx";
import CustomerEdit from "./customerfunction/CustomerEdit.jsx";
import { authFetch } from "../auth/authFetch.js";
import { useAuth } from "../auth/useAuth.js";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

const fetchCustomers = async (keyword) => {
    const url = keyword
        ? `/api/customers/search?keyword=${encodeURIComponent(keyword)}`
        : "/api/customers";
    const response = await authFetch(url);

    if (!response.ok) {
        throw new Error("고객 목록을 불러오지 못했습니다.");
    }

    return response.json();
};

const deleteCustomer = async (id) => {
    const response = await authFetch(`/api/customers/${id}`, { method: "DELETE" });

    if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
    }

    return id;
};

export default function CustomerTable() {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const canRead = auth.superAdmin || auth.customerRead;
    const canSearch = auth.superAdmin || auth.customerSearch;
    const canAdd = auth.superAdmin || auth.customerAdd;
    const canEdit = auth.superAdmin || auth.customerEdit;
    const canDelete = auth.superAdmin || auth.customerDelete;
    const [selectedGrades, setSelectedGrades] = useState(new Set());
    const normalizeGrade = (g) => String(g ?? "").trim().toUpperCase();
    const {
        data: customers = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["customers", searchKeyword],
        queryFn: () => fetchCustomers(searchKeyword),
        enabled: canRead,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCustomer,
        onSuccess: (deletedId) => {
            queryClient.setQueriesData({ queryKey: ["customers"] }, (oldData) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.filter((customer) => customer.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
        onError: (mutationError) => {
            alert(mutationError.message || "삭제에 실패했습니다.");
        },
    });

    const toggleGrade = (grade) => {
        setSelectedGrades((prev) => {
            const next = new Set(prev);
            if (next.has(grade)) next.delete(grade);
            else next.add(grade);
            return next;
        });
    };
    const filteredRows = useMemo(
        () =>
            selectedGrades.size === 0
                ? customers
                : customers.filter((r) => selectedGrades.has(normalizeGrade(r.grade))),
        [customers, selectedGrades]
    );

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [selectedGrades, searchKeyword]);

    const handleRefresh = () => {
        setSearchKeyword("");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setIsSearchOpen(false);
    };
    const handleOpenAdd = () => {
        if (!canAdd) { alert("고객 추가 권한이 없습니다."); return; }
        setIsAddOpen(true);
    };

    const handleOpenSearch = () => {
        if (!canSearch) { alert("고객 검색 권한이 없습니다."); return; }
        setIsSearchOpen(true);
    };

    const handleOpenEdit = (customer) => {
        if (!canEdit) { alert("고객 수정 권한이 없습니다."); return; }
        setEditingCustomer(customer);
    };

    const handleDeleteClick = async (customer) => {
        if (!canDelete) { alert("고객 삭제 권한이 없습니다."); return; }

        const result = await Swal.fire({
            title: `${customer.name}님의 정보를 삭제하시겠습니까?`,
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

        if (!result.isConfirmed) return;

        deleteMutation.mutate(customer.id);
    };

    const handleAdd = () => {
        setSearchKeyword("");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
    };

    const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
    };

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        setIsSearchOpen(false);
    };

    const tableColumns = [
        { header: "이름", accessorKey: "name", size: 140 },
        {
            header: "등급",
            accessorKey: "grade",
            size: 100,
            cell: ({ getValue }) => normalizeGrade(getValue()),
        },
        { header: "연락처", accessorKey: "phone", size: 160 },
        { header: "초대코드", accessorKey: "code", size: 100 },
        { header: "메모", accessorKey: "note", size: 250 },
        {
            header: "관리",
            id: "actions",
            size: 140,
                cell: ({ row }) => (
                    <div className="edit-delete">
                    <button className="btn-edit" onClick={() => handleOpenEdit(row.original)}>
                        수정
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(row.original)} disabled={deleteMutation.isPending}>
                        삭제
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: filteredRows,
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

    return (
        <div className="customer-page">
            <h2 className="page-title">VIP 등급 이상 고객 관리 명단</h2>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <div className="customer-count">등록된 고객수: {filteredRows.length}명 / 전체 {customers.length}명</div>
                        <button className="btn-refresh" onClick={handleRefresh} disabled={isFetching} aria-label="고객 목록 새로고침">
                            <RefreshCw size={16} strokeWidth={2.4} />
                        </button>
                    </div>

                    <div className="grade-filters">
                        <label className="grade-check">
                            <input
                                type="checkbox"
                                checked={selectedGrades.has("VIP")}
                                onChange={() => toggleGrade("VIP")}
                            />
                            VIP
                        </label>
                        <label className="grade-check">
                            <input
                                type="checkbox"
                                checked={selectedGrades.has("VVIP")}
                                onChange={() => toggleGrade("VVIP")}
                            />
                            VVIP
                        </label>
                        <label className="grade-check">
                            <input
                                type="checkbox"
                                checked={selectedGrades.has("DIAMOND")}
                                onChange={() => toggleGrade("DIAMOND")}
                            />
                            DIAMOND
                        </label>
                    </div>

                    <div className="btn-group">
                        <button className="add" onClick={handleOpenAdd}>
                            추가
                        </button>
                        <button className="search" onClick={handleOpenSearch}>
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
                                    <td colSpan={tableColumns.length}>고객 목록을 불러오는 중입니다.</td>
                                </tr>
                            ) : isError ? (
                                <tr className="empty-row">
                                <td colSpan={tableColumns.length}>
                                    {error?.message || "고객 목록을 불러오지 못했습니다."}
                                    <button type="button" className="btn-refresh" onClick={() => refetch()}>
                                        다시 시도
                                    </button>
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr className="empty-row">
                                <td colSpan={tableColumns.length}>표시할 데이터가 없습니다.</td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} data-grade={normalizeGrade(row.original.grade)}>
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
                <div className="table-footnote">
                    <div className="pagination">
                        <button
                            type="button"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                            aria-label="이전 페이지"
                        >
                            <ChevronLeft size={17} strokeWidth={2.5} />
                        </button>
                        <div className="page-indicator">{currentPage} / {totalPages}</div>
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

            {isAddOpen && <CustomerAdd onAdd={handleAdd} onClose={() => setIsAddOpen(false)} />}
            {isSearchOpen && <CustomerSearch onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} />}
            {editingCustomer && <CustomerEdit customer={editingCustomer} onUpdate={handleUpdate} onClose={() => setEditingCustomer(null)} />}
        </div>
    );
}
