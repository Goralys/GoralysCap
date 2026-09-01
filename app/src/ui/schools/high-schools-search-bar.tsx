import React, { ReactElement, SubmitEvent, useEffect, useState } from "react";
import { FloatingInput } from "@/app/src/ui/inputs/floating-input";
import { HighSchool } from "@/app/src/lib/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface HighSchoolsSearchBarProps {
    highSchools: HighSchool[] | null;
    setCurrentHighSchools: React.Dispatch<React.SetStateAction<HighSchool[] | null>>;
}

export default function HighSchoolsSearchBar({ highSchools, setCurrentHighSchools }: HighSchoolsSearchBarProps): ReactElement {
    const [searchText, setSearchText] = useState("");

    const handleSearch = (e: SubmitEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.value;
        setSearchText(value);
    };

    const sortSchools = (list: HighSchool[]): HighSchool[] => {
        return [...list].sort((a, b) => {
            return a.name.localeCompare(b.name, "fr");
        });
    };

    useEffect(() => {
        if (!highSchools) return;

        const search = searchText.trim().toLowerCase();
        const sorted = sortSchools(
            highSchools.filter((h: HighSchool) => {
                if (!search) return true;

                return h.name.trim().toLowerCase().includes(search);
            }),
        );

        setCurrentHighSchools((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(sorted)) return prev;
            return sorted;
        });
    }, [searchText, highSchools, setCurrentHighSchools]);

    return (
        <div className="flex flex-row gap-2 items-end mb-4 w-full">
            <MagnifyingGlassIcon className="h-5 w-5 mb-1.5" />
            <FloatingInput id="admins-high-schools-search" label="Rechercher mon établissement" onInput={handleSearch} />
        </div>
    );
}
