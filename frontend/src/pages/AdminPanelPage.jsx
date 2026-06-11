import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { ShieldAlert, Users, ListTodo, Award, Sparkles, Trash2 } from 'lucide-react';

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const analyticsRes = await api.get('/admin/analytics');
      
      if (usersRes.data.success && analyticsRes.data.success) {
        setUsers(usersRes.data.data);
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      console.error('[!] Failed to load administrative panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name, email) => {
    if (email === 'admin@rpgquest.com') {
      alert('Cannot delete the master administrator account!');
      return;
    }

    if (!confirm(`CAUTION: Are you sure you want to permanently delete player ${name}? This will purge all their quests and achievements.`)) return;

    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        fetchAdminData(); // Refresh analytics
      }
    } catch (err) {
      console.error('[!] Failed to delete user:', err);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg relative pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8 relative z-10">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rpg-danger" /> Admin Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">Review user accounts, check engagement analytics, and moderate the realm.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-rpg-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Analytics Dashboard Grid */}
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass border border-rpg-border p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rpg-purple/10 border border-rpg-purple/30 flex items-center justify-center text-rpg-purple">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Total Signups</span>
                    <span className="text-2xl font-black text-white">{analytics.totalUsers} Players</span>
                  </div>
                </div>

                <div className="glass border border-rpg-border p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rpg-blue/10 border border-rpg-blue/30 flex items-center justify-center text-rpg-blue">
                    <ListTodo className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Total Quests</span>
                    <span className="text-2xl font-black text-white">{analytics.totalQuests} Quests</span>
                  </div>
                </div>

                <div className="glass border border-rpg-border p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-rpg-gold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Completion Rate</span>
                    <span className="text-2xl font-black text-white">{analytics.completionRate}% Cleared</span>
                  </div>
                </div>

                <div className="glass border border-rpg-border p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-450">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Average XP</span>
                    <span className="text-2xl font-black text-white">{analytics.averageXp} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Users moderation list */}
            <div className="glass border border-rpg-border p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Player Registry</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-rpg-border/30 text-[10px] text-gray-500 uppercase font-black">
                      <th className="pb-3 pl-2">Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3 text-center">Level</th>
                      <th className="pb-3 text-center">XP</th>
                      <th className="pb-3 text-center">Streak</th>
                      <th className="pb-3 text-center">Badges</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rpg-border/10 text-xs text-gray-300">
                    {users.map((player) => (
                      <tr key={player._id} className="hover:bg-rpg-purple/5">
                        <td className="py-3 pl-2 font-bold text-white">
                          {player.name}
                          {player.email === 'admin@rpgquest.com' && (
                            <span className="ml-2 text-[9px] bg-rpg-danger/25 text-rpg-danger border border-rpg-danger/30 px-1.5 py-0.5 rounded">
                              ADMIN
                            </span>
                          )}
                        </td>
                        <td className="py-3">{player.email}</td>
                        <td className="py-3 text-center font-bold">{player.level}</td>
                        <td className="py-3 text-center text-rpg-gold font-bold">{player.xp}</td>
                        <td className="py-3 text-center">{player.streak} Days</td>
                        <td className="py-3 text-center">{player.badges?.length || 0}</td>
                        <td className="py-3 text-right pr-2">
                          <button
                            disabled={player.email === 'admin@rpgquest.com'}
                            onClick={() => handleDeleteUser(player._id, player.name, player.email)}
                            className={`p-2 rounded-lg ${
                              player.email === 'admin@rpgquest.com'
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-rpg-danger/10 hover:bg-rpg-danger/20 border border-rpg-danger/20 text-rpg-danger transition-colors'
                            }`}
                            title="Delete Player"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
