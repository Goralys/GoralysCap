import { ReactElement } from "react";

export function HighSchoolCardSkeleton({ className }: { className?: string }): ReactElement {
    return (
        <div
            className={`flex items-center justify-between w-full h-14 rounded-xs border border-sky-300 bg-sky-100 px-4 ${className ?? ""}`}
        >
            <div className="skeleton h-4 w-56 rounded-xs" />
        </div>
    );
}
