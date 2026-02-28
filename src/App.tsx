/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { 
  Scissors, 
  Calendar, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  User, 
  Clock,
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Trash2,
  Plus,
  Check,
  MessageCircle,
  Settings,
  Package,
  Info,
  Save,
  Edit3,
  PlusCircle,
  X,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { SERVICES as INITIAL_SERVICES } from './constants';
import { Screen, Service, Booking, Profile, Product, BarbershopInfo } from './types';

const INITIAL_BARBERSHOP_INFO: BarbershopInfo = {
  name: 'Barbearia Prime',
  address: 'Av. Principal',
  neighborhood: 'Centro',
  city: 'Cidade Exemplo',
  number: '1234',
  openingHours: 'Seg - Sáb: 09h às 20h',
  whatsapp: '5577988618862',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Dynamic Data State
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [barbershopInfo, setBarbershopInfo] = useState<BarbershopInfo>(INITIAL_BARBERSHOP_INFO);

  // Admin Editing State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Login State
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  
  // Signup State
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Admin State
  const [adminPassword, setAdminPassword] = useState('');
  
  // Cart State
  const [cart, setCart] = useState<Service[]>([]);

  // Profile State
  const [profile, setProfile] = useState<Profile>({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    houseNumber: '',
    complement: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [booking, setBooking] = useState<Booking>({
    services: [],
    name: '',
    phone: '',
    date: '',
    time: '',
  });

  const handleWhatsAppServiceBooking = (service: Service) => {
    const message = `Olá, gostaria de agendar um horário para ${service.name}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${barbershopInfo.whatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = (service: Service) => {
    setCart(prev => [...prev, service]);
    setToast('Serviço adicionado ao carrinho');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizeWhatsApp = () => {
    if (cart.length === 0) return;

    const servicesList = cart.map(s => `- ${s.name}`).join('\n');
    const namePart = profile.name ? `Meu nome é ${profile.name} e gostaria` : 'Gostaria';
    
    const message = `Olá, ${namePart} de agendar os seguintes serviços:\n${servicesList}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${barbershopInfo.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Load data from Supabase and localStorage
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    };

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
        setBooking(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone
        }));
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await checkUser();
        // Fetch Services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
        if (!servicesError && servicesData && servicesData.length > 0) {
          setServices(servicesData);
        } else {
          const savedServices = localStorage.getItem('barbearia_prime_services');
          if (savedServices) {
            setServices(JSON.parse(savedServices));
          } else {
            setServices(INITIAL_SERVICES);
          }
        }

        // Fetch Products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        if (!productsError && productsData) {
          setProducts(productsData);
        } else {
          const savedProducts = localStorage.getItem('barbearia_prime_products');
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
          }
        }

        // Fetch Barbershop Info
        const { data: infoData, error: infoError } = await supabase
          .from('barbershop_info')
          .select('*')
          .single();
        if (!infoError && infoData) {
          setBarbershopInfo(infoData);
        } else {
          const savedInfo = localStorage.getItem('barbearia_prime_info');
          if (savedInfo) {
            setBarbershopInfo(JSON.parse(savedInfo));
          }
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile({
          name: '',
          phone: '',
          address: '',
          neighborhood: '',
          city: '',
          houseNumber: '',
          complement: ''
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save dynamic data to localStorage
  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('barbearia_prime_services', JSON.stringify(services));
    }
  }, [services]);

  useEffect(() => {
    localStorage.setItem('barbearia_prime_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('barbearia_prime_info', JSON.stringify(barbershopInfo));
  }, [barbershopInfo]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!loginForm.identifier || !loginForm.password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.identifier,
        password: loginForm.password,
      });

      if (authError) throw authError;
      
      setCurrentScreen('home');
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!signupForm.name || !signupForm.phone || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: signupForm.name,
            phone: signupForm.phone,
            email: signupForm.email
          });

        if (profileError) throw profileError;
        
        setToast('Cadastro realizado com sucesso!');
        setCurrentScreen('home');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.phone || !profile.address || !profile.neighborhood || !profile.city || !profile.houseNumber) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...profile
          });
        
        if (profileError) throw profileError;
      }

      localStorage.setItem('barbearia_prime_profile', JSON.stringify(profile));
      setToast('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
      setError('');
      
      setBooking(prev => ({
        ...prev,
        name: profile.name,
        phone: profile.phone
      }));
    } catch (err: any) {
      setError('Erro ao salvar perfil no banco de dados.');
    }
  };

  const handleWhatsAppBooking = () => {
    // Functionality removed in favor of direct WhatsApp booking
  };

  // Admin Handlers
  const handleAddService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
    };
    setEditingService(newService);
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editingService.name || editingService.price <= 0) {
      setError('Nome e preço são obrigatórios.');
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('services')
        .upsert(editingService);

      if (supabaseError) throw supabaseError;

      setServices(prev => {
        const exists = prev.find(s => s.id === editingService.id);
        if (exists) {
          return prev.map(s => s.id === editingService.id ? editingService : s);
        }
        return [...prev, editingService];
      });
      setEditingService(null);
      setToast('Serviço salvo com sucesso!');
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Erro ao salvar no banco de dados.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        const { error: supabaseError } = await supabase
          .from('services')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        setServices(prev => prev.filter(s => s.id !== id));
        setToast('Serviço excluído.');
      } catch (err) {
        console.error('Error deleting service:', err);
        setToast('Erro ao excluir do banco de dados.');
      }
    }
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
    };
    setEditingProduct(newProduct);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || editingProduct.price <= 0) {
      setError('Nome e preço são obrigatórios.');
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('products')
        .upsert(editingProduct);

      if (supabaseError) throw supabaseError;

      setProducts(prev => {
        const exists = prev.find(p => p.id === editingProduct.id);
        if (exists) {
          return prev.map(p => p.id === editingProduct.id ? editingProduct : p);
        }
        return [...prev, editingProduct];
      });
      setEditingProduct(null);
      setToast('Produto salvo com sucesso!');
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Erro ao salvar no banco de dados.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const { error: supabaseError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        setProducts(prev => prev.filter(p => p.id !== id));
        setToast('Produto excluído.');
      } catch (err) {
        console.error('Error deleting product:', err);
        setToast('Erro ao excluir do banco de dados.');
      }
    }
  };

  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { error: supabaseError } = await supabase
        .from('barbershop_info')
        .upsert({ ...barbershopInfo, id: 1 }); // Assuming single row with id 1

      if (supabaseError) throw supabaseError;

      setToast('Informações atualizadas!');
      setCurrentScreen('admin_dashboard');
    } catch (err) {
      console.error('Error saving info:', err);
      setError('Erro ao salvar no banco de dados.');
    }
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminPassword === '447hot') {
      setCurrentScreen('admin_dashboard');
      setAdminPassword('');
    } else {
      setError('Senha incorreta');
    }
  };

  const handleOpenAdmin = () => {
    setError('');
    setAdminPassword('');
    setCurrentScreen('admin_login');
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'service' | 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        if (type === 'service' && editingService) {
          setEditingService({ ...editingService, image: dataUrl });
        } else if (type === 'product' && editingProduct) {
          setEditingProduct({ ...editingProduct, image: dataUrl });
        } else if (type === 'logo') {
          setBarbershopInfo({ ...barbershopInfo, logo: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmBooking = (e: FormEvent) => {
    e.preventDefault();
    // Functionality removed in favor of direct WhatsApp booking
  };

  const resetApp = () => {
    setCurrentScreen('home');
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price, 0);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="mobile-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-6"
          >
            <div className="bg-brand-green text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold">
              <Check className="w-4 h-4" />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/40 text-xs uppercase tracking-widest animate-pulse">Carregando dados...</p>
          </motion.div>
        ) : currentScreen === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-8 justify-center"
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,78,59,0.5)] mb-6">
                {barbershopInfo.logo ? (
                  <img src={barbershopInfo.logo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <Scissors className="w-10 h-10 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">
                {barbershopInfo.name.split(' ')[0]} <span className="text-brand-green">{barbershopInfo.name.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Acesse sua conta</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Email ou Telefone"
                    className="input-field pl-12"
                    value={loginForm.identifier}
                    onChange={e => setLoginForm(prev => ({ ...prev, identifier: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Senha"
                    className="input-field pl-12 pr-12"
                    value={loginForm.password}
                    onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="btn-primary w-full mt-4"
              >
                Entrar
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/40 text-sm">
                Não tem conta? {' '}
                <button 
                  onClick={() => {
                    setError('');
                    setCurrentScreen('signup');
                  }}
                  className="text-brand-green font-bold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </motion.div>
        ) : currentScreen === 'signup' ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentScreen('login')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold">Criar Conta</h2>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="input-field pl-12"
                    value={signupForm.name}
                    onChange={e => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    className="input-field pl-12"
                    value={signupForm.phone}
                    onChange={e => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="input-field pl-12"
                    value={signupForm.email}
                    onChange={e => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-field pl-12"
                    value={signupForm.password}
                    onChange={e => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-field pl-12"
                    value={signupForm.confirmPassword}
                    onChange={e => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center py-2">{error}</p>}

              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="btn-primary w-full mt-4"
              >
                Criar Conta
              </motion.button>
            </form>
          </motion.div>
        ) : currentScreen === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col p-8"
          >
            <div className="flex justify-between items-center w-full">
              <button 
                onClick={handleOpenAdmin}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 text-white/40 hover:text-white"
              >
                <Settings className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Admin</span>
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentScreen('profile')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setCurrentScreen('cart')}
                  className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,78,59,0.5)]"
              >
                {barbershopInfo.logo ? (
                  <img src={barbershopInfo.logo} alt="Logo" className="w-14 h-14 object-contain" />
                ) : (
                  <Scissors className="w-12 h-12 text-white" />
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h1 className="text-4xl font-black tracking-tighter uppercase">
                  {barbershopInfo.name.split(' ')[0]} <span className="text-brand-green">{barbershopInfo.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-white/50 mt-2 font-medium tracking-widest uppercase text-xs">
                  Estilo & Tradição
                </p>
              </motion.div>

              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="w-full space-y-4 pt-8"
              >
                <motion.button 
                  variants={fadeInUp}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentScreen('services')}
                  className="btn-primary"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Horário
                </motion.button>
                <motion.button 
                  variants={fadeInUp}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentScreen('services')}
                  className="btn-secondary"
                >
                  Ver Serviços
                </motion.button>
              </motion.div>
            </div>

            <div className="mt-auto pt-8 flex flex-col items-center gap-2 text-white/30 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{barbershopInfo.address}, {barbershopInfo.number} - {barbershopInfo.neighborhood}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <Clock className="w-3 h-3" />
                <span>{barbershopInfo.openingHours}</span>
              </div>
            </div>
          </motion.div>
        ) : currentScreen === 'services' ? (
          <motion.div
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentScreen('home')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold">Escolha seu Estilo</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentScreen('profile')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <User className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('cart')}
                    className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'services' ? 'bg-brand-green text-white shadow-lg' : 'text-white/40'}`}
                >
                  Serviços
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'products' ? 'bg-brand-green text-white shadow-lg' : 'text-white/40'}`}
                >
                  Produtos
                </button>
              </div>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {activeTab === 'services' ? (
                services.map((service) => (
                  <motion.div 
                    variants={fadeInUp}
                    key={service.id}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-green/50 transition-all group"
                  >
                    {service.image && (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg group-hover:text-brand-green transition-colors">{service.name}</h3>
                        <span className="text-brand-green font-black text-lg">R$ {service.price}</span>
                      </div>
                      <p className="text-white/50 text-sm mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(service)}
                        className="w-full py-4 bg-white/5 hover:bg-brand-green text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-brand-green"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar ao Carrinho
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                products.length === 0 ? (
                  <motion.div 
                    variants={fadeInUp}
                    className="h-full flex flex-col items-center justify-center text-white/20 py-20"
                  >
                    <Package className="w-12 h-12 mb-2" />
                    <p>Nenhum produto disponível</p>
                  </motion.div>
                ) : (
                  products.map((product) => (
                    <motion.div 
                      variants={fadeInUp}
                      key={product.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-green/50 transition-all group"
                    >
                      {product.image && (
                        <div className="w-full h-48 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg group-hover:text-brand-green transition-colors">{product.name}</h3>
                          <span className="text-brand-green font-black text-lg">R$ {product.price}</span>
                        </div>
                        <p className="text-white/50 text-sm mb-4 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-white/20">
                          Consulte disponibilidade na loja
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </motion.div>
          </motion.div>
        ) : currentScreen === 'cart' ? (
          <motion.div
            key="cart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center gap-4 border-b border-white/5">
              <button onClick={() => setCurrentScreen('services')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold">Seu Carrinho</h2>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex-1 overflow-y-auto p-6"
            >
              {cart.length === 0 ? (
                <motion.div 
                  variants={fadeInUp}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium">Seu carrinho está vazio</p>
                  <button 
                    onClick={() => setCurrentScreen('services')}
                    className="text-brand-green font-bold hover:underline"
                  >
                    Ver serviços disponíveis
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {cart.map((service, index) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={`${service.id}-${index}`}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-bold">{service.name}</h3>
                          <p className="text-brand-green font-black text-sm">R$ {service.price}</p>
                        </div>
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveFromCart(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {cart.length > 0 && (
              <div className="p-6 bg-white/5 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Total Geral</span>
                  <span className="text-2xl font-black text-brand-green">R$ {cartTotal}</span>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    scale: [1, 1.01, 1],
                    boxShadow: [
                      "0 10px 20px rgba(37, 211, 102, 0.2)",
                      "0 10px 30px rgba(37, 211, 102, 0.4)",
                      "0 10px 20px rgba(37, 211, 102, 0.2)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  onClick={handleFinalizeWhatsApp}
                  className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-6 h-6" />
                  Finalizar pelo WhatsApp
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : currentScreen === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => {
                  setError('');
                  setIsEditingProfile(false);
                  setCurrentScreen('home');
                }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Meu Perfil</h2>
              </div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setCurrentScreen('login');
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
              >
                Sair
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    disabled={!isEditingProfile}
                    type="text" 
                    placeholder="Seu nome"
                    className="input-field pl-12 disabled:opacity-50"
                    value={profile.name}
                    onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    disabled={!isEditingProfile}
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    className="input-field pl-12 disabled:opacity-50"
                    value={profile.phone}
                    onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    disabled={!isEditingProfile}
                    type="text" 
                    placeholder="Rua, Avenida..."
                    className="input-field pl-12 disabled:opacity-50"
                    value={profile.address}
                    onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Bairro</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      disabled={!isEditingProfile}
                      type="text" 
                      placeholder="Bairro"
                      className="input-field pl-10 disabled:opacity-50"
                      value={profile.neighborhood}
                      onChange={e => setProfile(prev => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      disabled={!isEditingProfile}
                      type="text" 
                      placeholder="Cidade"
                      className="input-field pl-10 disabled:opacity-50"
                      value={profile.city}
                      onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Número</label>
                  <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      disabled={!isEditingProfile}
                      type="text" 
                      placeholder="Nº"
                      className="input-field pl-10 disabled:opacity-50"
                      value={profile.houseNumber}
                      onChange={e => setProfile(prev => ({ ...prev, houseNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Complemento</label>
                  <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      disabled={!isEditingProfile}
                      type="text" 
                      placeholder="Apt, Bloco..."
                      className="input-field pl-10 disabled:opacity-50"
                      value={profile.complement}
                      onChange={e => setProfile(prev => ({ ...prev, complement: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center py-2">{error}</p>}

              <div className="pt-6 space-y-3">
                {isEditingProfile ? (
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className="btn-primary w-full"
                  >
                    Salvar Informações
                  </motion.button>
                ) : (
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-secondary w-full"
                  >
                    Editar Perfil
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        ) : currentScreen === 'admin_login' ? (
          <motion.div
            key="admin_login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col p-8 justify-center"
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,78,59,0.5)] mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">
                Login <span className="text-brand-green">Administrativo</span>
              </h1>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Acesso Restrito</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="password" 
                    placeholder="Senha de acesso"
                    className="input-field pl-12"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="btn-primary w-full mt-4"
              >
                Entrar
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="button" 
                onClick={() => setCurrentScreen('home')}
                className="w-full text-white/40 text-xs font-bold uppercase tracking-widest mt-4 hover:text-white transition-colors"
              >
                Voltar ao Início
              </motion.button>
            </form>
          </motion.div>
        ) : currentScreen === 'admin_dashboard' ? (
          <motion.div
            key="admin_dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center gap-4 border-b border-white/5">
              <button onClick={() => setCurrentScreen('home')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold">Área Administrativa</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('admin_services')}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-brand-green/50 transition-all"
              >
                <div className="w-12 h-12 bg-brand-green/20 rounded-xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-brand-green" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Gerenciar Serviços</h3>
                  <p className="text-white/40 text-xs">Adicione, edite ou exclua serviços</p>
                </div>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('admin_products')}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-brand-green/50 transition-all"
              >
                <div className="w-12 h-12 bg-brand-green/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-brand-green" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Gerenciar Produtos</h3>
                  <p className="text-white/40 text-xs">Controle seu estoque de produtos</p>
                </div>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('admin_info')}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-brand-green/50 transition-all"
              >
                <div className="w-12 h-12 bg-brand-green/20 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-brand-green" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Informações da Barbearia</h3>
                  <p className="text-white/40 text-xs">Endereço, WhatsApp e horários</p>
                </div>
              </motion.button>

              <button 
                onClick={() => setCurrentScreen('home')}
                className="mt-4 w-full p-4 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Sair da Área Administrativa
              </button>
            </div>
          </motion.div>
        ) : currentScreen === 'admin_services' ? (
          <motion.div
            key="admin_services"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentScreen('admin_dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Serviços</h2>
              </div>
              <button 
                onClick={handleAddService}
                className="p-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {services.map(service => (
                <div key={service.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-white/20" />
                    </div>
                    <div>
                      <h3 className="font-bold">{service.name}</h3>
                      <p className="text-brand-green font-black text-sm">R$ {service.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingService(service)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {editingService && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute inset-0 z-50 bg-brand-black flex flex-col"
                >
                  <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h2 className="text-xl font-bold">{editingService.id.length > 10 ? 'Novo Serviço' : 'Editar Serviço'}</h2>
                    <button onClick={() => setEditingService(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveService} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Nome do Serviço</label>
                      <input 
                        required
                        type="text" 
                        className="input-field"
                        value={editingService.name}
                        onChange={e => setEditingService(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Descrição</label>
                      <textarea 
                        className="input-field min-h-[100px] py-3"
                        value={editingService.description}
                        onChange={e => setEditingService(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Preço (R$)</label>
                      <input 
                        required
                        type="number" 
                        className="input-field"
                        value={editingService.price}
                        onChange={e => setEditingService(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Imagem do Serviço</label>
                      <div className="flex flex-col gap-4">
                        {editingService.image && (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
                            <img src={editingService.image} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setEditingService({ ...editingService, image: undefined })}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-brand-green/50 transition-all cursor-pointer">
                            <ImageIcon className="w-6 h-6 text-brand-green" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'service')}
                            />
                          </label>
                          <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-brand-green/50 transition-all cursor-pointer">
                            <Camera className="w-6 h-6 text-brand-green" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment"
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'service')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="btn-primary w-full mt-4">
                      <Save className="w-5 h-5" />
                      Salvar Serviço
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : currentScreen === 'admin_products' ? (
          <motion.div
            key="admin_products"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentScreen('admin_dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Produtos</h2>
              </div>
              <button 
                onClick={handleAddProduct}
                className="p-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <Package className="w-12 h-12 mb-2" />
                  <p>Nenhum produto cadastrado</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-brand-green font-black text-sm">R$ {product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <AnimatePresence>
              {editingProduct && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute inset-0 z-50 bg-brand-black flex flex-col"
                >
                  <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h2 className="text-xl font-bold">{editingProduct.id.length > 10 ? 'Novo Produto' : 'Editar Produto'}</h2>
                    <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Nome do Produto</label>
                      <input 
                        required
                        type="text" 
                        className="input-field"
                        value={editingProduct.name}
                        onChange={e => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Descrição</label>
                      <textarea 
                        className="input-field min-h-[100px] py-3"
                        value={editingProduct.description}
                        onChange={e => setEditingProduct(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Preço (R$)</label>
                      <input 
                        required
                        type="number" 
                        className="input-field"
                        value={editingProduct.price}
                        onChange={e => setEditingProduct(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Imagem do Produto</label>
                      <div className="flex flex-col gap-4">
                        {editingProduct.image && (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
                            <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: undefined })}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-brand-green/50 transition-all cursor-pointer">
                            <ImageIcon className="w-6 h-6 text-brand-green" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'product')}
                            />
                          </label>
                          <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-brand-green/50 transition-all cursor-pointer">
                            <Camera className="w-6 h-6 text-brand-green" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment"
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'product')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="btn-primary w-full mt-4">
                      <Save className="w-5 h-5" />
                      Salvar Produto
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : currentScreen === 'admin_info' ? (
          <motion.div
            key="admin_info"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 flex items-center gap-4 border-b border-white/5">
              <button onClick={() => setCurrentScreen('admin_dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold">Informações</h2>
            </div>

            <form onSubmit={handleSaveInfo} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Nome da Barbearia</label>
                <div className="relative">
                  <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    className="input-field pl-12"
                    value={barbershopInfo.name}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    className="input-field pl-12"
                    value={barbershopInfo.address}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Bairro</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={barbershopInfo.neighborhood}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, neighborhood: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Número</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={barbershopInfo.number}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Cidade</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={barbershopInfo.city}
                  onChange={e => setBarbershopInfo(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Horário de Funcionamento</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    className="input-field pl-12"
                    value={barbershopInfo.openingHours}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, openingHours: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">WhatsApp (55...)</label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    className="input-field pl-12"
                    value={barbershopInfo.whatsapp}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">URL da Logo</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="input-field pl-12"
                    value={barbershopInfo.logo}
                    onChange={e => setBarbershopInfo(prev => ({ ...prev, logo: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                <Save className="w-5 h-5" />
                Salvar Informações
              </button>
            </form>
          </motion.div>
        ) : currentScreen === 'confirmation' ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-8 items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(6,78,59,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-black mb-2">Agendamento realizado com sucesso!</h2>
            <p className="text-white/50 mb-8">Prepare-se para renovar seu visual na Barbearia Prime.</p>

            <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4 mb-8 max-h-[40vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-white/40 text-sm uppercase font-bold">Cliente</span>
                <span className="font-bold">{booking.name}</span>
              </div>
              <div className="space-y-2 border-b border-white/5 pb-3">
                <span className="text-white/40 text-sm uppercase font-bold block">Serviços</span>
                {booking.services.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-black text-brand-green">R$ {s.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-white/40 text-sm uppercase font-bold">Data</span>
                <span className="font-bold">{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-white/40 text-sm uppercase font-bold">Horário</span>
                <span className="font-bold">{booking.time}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/40 text-sm uppercase font-bold">Total</span>
                <span className="text-xl font-black text-brand-green">R$ {booking.services.reduce((acc, s) => acc + s.price, 0)}</span>
              </div>
            </div>

            <button 
              onClick={resetApp}
              className="btn-secondary"
            >
              Voltar ao início
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
