import { Device } from "@capacitor/device";
import { SecureStorage, StorageError } from "@aparajita/capacitor-secure-storage";
import { AUTH_TOKEN_KEY, AUTH_USERNAME_KEY } from "@/app/src/lib/config";
import { cookiesGet, fetchCsrfClient, goralysFetchClient, handleToastRequest, ToastFn, USERNAME_KEY } from "@goralys/core";

async function removeToken(): Promise<void> {
    await SecureStorage.remove(AUTH_TOKEN_KEY);
    await SecureStorage.remove(AUTH_USERNAME_KEY);
}

async function getToken(): Promise<string | null> {
    try {
        const t = await SecureStorage.get(AUTH_TOKEN_KEY);
        return typeof t === "string" ? t : null;
    } catch (e) {
        if (e instanceof StorageError && e.code === "invalidData") {
            // nuke corrupted token
            await removeToken();
        }

        return null; // don't propagate err
    }
}

async function getUserName(): Promise<string | null> {
    try {
        const u = await SecureStorage.get(AUTH_USERNAME_KEY);
        return typeof u === "string" ? u : null;
    } catch (e) {
        if (e instanceof StorageError && e.code === "invalidData") {
            // nuke corrupted username
            await removeToken();
        }

        return null; // don't propagate err
    }
}

async function saveToken(token: string, username: string): Promise<void> {
    await SecureStorage.set(AUTH_TOKEN_KEY, token);
    await SecureStorage.set(AUTH_USERNAME_KEY, username);
}

export async function createAuthToken(showToast: ToastFn): Promise<void> {
    const deviceName = (await Device.getInfo()).name;
    if (!deviceName) {
        throw new Error("No device name provided");
    }

    console.log(deviceName);

    const authToken = await getToken();
    if (authToken) {
        return;
    }

    const res = await goralysFetchClient("POST", "user/token/create", {
        name: deviceName,
        "csrf-token": await fetchCsrfClient("create-auth-token"),
    });

    await handleToastRequest(res, showToast);
    const data = await res.json();
    const u = cookiesGet(USERNAME_KEY);
    console.log(u);
    if (res.ok && data?.token && typeof data?.token === "string" && typeof u === "string") {
        await saveToken(data.token, u);
    }
}

export async function loginToken(showToast: ToastFn): Promise<void> {
    const deviceName = (await Device.getInfo()).name;
    if (!deviceName) {
        throw new Error("No device name provided");
    }

    const username = await getUserName();
    const token = await getToken();
    if (!token) {
        throw new Error("No token provided");
    }

    if (!username) {
        throw new Error("No username provided");
    }

    const res = await goralysFetchClient("POST", "user/token/login", {
        username,
        token: token,
        "csrf-token": await fetchCsrfClient("login-auth-token"),
    });

    await handleToastRequest(res, showToast);

    const data = await res.json();
    if (data?.token) {
        await saveToken(data.token, username);
    }
}
