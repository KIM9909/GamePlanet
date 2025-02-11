import { X } from 'lucide-react';

const SpecialCardModal = ({ onClose, cardId, type }) => (
    <div className="bg-slate-800 rounded-lg w-11/12 max-w-6xl h-5/6 p-8 relative">
      <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
        <X size={24} />
      </button>
      <h2 className="text-3xl font-bold text-cyan-400 mb-8">
        {type === 'telepathy' ? '텔레파시카드' : '뉴런의골짜기카드'} {cardId} 커스터마이징
      </h2>
    </div>
   );
   
   export default SpecialCardModal;