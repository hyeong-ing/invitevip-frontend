import CustomerTable from "./CustomerTable";
import PageHeader from "../common/PageHeader.jsx";

export default function CustomersPage() {
    return (
    <div className="customer-page-shell">
        <PageHeader />
        <CustomerTable />
    </div>
    );
}
