import React from "react";
import PageHeader from "../../common/PageHeader.jsx";
import PermissionSetting from "./PermissionSetting.jsx";

export default function PermissionPage() {
    return (
        <div className="permission-page-shell">
            <PageHeader />
            <PermissionSetting />
        </div>
    );
}