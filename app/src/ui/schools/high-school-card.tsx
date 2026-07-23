"use client";

import React, { ReactElement } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

type HighSchoolCardProps = {
    name: string;
    onClickAction?: () => Promise<void>;
};

export default function HighSchoolCard({ name, onClickAction }: HighSchoolCardProps): ReactElement {
    return (
        <button
            type="button"
            onClick={onClickAction}
            className="flex h-14 w-full items-center justify-between rounded-xs border border-sky-300 bg-sky-100 px-4 py-3 transition-colors
                hover:bg-sky-200 active:bg-sky-300
            "
        >
            <span className="text-left font-medium text-sky-950">{name}</span>

            <ChevronRightIcon className="size-5 text-sky-700" />
        </button>
    );
}
