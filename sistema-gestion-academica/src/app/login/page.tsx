'use client'

import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// --- Tipos para el Estado de la Vista ---
type View = 'login' | 'register' | 'verify-email' | 'verify-code' | 'success';

// --- Constantes de Estilo ---
const AMARILLO_FONDO = '#E6A425'; 
const AZUL_TEXTO = '#16469B'; 

// Define el tipo de props para los componentes que cambian de vista
type ViewProps = {
    onViewChange: (view: View) => void;
    onError: (msg: string) => void;
    error: string;
};

// 1. VISTA DE REGISTRO
const RegisterForm = ({ onViewChange, onError, error }: ViewProps) => {
    const [clave, setClave] = useState('')
    const [password, setPassword] = useState('')

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onError('');

        if (!clave || !password) {
            onError('Por favor, completa ambos campos.');
            return;
        }

        // Simulación: Si la clave ya existe
        if (clave === '12345') {
            onError('La clave ya se ha registrado antes, inicie sesión.');
            return;
        }

        onViewChange('verify-email');
    }

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Registro</h2>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <InputField
                    label="Clave:"
                    value={clave}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClave(e.target.value)}
                />

                <InputField
                    label="Contraseña:"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />

                {error.includes('La clave ya se ha registrado') && (
                    <p className="text-red-500 text-sm flex items-center">
                        <span className="text-xl mr-2">●</span>{error}
                    </p>
                )}

                <div className="text-left flex justify-between items-center pt-2">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onViewChange('login'); }}
                        className="text-blue-900 text-sm font-normal hover:underline cursor-pointer"
                        style={{ color: AZUL_TEXTO }}
                    >
                        Atrás
                    </a>
                    {error.includes('La clave ya se ha registrado') && (
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onViewChange('login'); }}
                            className="text-blue-900 text-sm font-normal hover:underline cursor-pointer"
                            style={{ color: AZUL_TEXTO }}
                        >
                            Inicie sesión
                        </a>
                    )}
                </div>

                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Continuar</Button>
            </form>
        </>
    )
}

// 2. VISTA DE VERIFICACIÓN DE CORREO 
const VerifyEmailForm = ({ onViewChange, onError, error }: ViewProps) => {
    const [correo, setCorreo] = useState('');

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        onError('');

        if (correo === 'invalido@unison.mx') {
            onError('Correo no encontrado en el sistema');
            return;
        }

        onViewChange('verify-code');
    }

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Verificación de cuenta</h2>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
                <InputField
                    label="Introduzca su correo institucional:"
                    value={correo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)}
                />

                {error.includes('Correo no encontrado') && (
                    <p className="text-red-500 text-sm flex items-center">
                        <span className="text-xl mr-2">●</span>{error}
                    </p>
                )}

                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Enviar correo</Button>

                <div className="text-left pt-2">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onViewChange('register'); }}
                        className="text-blue-900 text-sm font-normal hover:underline cursor-pointer"
                        style={{ color: AZUL_TEXTO }}
                    >
                        Atrás
                    </a>
                </div>
            </form>
        </>
    )
}

// 3. VISTA DE INGRESO DE CÓDIGO DE VERIFICACIÓN
const VerifyCodeForm = ({ onViewChange, onError }: ViewProps) => {
    const [code, setCode] = useState('');

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        onViewChange('success');
    }

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Verificación de cuenta</h2>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
                <InputField
                    label="Introduzca la clave de verificación:"
                    type="tel"
                    maxLength={6}
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                />

                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Verificar</Button>

                <div className="text-left pt-2">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onViewChange('verify-email'); }}
                        className="text-blue-900 text-sm font-normal hover:underline cursor-pointer"
                        style={{ color: AZUL_TEXTO }}
                    >
                        Atrás
                    </a>
                </div>
            </form>
        </>
    )
}

