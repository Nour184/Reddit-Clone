"use client";

import { usePathname } from "next/navigation";
import Sidebar from "components/shared/Sidebar/index";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth/");

    return (
        <>
            {!isAuthPage && <Sidebar />}
            <main className="pt-16">
                {children}
            </main>
        </>
    );
}