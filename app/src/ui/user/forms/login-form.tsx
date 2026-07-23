import { Card } from "@/app/src/ui/card";
import { FloatingInput } from "@/app/src/ui/inputs/floating-input";
import { Button } from "@/app/src/ui/button";
import React, { ReactElement } from "react";
import { fetchCsrfClient, goralysFetchClient } from "@goralys/core";
import { useToast } from "@/app/src/ui/toast/toast-provider";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { getSchoolToken } from "@/app/src/lib/auth/school-token";

export default function LoginForm(): ReactElement {
    const requestUrl = `user/login?high-school-token=${getSchoolToken()}`;
    const { showToast } = useToast();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        const csrfToken = await fetchCsrfClient("login");

        const res = await goralysFetchClient("POST", requestUrl, {
            "csrf-token": csrfToken,
            client_context: "mobile",
            username,
            password,
        });
        const data = await res.json();
        console.log("LoginForm received data:", JSON.stringify(data));

        if (data?.toast) {
            showToast({
                type: data?.toastType,
                title: data?.toastTitle,
                message: data?.toastMessage,
            });
            navigateTo(data?.redirect);
            return;
        }

        if (data?.redirect) {
            navigateTo(data?.redirect);
            return;
        }
    };

    return (
        <Card className="relative flex-col h-65 bg-sky-200 order-1 sm:order-2">
            <h1 className="text-xl">Connectez vous à votre compte Goralys</h1>

            <form className="relative flex flex-col h-full" onSubmit={handleSubmit} method="POST" autoComplete="on">
                <FloatingInput id="username" label="Identifiant" helper="Identifiant au format p.nomX" autocomplete="username" required />

                <FloatingInput id="password" label="Mot de passe" autocomplete="current-password" password required />

                <Button type="submit" text={"Se connecter"} className="absolute! bottom-0" />
            </form>
        </Card>
    );
}
