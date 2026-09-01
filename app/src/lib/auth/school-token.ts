"use client";

import { Preferences } from "@capacitor/preferences";
import { SCHOOL_TOKEN_KEY } from "@/app/src/lib/config";

let schoolToken: string = "no-token";

export const setSchoolToken = async (token: string): Promise<void> => {
    schoolToken = token;
    await Preferences.set({ key: SCHOOL_TOKEN_KEY, value: schoolToken });
};
export const getSchoolToken = (): string => schoolToken;
