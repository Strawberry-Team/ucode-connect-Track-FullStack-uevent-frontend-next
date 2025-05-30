"use client";

import { useState, useEffect } from "react";
import {login, register, resetPassword} from "@/lib/auth";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import Image from "next/image";
import LoginForm from "./login-form";
import ResetPasswordForm from "./reset-password-form";
import RegisterForm from "./register-form";
import {loginZodSchema, registerZodSchema, resetPasswordZodSchema} from "@/zod/shemas";
import { AuthModalProps } from "@/types/auth";
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setAuthenticated } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("login");
    const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
    const [registerErrors, setRegisterErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
    }>({});
    const [resetErrors, setResetErrors] = useState<{ email?: string }>({});
    const { checkAuth } = useAuth();

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const togglePasswordRegisterVisibility = () => setShowRegisterPassword((prev) => !prev);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("login");
            setIsForgotPassword(false);
            setLoginErrors({});
            setRegisterErrors({});
            setResetErrors({});
        } else {
            setEmail("");
            setPassword("");
            setFirstName("");
            setLastName("");
            setResetEmail("");
            setShowPassword(false);
            setShowRegisterPassword(false);
            setIsForgotPassword(false);
            setLoginErrors({});
            setRegisterErrors({});
            setResetErrors({});
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loginData = { email, password };
        const loginValidation = loginZodSchema.safeParse(loginData);

        if (!loginValidation.success) {
            const errors = loginValidation.error.flatten().fieldErrors;
            setLoginErrors({
                email: errors.email?.[0],
                password: errors.password?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }
        setLoginErrors({});

        const result = await login(email, password);

        if (result.success) {
            setAuthenticated(true);
            showSuccessToast("Login successful");
            setEmail("");
            setPassword("");
            checkAuth();
            onClose();
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const resetData = { email: resetEmail };
        const resetValidation = resetPasswordZodSchema.safeParse(resetData);

        if (!resetValidation.success) {
            const errors = resetValidation.error.flatten().fieldErrors;
            setResetErrors({
                email: errors.email?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }
        setResetErrors({});

        const result = await resetPassword(resetEmail);

        if (result.success) {
            showSuccessToast("Password reset link sent to your email");
            setResetEmail("");
            setIsForgotPassword(false);
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const registerData = { firstName, lastName, email, password };
        const registerValidation = registerZodSchema.safeParse(registerData);

        if (!registerValidation.success) {
            const errors = registerValidation.error.flatten().fieldErrors;
            setRegisterErrors({
                firstName: errors.firstName?.[0],
                lastName: errors.lastName?.[0],
                email: errors.email?.[0],
                password: errors.password?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }

        setRegisterErrors({});


        const result = await register(firstName, (lastName || null) as string, email, password);

        if (result.success) {
            showSuccessToast("Registration successful. Please verify your email!");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setActiveTab("login");
            onClose();
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setIsForgotPassword(false);
        setLoginErrors({});
        setRegisterErrors({});
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="p-0 border-none rounded-4xl overflow-hidden"
                style={{
                    width: "clamp(300px, 100%, 1000px)",
                    height: "clamp(400px, 100vh - 250px, 600px)",
                    maxWidth: "95%",
                    maxHeight: "75%",
                }}
            >
                <div className="grid md:grid-cols-2 h-full">
                    <div className="relative hidden md:block h-full w-full">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
                            style={{ background: "#C4C4C4", maxWidth: "100%", maxHeight: "100%" }}
                        />
                    </div>
                    <div className="w-full h-full flex flex-col">
                        {/* Заголовок и вкладки сверху */}
                        <div className="flex flex-col items-center text-center pt-15 px-6">
                            <DialogTitle className="text-2xl font-bold">Welcome Calendula</DialogTitle>
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="px-6 w-full mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger className="cursor-pointer" value="login">
                                        Sign in
                                    </TabsTrigger>
                                    <TabsTrigger className="cursor-pointer" value="register">
                                        Sign up
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        {/* Центрирование контента */}
                        <div className="flex-1 flex items-center justify-center px-6 pb-14">
                            <Tabs value={activeTab} className="w-full">
                                <TabsContent value="login" className="mt-0">
                                    {!isForgotPassword ? (
                                        <LoginForm
                                            setIsForgotPassword={setIsForgotPassword}
                                            email={email}
                                            password={password}
                                            setEmail={setEmail}
                                            setPassword={setPassword}
                                            showPassword={showPassword}
                                            togglePasswordVisibility={togglePasswordVisibility}
                                            handleSubmit={handleSubmit}
                                        />
                                    ) : (
                                        <ResetPasswordForm
                                            setIsForgotPassword={setIsForgotPassword}
                                            setResetEmail={setResetEmail}
                                            handleResetPassword={handleResetPassword}
                                            resetEmail={resetEmail}
                                        />
                                    )}
                                </TabsContent>
                                <TabsContent value="register" className="mt-0">
                                    <RegisterForm
                                        firstName={firstName}
                                        lastName={lastName}
                                        email={email}
                                        password={password}
                                        setFirstName={setFirstName}
                                        setLastName={setLastName}
                                        setEmail={setEmail}
                                        setPassword={setPassword}
                                        showPassword={showRegisterPassword}
                                        togglePasswordVisibility={togglePasswordRegisterVisibility}
                                        handleRegister={handleRegister}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}