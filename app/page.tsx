/*
 * Goralys — application de gestion des sujets du Grand oral
 * Copyright (C) 2025-2026 Sami Saubion
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { ReactElement } from "react";
import { Metadata } from "next";
import HomePageClient from "@/app/home-page-client";

export const metadata: Metadata = {
    title: "Goralys | Accueil",
};

export default function HomePage(): ReactElement {
    return <HomePageClient />;
}
