const CountdownModal = ({ count, isVisible }) => {
  if (!isVisible) return null;

  let content = count > 0 ? count : "START!";
  let color = count > 0 ? "text-white" : "text-green-500";
  let scale = count > 0 ? "scale-100" : "scale-110";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className={`transform transition-all duration-300 ${scale}`}>
        <span
          className={`text-8xl font-bold ${color} transition-colors duration-300`}
        >
          {content}
        </span>
      </div>
    </div>
  );
};

export default CountdownModal;
