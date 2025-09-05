'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header/Header';
import { useAuthContext } from '@/contexts/AuthContext';
import { MediaUpload } from '@/components/ui/media-upload/MediaUpload';
import { useMediaUploadContext } from '@/contexts/MediaUploadContext';
import { FiCoffee, FiPlus, FiX, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { coffeeApi } from '@/api/coffee';
import { Category, Coffee } from '@/types/coffee';
import { useDictionary } from '@/hooks/useDictionary';
import { LoadingState } from '@/components/ui/loaders/loader-state';

// Step Components - Reutilizando da página create
interface StepProps {
  formData: Coffee;
  handleInputChange: (field: keyof Coffee, value: string | number | boolean) => void;
  dictionary: any;
  showCategoryDropdown: boolean;
  searchResults: Category[];
  handleCategorySearch: (searchTerm: string) => void;
  handleCategorySelect: (category: Category) => void;
  handleCategoryRemove: (categoryId: string) => void;
  media: any[];
  getPlural: (count: number) => string;
}

// Step 1: Basic Information
const Step1BasicInfo: React.FC<Pick<StepProps, 'formData' | 'handleInputChange' | 'dictionary'>> = ({
  formData,
  handleInputChange,
  dictionary
}) => (
  <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-6 border border-gray-200 dark:border-amber-700/50">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <FiCoffee className="mr-2 text-amber-600" />
      {dictionary.pages.coffee.create.sections.basicInfo.title}
    </h2>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.name.label}
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
          placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.name.placeholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.origin.label}
        </label>
        <input
          type="text"
          required
          value={formData.origin}
          onChange={(e) => handleInputChange('origin', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
          placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.origin.placeholder}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.roastLevel.label}
        </label>
        <select
          value={formData.roastLevel}
          onChange={(e) => handleInputChange('roastLevel', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
        >
          <option value="light">{dictionary.pages.coffee.create.sections.basicInfo.fields.roastLevel.options.light}</option>
          <option value="medium">{dictionary.pages.coffee.create.sections.basicInfo.fields.roastLevel.options.medium}</option>
          <option value="dark">{dictionary.pages.coffee.create.sections.basicInfo.fields.roastLevel.options.dark}</option>
        </select>
      </div>
    </div>
  </div>
);

// Step 2: Price and Weight
const Step2PriceWeight: React.FC<Pick<StepProps, 'formData' | 'handleInputChange' | 'dictionary'>> = ({
  formData,
  handleInputChange,
  dictionary
}) => (
  <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-6 border border-gray-200 dark:border-amber-700/50">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <FiCoffee className="mr-2 text-amber-600" />
      {dictionary.pages.coffee.create.sections.priceWeight.title}
    </h2>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.price.label}
        </label>
        <div className="relative">
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
            className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
            placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.price.placeholder}
          />
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-500 dark:text-amber-400 focus:ring-0"
          >
            <option value="BRL">{dictionary.pages.coffee.create.sections.basicInfo.units.currency.BRL}</option>
            <option value="USD">{dictionary.pages.coffee.create.sections.basicInfo.units.currency.USD}</option>
            <option value="EUR">{dictionary.pages.coffee.create.sections.basicInfo.units.currency.EUR}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.weight.label}
        </label>
        <div className="flex">
          <input
            type="number"
            required
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-l-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
            placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.weight.placeholder}
          />
          <select
            value={formData.weightUnit}
            onChange={(e) => handleInputChange('weightUnit', e.target.value )}
            className="px-4 py-3 border border-l-0 border-gray-300 dark:border-amber-700/50 rounded-r-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
          >
            <option value="g">{dictionary.pages.coffee.create.sections.basicInfo.units.weight.g}</option>
            <option value="kg">{dictionary.pages.coffee.create.sections.basicInfo.units.weight.kg}</option>
            <option value="oz">{dictionary.pages.coffee.create.sections.basicInfo.units.weight.oz}</option>
            <option value="lb">{dictionary.pages.coffee.create.sections.basicInfo.units.weight.lb}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Step 3: Stock and Availability
const Step3Stock: React.FC<Pick<StepProps, 'formData' | 'handleInputChange' | 'dictionary'>> = ({
  formData,
  handleInputChange,
  dictionary
}) => (
  <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-6 border border-gray-200 dark:border-amber-700/50">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <FiCoffee className="mr-2 text-amber-600" />
      {dictionary.pages.coffee.create.sections.stock.title}
    </h2>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.stockQuantity.label}
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.stockQuantity}
          onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
          placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.stockQuantity.placeholder}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
        />
        <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700 dark:text-amber-200">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.isAvailable.label}
        </label>
      </div>
    </div>
  </div>
);

