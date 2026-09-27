import React from 'react';
import CategoryCard from '../components/CategoryCard';

export default function CategoriesPage({ categories, onNavigate }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="bg-orange-100 text-primary-700 text-xs font-extrabold px-3 py-1 rounded-full">
          جميع الخدمات والمجالات
        </span>
        <h1 className="text-3xl font-black text-slate-900">تصنيفات خدمات غدامس وليبيا</h1>
        <p className="text-sm text-slate-500">اختر المجال الذي تريد التصفح فيه لاكتشاف المهن والشركات المعتمدة</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={(c) => onNavigate('search', { category_id: c.id })}
          />
        ))}
      </div>

    </div>
  );
}
