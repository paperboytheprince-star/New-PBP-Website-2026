import { useState, useEffect } from 'react';
import { productsAPI, cartAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, Bell, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Shop = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  useEffect(() => {
    loadProducts();
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await cartAPI.add({ product_id: productId, quantity: 1 });
      await loadCart();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateCartItem = async (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await cartAPI.remove(itemId);
      } else {
        await cartAPI.update(itemId, newQuantity);
      }
      await loadCart();
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      await loadCart();
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleNotify = (e) => {
    e.preventDefault();
    if (notifyEmail) {
      toast.success('We\'ll notify you when the shop opens!');
      setNotifyEmail('');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1763168573987-5c3130015401?w=1600)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pp-lavender to-white" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-pp-magenta text-white font-campaign text-lg px-6 py-2 mb-6 pulse-pink">
            <Sparkles className="w-4 h-4 mr-2" />
            COMING SOON
          </Badge>
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl uppercase tracking-tight mb-4" data-testid="shop-title">
            The Official Shop
          </h1>
          <p className="font-primary text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Rep the movement with exclusive Paperboy Prince merchandise. All proceeds support our community programs.
          </p>
          
          {/* Notify Form */}
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              className="rounded-full border-2 border-black px-6 py-3 input-glow"
              data-testid="notify-email-input"
            />
            <Button 
              type="submit"
              className="rounded-full bg-pp-magenta text-white font-bold px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              data-testid="notify-button"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </form>
        </div>
      </section>

      {/* Cart Button (Fixed) */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 z-50 rounded-full bg-pp-magenta text-white w-16 h-16 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-1 hover:shadow-none transition-all"
            data-testid="cart-floating-button"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
                {cart.items.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md border-l-2 border-black">
          <SheetHeader>
            <SheetTitle className="font-campaign text-2xl tracking-wider">YOUR CART</SheetTitle>
          </SheetHeader>
          
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <ShoppingCart className="w-16 h-16 text-pp-pink mb-4" />
              <p className="font-primary text-muted-foreground">Your cart is empty</p>
              <p className="font-primary text-sm text-muted-foreground mt-2">
                Shop will open soon!
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {cart.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-4 bg-muted rounded-xl border-2 border-black"
                  data-testid={`cart-item-${item.id}`}
                >
                  {item.product_image && (
                    <img 
                      src={item.product_image} 
                      alt={item.product_title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-primary font-bold">{item.product_title}</h4>
                    <p className="font-primary text-pp-magenta font-semibold">
                      ${item.product_price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full border-2 border-black"
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                        data-testid={`decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-primary font-bold w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full border-2 border-black"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        data-testid={`increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t-2 border-black pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-primary font-bold text-lg">Total</span>
                  <span className="font-primary font-extrabold text-2xl text-pp-magenta">
                    ${cart.total.toFixed(2)}
                  </span>
                </div>
                <Button 
                  className="w-full rounded-full bg-pp-magenta text-white font-bold py-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all opacity-50 cursor-not-allowed"
                  disabled
                  data-testid="checkout-button"
                >
                  Checkout Coming Soon
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Products Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta mb-8" data-testid="products-title">
          PREVIEW COLLECTION
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-2 border-black overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300 group"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative h-64 overflow-hidden bg-pp-lavender">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-16 h-16 text-pp-pink" />
                    </div>
                  )}
                  {!product.available && (
                    <Badge className="absolute top-4 right-4 bg-black text-white font-campaign">
                      COMING SOON
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-primary font-bold text-xl mb-2">{product.title}</h3>
                  <p className="font-primary text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-primary font-extrabold text-2xl text-pp-magenta">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      className={`rounded-full font-bold px-6 py-2 border-2 border-black transition-all ${
                        product.available 
                          ? 'bg-pp-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!product.available}
                      onClick={() => addToCart(product.id)}
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      {product.available ? 'Add to Cart' : 'Soon'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-pp-pink mx-auto mb-4" />
            <p className="font-primary text-lg text-muted-foreground">
              Products coming soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
