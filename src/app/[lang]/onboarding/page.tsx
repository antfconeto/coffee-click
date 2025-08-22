'use client'
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { auth } from "@/config/firebase";
import { updateProfile } from "firebase/auth";
import { S3Service } from "@/services/s3Service";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Image from "next/image";
import { userApi } from "@/api/user";
import { User } from "@/types/user";

interface CropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    onCropComplete: (croppedFile: File) => void;
}

const CropModal = ({ isOpen, onClose, imageFile, onCropComplete }: CropModalProps) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imageSrc, setImageSrc] = useState<string>('');
    const [scale, setScale] = useState(1);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    useEffect(() => {
        if (imageSrc) {

            const image = new window.Image();
            image.onload = () => {
                const crop = centerCrop(
                    makeAspectCrop(
                        {
                            unit: '%',
                            width: 80,
                        },
                        1,
                        image.width,
                        image.height,
                    ),
                    image.width,
                    image.height,
                );
                setCrop(crop);
            };
            image.src = imageSrc;
        }
    }, [imageSrc]);

    const handleCropComplete = () => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;


        canvas.width = 300;
        canvas.height = 300;


        ctx.clearRect(0, 0, 300, 300);


        ctx.save();
        ctx.translate(150, 150);
        ctx.scale(scale, scale);
        ctx.translate(-150, -150);

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            300,
            300
        );

        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                onCropComplete(croppedFile);
                onClose();
            }
        }, 'image/jpeg', 0.9);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-black/80 backdrop-blur-sm flex max-md:h-full overflow-y-auto max-md:w-full items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-amber-100 max-md:mt-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-amber-800 mb-2">Recortar Imagem</h3>
                            <p className="text-amber-600 text-lg">
                                Ajuste a área de recorte para o formato quadrado (1:1) ideal para o perfil
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 max-md:w-8 max-md:h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-amber-600 hover:text-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-6 h-6 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Controles de ajuste */}
                    <div className="mb-8">
                        <div className="max-w-md mx-auto">
                            <label className="block text-lg font-semibold text-amber-700 mb-4 text-center">
                                Zoom: {scale.toFixed(1)}x
                            </label>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="w-full h-3 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full appearance-none cursor-pointer slider-custom"
                                />
                                <div className="flex justify-between text-sm text-amber-500 mt-2">
                                    <span>0.5x</span>
                                    <span>1.5x</span>
                                    <span>3x</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Área de crop */}
                    <div className="flex justify-center mb-8">
                        <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                minWidth={100}
                                minHeight={100}
                                keepSelection
                                className="max-w-full max-h-96"
                            >
                                <Image
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imageSrc}
                                    style={{
                                        transform: `scale(${scale})`,
                                        maxWidth: '100%',
                                        maxHeight: '400px',
                                        borderRadius: '12px',
                                    }}
                                    width={300}
                                    height={300}
                                />
                            </ReactCrop>
                        </div>
                    </div>

                    {/* Informações do crop */}
                    {completedCrop && (
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-6 bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-4 rounded-2xl border border-amber-100">
                                <div className="text-center">
                                    <p className="text-sm text-amber-500 font-medium">Largura</p>
                                    <p className="text-xl font-bold text-amber-700">{Math.round(completedCrop.width)}px</p>
                                </div>
                                <div className="w-px h-8 bg-amber-200"></div>
                                <div className="text-center">
                                    <p className="text-sm text-amber-500 font-medium">Altura</p>
                                    <p className="text-xl font-bold text-amber-700">{Math.round(completedCrop.height)}px</p>
                                </div>
                                <div className="w-px h-8 bg-amber-200"></div>
                                <div className="text-center">
                                    <p className="text-sm text-amber-500 font-medium">Posição X</p>
                                    <p className="text-xl font-bold text-amber-700">{Math.round(completedCrop.x)}px</p>
                                </div>
                                <div className="w-px h-8 bg-amber-200"></div>
                                <div className="text-center">
                                    <p className="text-sm text-amber-500 font-medium">Posição Y</p>
                                    <p className="text-xl font-bold text-amber-700">{Math.round(completedCrop.y)}px</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botões de ação */}
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 border-2 border-amber-300 text-amber-700 font-semibold text-lg rounded-2xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCropComplete}
                            disabled={!completedCrop}
                            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-lg rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Aplicar Recorte
                        </button>
                    </div>
                </div>

                {/* Canvas oculto para processamento */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default function OneBoardingPage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const { lang } = useParams();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [stepDirection, setStepDirection] = useState<'next' | 'prev'>('next');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [userNative, setUserNative] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, [])


    useEffect(() => {
        fetchUser();
    }, [user])

    const fetchUser = async () => {
        if (user) {
            let response = await userApi.getUserById(user?.uid!, user?.token!)
            console.log(`✍️ User fetched from backend:`, response)
            if (response) {
                setUserNative(response)
            }
        }

    }

    useEffect(() => {
        setDisplayName(user?.displayName || '');
        setPhotoURL(user?.photoURL || '');
    }, [user]);

    if (!user && !loading) {
        router.push(`/${lang}/home`);
    }

    const handleNext = () => {
        if (currentStep < 2 && !isTransitioning) {

            setStepDirection('next');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0 && !isTransitioning) {
            setStepDirection('prev');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(currentStep - 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    const handleStepClick = (step: number) => {
        if (!isTransitioning && step !== currentStep) {
            setStepDirection(step > currentStep ? 'next' : 'prev');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(step);
                setIsTransitioning(false);
            }, 300);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleImageSelection(file);
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            handleImageSelection(file);
        }
    };

    const handleImageSelection = (file: File) => {

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }


        setSelectedImageFile(file);
        setShowCropModal(true);
    };

    const handleCropComplete = async (croppedFile: File) => {
        setShowCropModal(false);
        setSelectedImageFile(null);
        await handleImageUpload(croppedFile);
    };

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        try {
            setUploadProgress(10);
            const presignedResult = await S3Service.generatePresignedUrl(
                file.name,
                file.type,
                'profile-images'
            );
            if (!presignedResult.success) {
                throw new Error(presignedResult.error || 'Erro ao gerar URL pré-assinada');
            }
            setUploadProgress(30);
            const uploadResult = await S3Service.uploadFileWithPresignedUrl(
                file,
                presignedResult.presignedUrl
            );
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Erro no upload para S3');
            }
            setUploadProgress(100);
            setPhotoURL(uploadResult.url!);
            setUploadedImage(file);

            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);

        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFinish = async () => {
        setIsUpdating(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName,
                    photoURL: photoURL
                });
                await userApi.updateUser({
                    ...userNative!,
                    name: displayName!,
                    photoUrl: photoURL!,
                }, user?.token!);
            }
            window.location.href = `/${lang}/home`;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSkip = () => {
        router.push(`/${lang}/coffee/create`);
    };

    const getStepTransitionClasses = () => {
        if (isTransitioning) {
            return stepDirection === 'next'
                ? 'opacity-0 translate-x-8 scale-95'
                : 'opacity-0 -translate-x-8 scale-95';
        }
        return 'opacity-100 translate-x-0 scale-100';
    };


    if (!mounted) {
        return <>
            <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-amber-200">{'Carregando...'}</p>
                </div>
            </div></>
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        {/* Welcome text with soft design */}
                        <div className={`transition-all duration-1000 ease-out delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="relative">
                                <h1 className="text-6xl md:text-7xl font-bold text-amber-800 mb-6">
                                    BEM VINDO
                                </h1>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-semibold text-amber-700 mb-6">
                                {user?.displayName}
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-medium text-amber-600 mb-8">
                                AO COFFEE CLICK
                            </h3>
                        </div>

                        {/* Subtitle with soft design */}
                        <div className={`transition-all duration-1000 ease-out delay-600 transform ${currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100 shadow-lg">
                                <p className="text-xl md:text-2xl text-amber-700 font-normal leading-relaxed max-w-3xl mx-auto">
                                    Descubra o mundo do café artesanal. Compartilhe suas experiências,
                                    explore novos sabores e conecte-se com outros amantes de café.
                                </p>
                            </div>
                        </div>
                        <button onClick={handleNext} className="px-8 py-4 bg-amber-600 text-white font-semibold text-lg rounded-xl hover:bg-amber-700 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg">
                            Próximo
                        </button>
                    </>
                );

            case 1:
                return (
                    <>
                        <div className={`transition-all duration-1000 ease-out transform ${'opacity-100 translate-y-0'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-8">
                                Personalize Seu Perfil
                            </h2>
                            <p className="text-xl text-amber-700 font-normal mb-12 max-w-3xl mx-auto leading-relaxed">
                                Adicione uma foto e personalize seu nome para que outros usuários possam te reconhecer melhor.
                            </p>

                            {/* Profile Image Section with Drag & Drop */}
                            <div className="mb-12">
                                <h3 className="text-2xl font-semibold text-amber-700 mb-6">Foto do Perfil</h3>
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <div className="w-36 h-36 rounded-full overflow-hidden border-3 border-amber-200 hover:border-amber-400 transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shadow-lg hover:shadow-xl">
                                            {photoURL ? (
                                                <Image
                                                    src={photoURL}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    width={100}
                                                    height={100}
                                                />
                                            ) : (
                                                <span className="text-5xl text-amber-500">👤</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Drag & Drop Area */}
                                <div className="max-w-md mx-auto">
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive
                                            ? 'border-amber-400 bg-amber-50'
                                            : 'border-amber-200 hover:border-amber-300'
                                            } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        {isUploading ? (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 mx-auto border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                                                <p className="text-amber-700 font-medium">Fazendo upload para S3...</p>
                                                <div className="w-full bg-amber-200 rounded-full h-2">
                                                    <div
                                                        className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-amber-600">{uploadProgress}%</p>
                                            </div>
                                        ) : uploadedImage ? (
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-3xl text-green-600">✓</span>
                                                </div>
                                                <p className="text-green-700 font-medium">Imagem carregada com sucesso!</p>
                                                <p className="text-sm text-amber-600">{uploadedImage.name}</p>
                                                <p className="text-xs text-amber-500">Armazenada no Amazon S3</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                                                    <span className="text-3xl text-amber-600">📷</span>
                                                </div>
                                                <p className="text-amber-700 font-medium">
                                                    Arraste e solte sua imagem aqui
                                                </p>
                                                <p className="text-sm text-amber-600">ou</p>
                                                <label className="inline-block px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors cursor-pointer">
                                                    Selecionar Arquivo
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-amber-500">
                                                    PNG, JPG até 5MB • Formato 1:1
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Display Name Section */}
                            <div className="mb-12">
                                <h3 className="text-2xl font-semibold text-amber-700 mb-6">Nome de Exibição</h3>
                                <div className="max-w-md mx-auto">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full px-6 py-4 text-lg border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none transition-all duration-300 text-center bg-white shadow-sm hover:shadow-md focus:shadow-lg placeholder-amber-400 font-medium"
                                        placeholder="Digite seu nome"
                                    />
                                </div>
                            </div>

                            {user?.photoURL && (
                                <div className="flex justify-center gap-4">
                                    <button onClick={handlePrevious} className="px-8 py-4 border-2 border-amber-500 text-amber-600 font-bold text-lg rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300 ease-out transform hover:scale-105">
                                        Anterior
                                    </button>
                                    <button onClick={handleNext} className="px-8 py-4 border-2 border-amber-500 text-amber-600 font-bold text-lg rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300 ease-out transform hover:scale-105">
                                        Próximo
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <div className={`transition-all duration-1000 ease-out transform ${'opacity-100 translate-y-0'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-green-700 mb-8">
                                Tudo Pronto!
                            </h2>
                            <p className="text-xl text-amber-700 font-normal mb-12 max-w-3xl mx-auto leading-relaxed">
                                Agora você pode começar a compartilhar suas experiências com café e descobrir novos sabores!
                            </p>

                            {/* Preview do perfil */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 mb-12 border border-amber-100 shadow-lg max-w-2xl mx-auto">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-6">
                                        {photoURL ? (
                                            <Image
                                                src={photoURL}
                                                alt="Profile"
                                                className="w-28 h-28 rounded-full object-cover border-3 border-amber-200 shadow-lg"
                                                width={100}
                                                height={100}
                                            />
                                        ) : (
                                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-3 border-amber-200 shadow-lg flex items-center justify-center">
                                                <span className="text-4xl text-amber-500">👤</span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-amber-800 mb-2">{displayName || user?.displayName}</h3>
                                    <p className="text-amber-600 text-base font-medium">Membro Coffee Click</p>
                                </div>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
                {/* Soft background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-10"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-yellow-300 rounded-full opacity-10"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full opacity-5"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                    {/* Main content container */}
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Step content with transition animation */}
                        <div className={`transition-all duration-300 ease-in-out transform ${getStepTransitionClasses()}`}>
                            {renderStepContent()}
                        </div>

                        {/* Navigation buttons */}
                        <div className={`transition-all duration-1000 ease-out delay-900 transform ${currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrevious}
                                        disabled={isTransitioning}
                                        className="px-10 py-5 border-2 border-amber-300 text-amber-700 font-semibold text-xl rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 ease-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Anterior
                                    </button>
                                )}

                                {currentStep < 2 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={isTransitioning || (currentStep === 1 && !uploadedImage)}
                                        className="px-12 py-5 bg-amber-600 text-white font-semibold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Próximo →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFinish}
                                        disabled={isUpdating || isTransitioning}
                                        className="px-12 py-5 bg-green-600 text-white font-semibold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Salvando...' : 'Começar Agora! 🚀'}
                                    </button>
                                )}

                                {currentStep === 2 && (
                                    <button
                                        onClick={handleSkip}
                                        disabled={isTransitioning}
                                        className="px-10 py-5 border-2 border-gray-300 text-gray-600 font-semibold text-xl rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ease-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Pular
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className={`transition-all duration-1000 ease-out delay-1200 transform ${currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} mt-16`}>
                            <div className="flex justify-center space-x-4 mb-4">
                                {[0, 1, 2].map((step) => (
                                    <div
                                        key={step}
                                        className={`w-4 h-4 rounded-full transition-all duration-500 cursor-pointer ${currentStep >= step ? 'bg-amber-600 scale-110 shadow-md' : 'bg-amber-200 hover:bg-amber-300'} ${isTransitioning ? 'pointer-events-none' : ''}`}
                                        onClick={() => handleStepClick(step)}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-amber-600 font-medium">Clique nos pontos para navegar</p>
                        </div>
                    </div>
                </div>

                {/* Soft floating coffee beans decoration */}
                <div className="absolute top-20 left-10 opacity-20">
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full shadow-sm"></div>
                </div>
                <div className="absolute top-40 right-20 opacity-20">
                    <div className="w-3 h-3 bg-gradient-to-br from-orange-300 to-red-400 rounded-full shadow-sm"></div>
                </div>
                <div className="absolute bottom-40 left-20 opacity-20">
                    <div className="w-2 h-2 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full shadow-sm"></div>
                </div>
                <div className="absolute top-1/3 right-1/4 opacity-15">
                    <div className="w-2 h-2 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-full"></div>
                </div>
            </div>

            {/* Modal de Crop */}
            <CropModal
                isOpen={showCropModal}
                onClose={() => setShowCropModal(false)}
                imageFile={selectedImageFile}
                onCropComplete={handleCropComplete}
            />
        </>
    )
}