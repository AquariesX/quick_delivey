'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react'

// Beautiful shopping-themed slider images for the hero section
const sliderImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Happy Woman Shopping',
    title: 'Shop with Joy',
    description: 'Experience the joy of shopping with our amazing collection.',
    cta: 'Start Shopping',
    ctaLink: '/customer/products'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern Shopping Experience',
    title: 'Modern Shopping',
    description: 'Discover the latest trends and innovations.',
    cta: 'Explore Now',
    ctaLink: '/customer/products?category=electronics'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Fashion Shopping',
    title: 'Fashion Forward',
    description: 'Stay stylish with our curated fashion collection.',
    cta: 'Shop Fashion',
    ctaLink: '/customer/products?category=fashion'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Delicious Food Delivery',
    title: 'Food Delivered Fast',
    description: 'Get your favorite meals delivered right to your door.',
    cta: 'Order Food',
    ctaLink: '/customer/products?category=food'
  }
];

// Map category names to Lucide icons for visual representation
const categoryIcons = {
  'All Products': ShoppingBag,
  'Electronics': Headphones,
  'Food & Groceries': Truck,
  'Fashion': Star,
  'Home & Kitchen': Shield,
  'Books': ShoppingBag, // You can choose different icons
  'Health & Beauty': Headphones,
  // Add more mappings as needed based on your actual categories
};

const categoryColors = {
  'All Products': 'text-white',
  'Electronics': 'text-yellow-300',
  'Food & Groceries': 'text-orange-300',
  'Fashion': 'text-pink-300',
  'Home & Kitchen': 'text-red-300',
  'Books': 'text-blue-300',
  'Health & Beauty': 'text-green-300',
  // Add more mappings
};


const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const CustomerHero = ({ onCategorySelect }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = Math.abs(page % sliderImages.length);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    // Auto-slide effect — use functional update so interval doesn't reset on every page change
    const autoSlide = setInterval(() => {
      setPage(([prevPage]) => [prevPage + 1, 1]);
    }, 4500); // faster and smoother auto-slide
    return () => clearInterval(autoSlide);
  }, []);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/customer/categories'); // Your new API route
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        // Add "All Products" as the first category option
        setCategories([{ id: 'all', name: 'All Products' }, ...data.data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Optionally set an error state to display to the user
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []); // Run once on component mount

  return (
    <div className="relative bg-gradient-to-br from-[#F25D49] via-[#FF6B5B] to-[#FF8E7A] min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden flex items-center justify-center p-0">
      {/* Background patterns and floating elements */}
      <div className="absolute inset-0 bg-black opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur-xl opacity-25"
      />
      <motion.div
        animate={{ y: [20, -20, 20], rotate: [360, 180, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-white to-yellow-200 rounded-full blur-xl opacity-25"
      />
      <motion.div
        animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-white to-yellow-100 rounded-full blur-lg opacity-30"
      />

      {/* Content Container - Full Width Slider */}
      <div className="relative z-10 w-full mx-auto overflow-hidden">
        {/* Make the slider full-bleed by allowing the inner slider to be full width while keeping a centered inner content box for texts */}
        <div className="w-full">
        
        {/* Image Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden w-full"
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900 w-full"
            >
              <img
                src={sliderImages[imageIndex].image}
                alt={sliderImages[imageIndex].alt}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                style={{ 
                  backgroundImage: `url(${sliderImages[imageIndex].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-center p-6">
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-5xl px-6"
                >
                  {/* Main Welcome Text */}
                  <motion.h1 
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  >
                    <span className="block">Welcome to</span>
                    {/* Animate just the QuickDelivery word */}
                    <motion.span
                      className="block text-transparent bg-clip-text font-extrabold text-5xl md:text-7xl lg:text-8xl"
                      initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                      animate={{ opacity: [0, 1], filter: ['grayscale(100%)', 'grayscale(0%)'] }}
                      transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 4 }}
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #FF8E7A, #F25D49, #FFD37A)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      QuickDelivery
                    </motion.span>
                  </motion.h1>
                  
                  {/* Subtitle with enhanced animation */}
                  <motion.p 
                    className="text-xl md:text-3xl lg:text-4xl text-white/95 max-w-4xl mb-12 drop-shadow-lg leading-relaxed font-medium"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1 }}
                    style={{
                      textShadow: '0 2px 15px rgba(0,0,0,0.4)'
                    }}
                  >
                    Discover amazing products from trusted vendors with lightning-fast delivery
                  </motion.p>
                  
                  {/* Enhanced CTA Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.3 }}
                  >
                    <motion.a
                      href={sliderImages[imageIndex].ctaLink}
                      className="px-10 py-5 bg-white text-[#F25D49] font-bold rounded-full shadow-2xl hover:bg-gray-50 transition-all duration-300 border-2 border-white hover:border-[#F25D49] text-xl relative overflow-hidden group"
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 15px 35px rgba(242,93,73,0.4)',
                        y: -2
                      }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                      }}
                    >
                      <span className="relative z-10">{sliderImages[imageIndex].cta}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.a>
                    
                    <motion.a
                      href="/customer"
                      className="px-10 py-5 bg-transparent text-white font-bold rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300 border-2 border-white hover:border-white/80 text-xl relative overflow-hidden group"
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 15px 35px rgba(255,255,255,0.3)',
                        y: -2
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10">Explore Products</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.a>
                  </motion.div>
                  
                  {/* Floating Elements */}
                  <motion.div
                    className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"
                    animate={{ 
                      y: [-20, 20, -20],
                      x: [-10, 10, -10],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute bottom-10 right-10 w-16 h-16 bg-white/15 rounded-full blur-lg"
                    animate={{ 
                      y: [20, -20, 20],
                      x: [10, -10, 10],
                      scale: [1, 0.8, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Slider Navigation Buttons */}
          <motion.button
            onClick={() => paginate(-1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-[#F25D49] p-4 rounded-full z-10 backdrop-blur-md transition-all duration-300 shadow-xl border border-white/20"
            whileHover={{ 
              scale: 1.15, 
              boxShadow: '0 8px 25px rgba(242,93,73,0.4)',
              backgroundColor: 'rgba(255,255,255,0.6)'
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-7 h-7" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-[#F25D49] p-4 rounded-full z-10 backdrop-blur-md transition-all duration-300 shadow-xl border border-white/20"
            whileHover={{ 
              scale: 1.15, 
              boxShadow: '0 8px 25px rgba(242,93,73,0.4)',
              backgroundColor: 'rgba(255,255,255,0.6)'
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-7 h-7" />
          </motion.button>

          {/* Enhanced Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 z-10">
            {sliderImages.map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-5 h-5 rounded-full transition-all duration-500 cursor-pointer ${
                  imageIndex === idx 
                    ? 'bg-white scale-125 shadow-lg border-2 border-white/50' 
                    : 'bg-white/40 hover:bg-white/60 border border-white/30'
                }`}
                whileHover={{ 
                  scale: 1.4,
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage([idx, 0])}
                animate={{
                  scale: imageIndex === idx ? 1.25 : 1,
                  backgroundColor: imageIndex === idx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CustomerHero