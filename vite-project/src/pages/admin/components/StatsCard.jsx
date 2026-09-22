import React from 'react';

const StatsCard = ({ label, value }) => {
  return (
    <div style={{ padding: 16, borderRadius: 8, background: 'var(--card-bg, #fff)', boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.06))', minWidth: 160 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value ?? 0}</div>
    </div>
  );
};

export default StatsCard;
