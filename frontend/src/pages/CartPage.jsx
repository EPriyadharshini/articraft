import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, user, orders, error, updateQuantity: updateCartQuantity, removeFromCart } = useAppContext();

  const updateQuantity = (id, delta) => {
    const item = cart.find((entry) => entry.id === id);
    if (item) updateCartQuantity(id, Math.max(1, Math.min(item.stock ?? Infinity, item.quantity + delta))).catch(() => {});
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 120 ? 0 : 12;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="section-shell py-12">
      <h1 className="font-display text-5xl text-forest">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {cart.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-slate-500">Your cart is empty. Start shopping for handmade pieces.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-soft md:flex-row md:items-center">
                <img src={item.images?.[0]} alt={item.name} className="h-32 w-full rounded-[1.25rem] object-cover md:w-40" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">by {item.artist}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id).catch(() => {})} className="text-slate-500 hover:text-rose-600" aria-label={`Remove ${item.name} from cart`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-stone-300 bg-slate-50">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-slate-700" aria-label={`Decrease ${item.name} quantity`}><Minus size={16} /></button>
                      <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-slate-700" aria-label={`Increase ${item.name} quantity`}><Plus size={16} /></button>
                    </div>
                    <div className="text-2xl font-bold text-forest">{formatINR(item.price * item.quantity)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-800">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatINR(tax)}</span></div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4 text-lg font-semibold text-slate-800">
            <span>Total</span>
            <span>{formatINR(grandTotal)}</span>
          </div>
          {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              navigate('/checkout');
            }}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-forest px-5 py-3 font-medium text-white hover:bg-emerald-900"
          >
            {user ? 'Proceed to checkout' : 'Login to checkout'}
          </button>
          {orders?.length > 0 && (
            <div className="mt-4 text-center text-xs text-slate-500">{orders.length} order(s) saved in your account</div>
          )}
        </aside>
      </div>
    </div>
  );
}
