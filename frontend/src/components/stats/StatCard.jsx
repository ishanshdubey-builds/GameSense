
function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <h3>{value}</h3>
      {detail && <span className="stat-detail">{detail}</span>}
    </div>
  );
}

export default StatCard;
