import React, { useState } from 'react';
import { X, Send, Calendar, Clock, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ServiceRequestModal({ isOpen, onClose, provider }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customer_name: user ? user.name : '',
    customer_phone: user ? user.phone : '',
    service_id: '',
    description: '',
    requested_date: new Date().toISOString().split('T')[0],
    requested_time: '10:00',
    address: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user ? user.id : null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          provider_type: provider.type,
          target_id: provider.id,
          service_id: formData.service_id || null,
          description: formData.description,
          requested_date: formData.requested_date,
          requested_time: formData.requested_time,
          address: formData.address
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'تم إرسال الطلب بنجاح!');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-tr from-primary-600 to-orange-400 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg">طلب خدمة جديدة</h3>
            <p className="text-xs text-orange-100">موجه إلى: {provider.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successMsg ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-xl text-slate-900">تم إرسال طلبك بنجاح!</h4>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="أدخل اسمك"
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="091XXXXXXX"
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-right focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ المطلوب</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="date"
                      value={formData.requested_date}
                      onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوقت المناسب</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="time"
                      value={formData.requested_time}
                      onChange={(e) => setFormData({ ...formData, requested_time: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العنوان / المنطقة في غدامس</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="مثال: غدامس - حي التونسية قرب المحطة"
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف العمل أو الخدمة المطلوبة *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اصف تفاصيل الخدمة التي تحتاج إليها بالتفصيل..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>تأكيد وإرسال الطلب</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
