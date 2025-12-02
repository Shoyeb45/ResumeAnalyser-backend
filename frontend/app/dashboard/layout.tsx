import Sidebar from "@/components/dashboard/Sidebar";

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    return (
        <div className="h-screen flex">
            {/* Sidebar Navigation */}
            <Sidebar/>

            {/* Main Content Area */}
            <div className=" h-screen w-full bg-white">
                    {children}
            </div>
        </div>
    )
}

export default DashboardLayout;
