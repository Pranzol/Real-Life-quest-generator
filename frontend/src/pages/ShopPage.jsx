import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Coins, ShieldAlert, Zap, Plus, Trash2, Award, Sparkles, ShoppingBag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHOP_ITEMS = [
  {
    id: 'streak_shield',
    title: 'Streak Shield',
    description: 'Consume this shield to prevent your active daily streak from resetting to 1 if you miss a day.',
    cost: 150,
    icon: ShieldAlert,
    color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-blue-400 shadow-blue-glow'
  },
  {
    id: 'xp_boost',
    title: 'XP Boost Potion',
    description: 'Drink this potion to double (+100% bonus) the XP gained on the next quest you clear.',
    cost: 200,
    icon: Zap,
    color: 'from-purple-600/20 to-pink-600/20 border-rpg-purple/40 text-rpg-purple-light shadow-purple-glow'
  }
];

const ShopPage = () => {
  const { user, refreshProfile } = useAuth();
  const [customRewards, setCustomRewards] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [activeTab, setActiveTab] = useState('potions'); // potions or custom
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  // Create Reward states
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(50);
  const [submittingReward, setSubmittingReward] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    fetchCustomRewards();
  }, []);

  const fetchCustomRewards = async () => {
    setLoadingCustom(true);
    try {
      const res = await api.get('/shop/rewards');
      if (res.data.success) {
        setCustomRewards(res.data.data);
      }
    } catch (err) {
      console.error('[!] Failed to load custom rewards:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleCreateCustomReward = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmittingReward(true);
    try {
      const res = await api.post('/shop/rewards', {
        title: newTitle,
        cost: newCost
      });
      if (res.data.success) {
        setNewTitle('');
        setNewCost(50);
        fetchCustomRewards();
      }
    } catch (err) {
      console.error('[!] Failed to create custom reward:', err);
    } finally {
      setSubmittingReward(false);
    }
  };

  const handleDeleteCustomReward = async (id) => {
    try {
      const res = await api.delete(`/shop/rewards/${id}`);
      if (res.data.success) {
        setCustomRewards(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('[!] Failed to delete reward:', err);
    }
  };

  const handleBuyItem = async (itemId, itemType) => {
    const cost = itemType === 'enhancer' 
      ? SHOP_ITEMS.find(i => i.id === itemId).cost 
      : customRewards.find(r => r._id === itemId).cost;

    if ((user?.gold || 0) < cost) {
      alert('You do not have enough Gold GP to purchase this item!');
      return;
    }

    setPurchasingId(itemId);
    try {
      const res = await api.post('/shop/buy', { itemId, itemType });
      if (res.data.success) {
        setPurchaseSuccess(`Successfully redeemed: ${itemType === 'enhancer' ? itemId.replace('_', ' ').toUpperCase() : 'Custom Reward'}!`);
        setTimeout(() => setPurchaseSuccess(''), 4000);
        await refreshProfile();
      }
    } catch (err) {
      console.error('[!] Shop purchase failed:', err);
      alert(err.response?.data?.message || 'Transaction failed.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg relative pb-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rpg-gold/5 blur-[140px] pointer-events-none" />
      
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8 relative z-10">
        
        {/* Purchase success banner */}
        <AnimatePresence>
          {purchaseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass border-2 border-rpg-gold p-4 rounded-xl shadow-gold-glow flex items-center justify-between bg-gray-950 text-white font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rpg-gold fill-rpg-gold animate-bounce" />
                {purchaseSuccess}
              </span>
              <button onClick={() => setPurchaseSuccess('')} className="text-gray-400 hover:text-white text-xs">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass border border-rpg-border p-6 sm:p-8 rounded-3xl bg-rpg-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-rpg-gold shadow-gold-glow animate-float">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">Tavern Gold Shop</h2>
              <p className="text-xs text-gray-400 mt-0.5">Spend your earned Gold Pieces (GP) on virtual enhancers or custom real-life rewards.</p>
            </div>
          </div>
          <div className="glass border border-rpg-gold/20 px-6 py-4 rounded-2xl bg-gray-950/60 flex items-center gap-3 shadow-gold-glow">
            <Coins className="w-10 h-10 text-rpg-gold fill-current animate-pulse" />
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider leading-none">Your Gold Balance</span>
              <span className="text-2xl font-black text-glow-gold text-yellow-400 mt-1 block">
                {user?.gold !== undefined ? user.gold : 100} <span className="text-xs font-bold text-gray-300">GP</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-rpg-border/30 gap-2">
          <button
            onClick={() => setActiveTab('potions')}
            className={`pb-3 px-4 text-sm font-bold tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'potions'
                ? 'border-rpg-purple text-rpg-purple-light text-glow-purple font-black'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Virtual Enhancers
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-sm font-bold tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-rpg-purple text-rpg-purple-light text-glow-purple font-black'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Tavern Custom Rewards
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'potions' ? (
          /* Enhancers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHOP_ITEMS.map((item) => {
              const Icon = item.icon;
              const userCount = item.id === 'streak_shield' ? user?.streakShields : user?.xpBoostsActive;
              return (
                <div
                  key={item.id}
                  className="glass border border-rpg-border/50 p-6 rounded-2xl flex flex-col justify-between hover:border-rpg-purple/40 hover:shadow-purple-glow transition-all duration-300 bg-rpg-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gray-950 border border-rpg-border/30 ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-950/60 border border-rpg-border/20">
                        Owned: {userCount || 0}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-rpg-border/10 pt-5 mt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-rpg-gold fill-current" />
                      <span className="font-black text-yellow-400 text-base">{item.cost} GP</span>
                    </div>
                    <button
                      disabled={purchasingId !== null}
                      onClick={() => handleBuyItem(item.id, 'enhancer')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-xs font-black hover:scale-[1.02] shadow-purple-glow transition-all flex items-center gap-1 border border-rpg-purple/20"
                    >
                      {purchasingId === item.id ? 'Redeeming...' : 'Purchase Item'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Rewards Section */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Custom Rewards List Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass border border-rpg-border p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-rpg-gold" /> Redeemed Custom Milestones
                </h3>

                {loadingCustom ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-rpg-purple border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : customRewards.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-rpg-border/30 rounded-xl">
                    <p className="text-xs leading-relaxed">No custom rewards created yet. Use the side panel to add your own real-life motivators like "Eat Pizza" or "Play 1hr Video Games"!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customRewards.map((reward) => (
                      <div
                        key={reward._id}
                        className="p-4 rounded-xl border border-rpg-border/30 bg-gray-950/40 hover:bg-gray-950/60 flex items-center justify-between gap-4 transition-all duration-300"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{reward.title}</h4>
                          <span className="text-[10px] text-gray-500 block">Custom Tavern reward</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                            <Coins className="w-4 h-4 text-rpg-gold fill-current" />
                            {reward.cost} GP
                          </div>
                          <button
                            disabled={purchasingId !== null}
                            onClick={() => handleBuyItem(reward._id, 'custom')}
                            className="px-3.5 py-1.5 rounded-lg bg-rpg-gold hover:bg-yellow-400 text-rpg-bg text-[10px] font-black hover:scale-[1.01] transition-all"
                          >
                            Redeem
                          </button>
                          <button
                            onClick={() => handleDeleteCustomReward(reward._id)}
                            className="p-2 rounded-lg bg-rpg-danger/5 hover:bg-rpg-danger/15 text-gray-500 hover:text-rpg-danger border border-transparent hover:border-rpg-danger/20 transition-all"
                            title="Delete custom reward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Reward Creator Column */}
            <div>
              <form
                onSubmit={handleCreateCustomReward}
                className="glass border border-rpg-border p-6 rounded-2xl bg-rpg-card space-y-4"
              >
                <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-rpg-border/20 pb-3 mb-4">
                  <Plus className="w-5 h-5 text-rpg-purple" /> Create Custom Reward
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Reward Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eat 1 slice of Cake, Play Zelda for 1 hr"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none focus:shadow-purple-glow transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Gold Cost (GP)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      max={9999}
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="w-24 px-3 py-2 bg-gray-950 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none"
                    />
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-0.5">
                      <Coins className="w-4 h-4 text-rpg-gold fill-current" /> GP Cost
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReward || !newTitle}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-xs font-black shadow-purple-glow hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-1.5 border border-rpg-purple/20 mt-4"
                >
                  {submittingReward ? 'Adding...' : (
                    <>
                      <Plus className="w-4 h-4" /> Create Reward
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