// 4. VISTA DE ÉXITO DE REGISTRO
const SuccessView = ({ onViewChange }: ViewProps) => {
    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Verificación de cuenta</h2>
            </div>

            <div className="text-center space-y-4">
                <p className="text-xl text-green-600">
                    Registro completado correctamente
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.8" />
                    <path d="M22 4L12 14.01l-3-3" />
                </svg>

                <Button
                    onClick={() => onViewChange('login')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                >
                    Iniciar sesión
                </Button>
            </div>
        </>
    )
}


// =================================================================
// COMPONENTE PRINCIPAL (LOGIN PAGE) 
// =================================================================

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false) // Nuevo estado de carga
    const [currentView, setCurrentView] = useState<View>('login') 

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true) // Iniciar carga

        if (!email || !password) {
            setError('Por favor, completa ambos campos.')
            setIsLoading(false)
            return
        }

        try {
            // Normalización
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();

            // LLAMADA AL BACKEND REAL
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: trimmedEmail, 
                    password: trimmedPassword 
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Muestra el mensaje de error que viene del backend
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Login Exitoso
            console.log("Usuario autenticado:", data.user);
            
            // IMPORTANTE: Guardamos al usuario en LocalStorage para que el Dashboard lo lea
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/inicio'); // Redirección

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false) // Terminar carga
        }
    }

    const handleViewChange = (view: View) => {
        setCurrentView(view)
        setError('') 
    }

    const renderContent = () => {
        switch (currentView) {
            case 'login':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800 mt-4">Iniciar sesión</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField
                                label="Correo institucional:"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                disabled={isLoading} 
                            />

                            <InputField
                                label="Contraseña:"
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                disabled={isLoading} 
                            />

                            {error && (
                                <p className="text-red-500 text-sm flex items-center bg-red-50 p-2 rounded border border-red-100">
                                    <span className="text-xl mr-2">●</span>{error}
                                </p>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <Checkbox
                                    label="Recuérdame"
                                    checked={rememberMe}
                                    onChange={setRememberMe}
                                    disabled={isLoading}
                                />
                                <a href="/recuperar-contrasena" className="text-blue-900 text-sm font-normal hover:underline" style={{ color: AZUL_TEXTO }}>
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <Button 
                                type="submit" 
                                className="bg-yellow-600 hover:bg-yellow-700 w-full flex justify-center items-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Iniciando...
                                    </>
                                ) : (
                                    'Enviar'
                                )}
                            </Button>

                            <div className="text-center mt-4">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleViewChange('register'); }}
                                    className="text-blue-900 text-sm font-normal hover:underline cursor-pointer"
                                    style={{ color: AZUL_TEXTO }}
                                >
                                    Regístrate aquí
                                </a>
                            </div>
                        </form>
                    </>
                );
            case 'register':
                return <RegisterForm onViewChange={handleViewChange} onError={setError} error={error} />;
            case 'verify-email':
                return <VerifyEmailForm onViewChange={handleViewChange} onError={setError} error={error} />;
            case 'verify-code':
                return <VerifyCodeForm onViewChange={handleViewChange} onError={setError} error={error} />;
            case 'success':
                return <SuccessView onViewChange={handleViewChange} onError={setError} error={error} />;
            default:
                return null;
        }
    };

    return (
        <div
            className="min-h-screen flex justify-center items-center"
            style={{ backgroundColor: AMARILLO_FONDO }}
        >
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">

                {/* Logo y lema */}
                <div className="text-center mb-6">
                    {/* Reemplaza con tu componente Image o el código para el logo */}
                    <div className="relative w-24 h-24 mx-auto mb-2">
                         <Image 
                            src="/logounison.png" 
                            alt="Universidad de Sonora" 
                            fill
                            className="object-contain"
                         />
                    </div>
                    <h1 className="text-lg font-semibold" style={{ color: AZUL_TEXTO }}>
                        UNIVERSIDAD DE SONORA
                    </h1>
                    <p className="font-serif italic text-xs" style={{ color: AZUL_TEXTO }}>
                        "El Saber de mis Hijos hará mi Grandeza"
                    </p>
                </div>

                {/* Renderizar el contenido basado en el estado */}
                {renderContent()}

            </div>
        </div>
    )
}