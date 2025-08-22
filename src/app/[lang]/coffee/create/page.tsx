'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header/Header';
import { useAuthContext } from '@/contexts/AuthContext';
import { MediaUpload } from '@/components/ui/media-upload/MediaUpload';
import { useMediaUploadContext } from '@/contexts/MediaUploadContext';
import { FiCoffee, FiPlus, FiX } from 'react-icons/fi';
import { coffeeApi } from '@/api/coffee';
import { Category, Coffee } from '@/types/coffee';
import { useDictionary } from '@/hooks/useDictionary';



export default function CreateCoffeePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { dictionary, loading: dictLoading } = useDictionary();
  const [formData, setFormData] = useState<Coffee>({
    name: '',
    description: '',
    origin: '',
    roastLevel: 'medium',
    price: 0,
    currency: 'BRL',
    weight: 0,
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
  
  const {
    media,
    uploadAllMedia,
    clearMedia
  } = useMediaUploadContext();

  const handleInputChange = (field: keyof Coffee, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySearch = async (searchTerm: string) => {
    // Limpar timeout anterior se existir
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Debounce de 300ms para evitar muitas requisições
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
    // Verificar se a categoria já foi selecionada
    if (!formData.categories.find(cat => cat.id === category.id) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    
    // Limpar pesquisa e fechar dropdown
    setSearchResults([]);
    setShowCategoryDropdown(false);
  };

  const handleCategoryRemove = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  // Limpar timeout quando componente for desmontado
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Fechar dropdown quando clicar fora
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media || media.length === 0) {
      alert(dictionary?.pages.coffee.create.messages.mediaRequired || 'Por favor, selecione pelo menos uma imagem ou vídeo para o café.');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('📸 Starting upload for', media.length, 'media files');
      const uploadedMedia = await uploadAllMedia();
      console.log('✅ Upload completed:', uploadedMedia);
      const coffeeData = {
        ...formData,
        seller: {
          id: user?.uid || '',
          name: user?.displayName || '',
          photoUrl: user?.photoURL || ''
        },
        medias: uploadedMedia
      };
      console.log('☕ Creating coffee with data:', coffeeData);
      const response = await coffeeApi.createCoffee(coffeeData as unknown as Coffee);
      console.log('🎉 Coffee created successfully:', response);
      clearMedia();
      router.push('/pt/home');
    } catch (error) {
      console.error('❌ Error creating coffee:', error);
      alert(dictionary?.pages.coffee.create.messages.error || 'Erro ao criar o café. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dictLoading || !dictionary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-amber-200">{dictionary?.common.loading || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  const getPlural = (count: number) => count !== 1 ? 's' : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amber-950/20">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {dictionary.pages.coffee.create.title}
          </h1>
          <p className="text-gray-600 dark:text-amber-200">
            {dictionary.pages.coffee.create.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
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

              <div>
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
            </div>

            {/*Cateories input*/}
            <div className="">
              </div>
            <div className="mt-6">
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

            <div className="mt-6">
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

            <div className="mt-6 flex items-center">
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

          {/* Upload de Mídia */}
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

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 dark:border-amber-700/50 text-gray-700 dark:text-amber-200 rounded-xl hover:bg-gray-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              {dictionary.pages.coffee.create.sections.actions.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {dictionary.pages.coffee.create.sections.actions.creating}
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  {dictionary.pages.coffee.create.sections.actions.create} {media.length > 0 && dictionary.pages.coffee.create.sections.actions.withMedia
                    .replace('{count}', media.length.toString())
                    .replace(/{plural}/g, getPlural(media.length))}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
