function StatusCard({
  title,
  value,
  color,
}) {
  return (
    <div className="bg-white shadow rounded-xl p-6">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <h1
        className={`text-4xl font-bold ${color}`}
      >
        {value}
      </h1>

    </div>
  );
}

export default StatusCard;