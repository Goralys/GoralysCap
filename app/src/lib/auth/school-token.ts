"use client";

import { Preferences } from "@capacitor/preferences";

let schoolToken: string = "no-token";

export const setSchoolToken = async (token: string): Promise<void> => {
    schoolToken = token;
    await Preferences.set({ key: "school-token", value: schoolToken });
};
export const getSchoolToken = (): string => schoolToken;