// Step 4: Description and Categories
const Step4Description: React.FC<Pick<StepProps, 'formData' | 'handleInputChange' | 'dictionary' | 'showCategoryDropdown' | 'searchResults' | 'handleCategorySearch' | 'handleCategorySelect' | 'handleCategoryRemove'>> = ({
  formData,
  handleInputChange,
  dictionary,
  showCategoryDropdown,
  searchResults,
  handleCategorySearch,
  handleCategorySelect,
  handleCategoryRemove
}) => (
  <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-6 border border-gray-200 dark:border-amber-700/50">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <FiCoffee className="mr-2 text-amber-600" />
      {dictionary.pages.coffee.create.sections.description.title}
    </h2>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.description.label}
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
          placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.description.placeholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-amber-200 mb-2">
          {dictionary.pages.coffee.create.sections.basicInfo.fields.categories.label}
        </label>
        
        {/* Campo de pesquisa de categorias */}
        <div className="relative category-search-container">
          <input
            type="text"
            placeholder={dictionary.pages.coffee.create.sections.basicInfo.fields.categories.searchPlaceholder}
            className="w-full px-4 py-3 border border-gray-300 dark:border-amber-700/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-amber-950/30 dark:text-white"
            onChange={(e) => handleCategorySearch(e.target.value)}
            onFocus={(e) =>  handleCategorySearch(e.target.value)}
          />
          
          {/* Dropdown de resultados da pesquisa */}
          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-amber-950/50 border border-gray-200 dark:border-amber-700/50 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-amber-900/20 transition-colors border-b border-gray-100 dark:border-amber-800/30 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          {category.icon || '☕'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500 dark:text-amber-400 truncate">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 dark:text-amber-400 text-center">
                  {dictionary.pages.coffee.create.sections.basicInfo.fields.categories.noResults}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Categorias selecionadas */}
        {formData.categories.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-amber-300 mb-2">
              {dictionary.pages.coffee.create.sections.basicInfo.fields.categories.selected}:
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full"
                >
                  <span className="material-symbols-outlined">{category.icon || '☕'}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryRemove(category.id)}
                    className="ml-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Step 5: Media Upload
const Step5Media: React.FC<Pick<StepProps, 'dictionary' | 'media' | 'getPlural'>> = ({
  dictionary,
  media,
  getPlural
}) => (
  <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-6 border border-gray-200 dark:border-amber-700/50">
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {dictionary.pages.coffee.create.sections.media.title}
      </h2>
      {media.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {dictionary.pages.coffee.create.sections.media.selected
            .replace('{count}', media.length.toString())
            .replace(/{plural}/g, getPlural(media.length))}
        </p>
      )}
    </div>
    
    <MediaUpload
      onMediaChange={(newMedia) => {
        console.log('🔄 Media changed in page:', newMedia.length);
      }}
      maxMedia={10}
      acceptedTypes={['image/*', 'video/*']}
    />
  </div>
);

