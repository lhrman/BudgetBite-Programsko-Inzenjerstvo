import React, { useState } from 'react';

const Admin = () => {
  const [userId, setUserId] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userId) {
      setMessage('❌ Molimo unesite User ID');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ Niste prijavljeni. Molimo prijavite se.');
        setLoading(false);
        return;
      }

      // Call API
      const response = await fetch('http://localhost:3001/api/admin/change-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          newRole: newRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Uloga uspješno promijenjena! User ID ${userId} je sada ${newRole}.`);
        setUserId('');
      } else {
        setMessage(`❌ Greška: ${data.message || 'Neuspjela promjena uloge'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Greška pri povezivanju sa serverom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>🔐 Admin Panel</h1>
        <p className="subtitle">Upravljanje korisničkim ulogama</p>

        <form onSubmit={handleSubmit} className="admin-form">
          
          <div className="form-group">
            <label htmlFor="userId">User ID *</label>
            <input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Unesite ID korisnika (npr. 12)"
              required
            />
            <small>ID korisnika čiju ulogu želite promijeniti</small>
          </div>

          <div className="form-group">
            <label>Nova uloga *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={newRole === 'student'}
                  onChange={(e) => setNewRole(e.target.value)}
                />
                <span>👨‍🎓 Student</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={newRole === 'creator'}
                  onChange={(e) => setNewRole(e.target.value)}
                />
                <span>👨‍🍳 Creator</span>
              </label>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Procesuiranje...' : '🔄 Promijeni ulogu'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Admin;