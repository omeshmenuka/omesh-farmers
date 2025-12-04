
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Leaf, TrendingUp, AlertCircle, ShieldCheck, Ban, Check, X, Trash2, ExternalLink, Eye } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const AdminDashboard: React.FC = () => {
  const { farmers, toggleVerification, approveFarmer, deleteFarmer } = useFarmers();
  
  // Derived Stats from Context
  const totalFarmers = farmers.filter(f => f.isApproved).length;
  const verifiedFarmers = farmers.filter(f => f.verified && f.isApproved).length;
  const pendingApprovals = farmers.filter(f => !f.isApproved);
  
  const categoryData = [
    { name: 'Vegetables', value: 400 },
    { name: 'Fruits', value: 300 },
    { name: 'Dairy', value: 300 },
    { name: 'Honey', value: 200 },
  ];

  const trafficData = [
    { name: 'Mon', users: 120 },
    { name: 'Tue', users: 150 },
    { name: 'Wed', users: 180 },
    { name: 'Thu', users: 190 },
    { name: 'Fri', users: 300 },
    { name: 'Sat', users: 450 },
    { name: 'Sun', users: 380 },
  ];

  const COLORS = ['#15803d', '#16a34a', '#4ade80', '#bbf7d0'];

  const handleInspect = (id: string) => {
    window.open(`#/farmer/${id}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-stone-600">Platform overview and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-stone-500 text-sm font-medium">Active Farmers</p>
              <h3 className="text-3xl font-bold text-stone-800">{totalFarmers}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-700">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-stone-500 text-sm font-medium">Verified Badge</p>
              <h3 className="text-3xl font-bold text-stone-800">{verifiedFarmers}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-700">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-stone-500 text-sm font-medium">Weekly Growth</p>
              <h3 className="text-3xl font-bold text-stone-800">+12%</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-stone-500 text-sm font-medium">Pending Requests</p>
              <h3 className="text-3xl font-bold text-stone-800">{pendingApprovals.length}</h3>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS SECTION */}
      {pendingApprovals.length > 0 && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden">
           <div className="p-6 border-b border-yellow-100 flex items-center gap-2">
             <AlertCircle className="text-yellow-700" size={24} />
             <h3 className="text-lg font-bold text-yellow-900">New Submissions Pending Approval</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-stone-600">
               <thead className="bg-yellow-100/50 text-stone-500 font-medium uppercase tracking-wider">
                 <tr>
                   <th className="px-6 py-4">Farmer Name</th>
                   <th className="px-6 py-4">Location</th>
                   <th className="px-6 py-4">Phone</th>
                   <th className="px-6 py-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-yellow-100">
                 {pendingApprovals.map((farmer) => (
                   <tr key={farmer.id} className="bg-white hover:bg-yellow-50/50 transition-colors">
                     <td className="px-6 py-4 font-medium text-stone-900">{farmer.name}</td>
                     <td className="px-6 py-4">{farmer.address}</td>
                     <td className="px-6 py-4">{farmer.phone}</td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => approveFarmer(farmer.id)}
                           className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 shadow-sm"
                         >
                           <Check size={14} /> Accept
                         </button>
                         <button 
                           onClick={() => deleteFarmer(farmer.id)}
                           className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200"
                         >
                           <X size={14} /> Reject
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Traffic Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-6">User Activity (Weekly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <Tooltip 
                  cursor={{fill: '#f5f5f4'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="users" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-6">Popular Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm text-stone-600">
             {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  {entry.name}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Active Farmers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800">Verified Active Farmers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Farmer Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {farmers.filter(f => f.isApproved).map((farmer) => (
                <tr key={farmer.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900">
                     <button 
                       onClick={() => handleInspect(farmer.id)}
                       className="hover:text-green-700 hover:underline flex items-center gap-1 group"
                       title="Inspect Profile"
                     >
                       {farmer.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                  </td>
                  <td className="px-6 py-4">{farmer.address}</td>
                  <td className="px-6 py-4">
                     <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    {farmer.verified ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1">
                        No Badge
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                       onClick={() => handleInspect(farmer.id)}
                       title="Inspect Profile"
                       className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => toggleVerification(farmer.id)}
                      title="Toggle Verified Badge"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        farmer.verified 
                          ? 'bg-stone-100 text-stone-500 hover:bg-stone-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                       <ShieldCheck size={14} /> {farmer.verified ? 'Revoke' : 'Verify'}
                    </button>
                    <button 
                       onClick={() => deleteFarmer(farmer.id)}
                       title="Delete Farmer"
                       className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