export default function UpdateCoffeePage() {
  const router = useRouter();
  const params = useParams();
  const coffeeId = params.id as string;
  const { user } = useAuthContext();
  const { dictionary, loading: dictLoading } = useDictionary();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [isLoadingCoffee, setIsLoadingCoffee] = useState(true);
  const [formData, setFormData] = useState<Coffee>({
    name: '',
    description: '',
    origin: '',
    roastLevel: 'medium',
    price: 0,
    currency: 'BRL',
    weight: 0,
    review: {
      globalRating: 0,
      reviews: []
    },
    weightUnit: 'g',
    isAvailable: true,
    stockQuantity: 0,
    categories: [],
    medias: [],
    seller: {
      id: user?.uid || '',
      name: user?.displayName || '',
      photoUrl: user?.photoURL || ''
    },
    id: '',
    createdAt: '',
    updatedAt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const {
    media,
    uploadAllMedia,
    clearMedia,
    setMediaFromUrls
  } = useMediaUploadContext();

  useEffect(() => {
    const loadCoffee = async () => {
      if (!coffeeId) return;
      
      try {
        setIsLoadingCoffee(true);
        const coffeeData = await coffeeApi.getCoffeeById(coffeeId);
        setCoffee(coffeeData);
        setFormData(coffeeData);
        
        // Carrega as mídias existentes no contexto
        if (coffeeData.medias && coffeeData.medias.length > 0) {
          setMediaFromUrls(coffeeData.medias);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar o café:', error);
        router.push('/pt/home');
      } finally {
        setIsLoadingCoffee(false);
      }
    };

    loadCoffee();
  }, [coffeeId, router]);

  const handleInputChange = (field: keyof Coffee, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySearch = async (searchTerm: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await coffeeApi.listCategoriesByName(searchTerm.trim());
        setSearchResults(results);
        setShowCategoryDropdown(true);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setSearchResults([]);
        setShowCategoryDropdown(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleCategorySelect = (category: Category) => {
    if (!formData.categories.find(cat => cat.id === category.id) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    
    setSearchResults([]);
    setShowCategoryDropdown(false);
  };

  const handleCategoryRemove = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: 
        return !!(formData.name && formData.origin);
      case 2:
        return formData.price > 0 && formData.weight > 0;
      case 3: 
        return formData.stockQuantity >= 0;
      case 4:
        return !!formData.description;
      case 5: 
        return media && media.length > 0;
      default:
        return true;
    }
  };

  const canProceed = validateStep(currentStep);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.category-search-container')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    
    // Prevenir submit automático se não estivermos no último step ou se está submetendo
    if (currentStep !== totalSteps || isSubmitting) {
      console.log('🚫 Submit bloqueado - Step:', currentStep, 'Submitting:', isSubmitting);
      return;
    }
    
    if (!media || media.length === 0) {
      alert(dictionary?.pages.coffee.create.messages.mediaRequired || 'Por favor, selecione pelo menos uma imagem ou vídeo para o café.');
      return;
    }
    
    console.log('✅ Iniciando update do café...');
    setIsSubmitting(true);
    try {
      const uploadedMedia = await uploadAllMedia();
      const coffeeData = {
        ...formData,
        medias: uploadedMedia,
        updatedAt: new Date().toISOString()
      };
      
      await coffeeApi.updateCoffee(coffeeId, coffeeData, user?.token || '');
      router.push('/pt/home');
    } catch (error) {
      console.error('❌ Error updating coffee:', error);
      alert(dictionary?.pages.coffee.create.messages.error || 'Erro ao atualizar o café. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dictLoading || !dictionary || isLoadingCoffee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20 flex items-center justify-center">
        <LoadingState width="w-96" height="h-64" />
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Café não encontrado
          </h2>
          <button
            onClick={() => router.push('/pt/home')}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const getPlural = (count: number) => count !== 1 ? 's' : '';

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {dictionary.pages.coffee.create.sections.stepper.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isAccessible = stepNumber <= currentStep || validateStep(stepNumber - 1);
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isAccessible ? setCurrentStep(stepNumber) : null}
                  disabled={!isAccessible}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-amber-600 text-white'
                      : isActive
                      ? 'bg-amber-100 text-amber-600 border-2 border-amber-600'
                      : isAccessible
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-5 h-5" /> : stepNumber}
                </button>
                <span className={`mt-2 text-xs text-center ${
                  isActive ? 'text-amber-600 font-medium' : 'text-gray-500'
                }`}>
                  {title}
                </span>
              </div>
              {index < dictionary.pages.coffee.create.sections.stepper.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? 'bg-amber-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Editar Café: {coffee.name}
          </h1>
          <p className="text-gray-600 dark:text-amber-200">
            Atualize as informações do seu café
          </p>
        </div>

        <ProgressIndicator />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Step Content */}
          <div>
            {currentStep === 1 && (
              <Step1BasicInfo 
                formData={formData}
                handleInputChange={handleInputChange}
                dictionary={dictionary}
              />
            )}
            {currentStep === 2 && (
              <Step2PriceWeight 
                formData={formData}
                handleInputChange={handleInputChange}
                dictionary={dictionary}
              />
            )}
            {currentStep === 3 && (
              <Step3Stock 
                formData={formData}
                handleInputChange={handleInputChange}
                dictionary={dictionary}
              />
            )}
            {currentStep === 4 && (
              <Step4Description 
                formData={formData}
                handleInputChange={handleInputChange}
                dictionary={dictionary}
                showCategoryDropdown={showCategoryDropdown}
                searchResults={searchResults}
                handleCategorySearch={handleCategorySearch}
                handleCategorySelect={handleCategorySelect}
                handleCategoryRemove={handleCategoryRemove}
              />
            )}
            {currentStep === 5 && (
              <Step5Media 
                dictionary={dictionary}
                media={media}
                getPlural={getPlural}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 dark:border-amber-700/50 text-gray-700 dark:text-amber-200 rounded-xl hover:bg-gray-50 dark:hover:bg-amber-900/20 transition-colors flex items-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Anterior
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 dark:border-amber-700/50 text-gray-700 dark:text-amber-200 rounded-xl hover:bg-gray-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                Cancelar
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  Próximo
                  <FiArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed}
                  className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Atualizar Café
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
