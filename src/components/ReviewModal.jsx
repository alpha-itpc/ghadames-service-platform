import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewModal({ isOpen, onClose, provider, onReviewSubmitted }) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً لإضافة تقييم');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider_type: provider.type,
          target_id: provider.id,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onReviewSubmitted();
        onClose();
      } else {
        setError(data.message || 'حدث خطأ في إضافة التقييم');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالشبكة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-extrabold text-xl text-slate-900 mb-1">تقييم الخدمة</h3>
        <p className="text-xs text-slate-500 mb-6">شارك تجربتك مع {provider.name}</p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selection */}
          <div className="text-center bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
            <p className="text-xs font-bold text-amber-900 mb-2">اختر عدد النجوم (من 1 إلى 5)</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">تعليقك وتقييمك الشخصي</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب انطباعك عن سرعة الأداء وجودة الخدمة وحسن التعامل..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {submitting ? <span>جاري الحفظ...</span> : <><Send className="w-4 h-4" /><span>نشر التقييم</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
