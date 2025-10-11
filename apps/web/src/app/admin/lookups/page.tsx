"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  active: boolean;
}

interface Department {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  active: boolean;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: {
    permission: {
      id: number;
      key: string;
      description?: string;
    };
  }[];
}

interface Permission {
  id: number;
  key: string;
  description?: string;
}

export default function LookupsAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    active: true
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    active: true
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionKeys: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories from API
      try {
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.warn('Categories API not available, using default data');
        const defaultCategories = [
          { id: '1', name: 'التكنولوجيا', nameEn: 'Technology', description: 'أفكار تقنية ورقمية', active: true },
          { id: '2', name: 'الإبداع', nameEn: 'Innovation', description: 'أفكار إبداعية جديدة', active: true },
          { id: '3', name: 'التطوير', nameEn: 'Development', description: 'أفكار لتطوير العمليات', active: true },
          { id: '4', name: 'التحسين', nameEn: 'Improvement', description: 'أفكار لتحسين الخدمات', active: true },
          { id: '5', name: 'البيئة', nameEn: 'Environment', description: 'أفكار صديقة للبيئة', active: true }
        ];
        setCategories(defaultCategories);
      }

      // Load departments from API
      try {
        const departmentsResponse = await api.get('/departments');
        setDepartments(departmentsResponse.data);
      } catch (err) {
        console.warn('Departments API not available, using default data');
        const defaultDepartments = [
          { id: '1', name: 'تقنية المعلومات', nameEn: 'IT', description: 'قسم التقنية والبرمجة', active: true },
          { id: '2', name: 'الموارد البشرية', nameEn: 'HR', description: 'قسم الموارد البشرية', active: true },
          { id: '3', name: 'المالية', nameEn: 'Finance', description: 'القسم المالي والمحاسبة', active: true },
          { id: '4', name: 'التسويق', nameEn: 'Marketing', description: 'قسم التسويق والمبيعات', active: true },
          { id: '5', name: 'العمليات', nameEn: 'Operations', description: 'قسم العمليات والإنتاج', active: true }
        ];
        setDepartments(defaultDepartments);
      }

      // Load roles from API
      const rolesResponse = await api.get('/roles');
      setRoles(rolesResponse.data);

      // Load permissions
      const permissionsData = [
        { id: 1, key: 'manage_users', description: 'إدارة المستخدمين' },
        { id: 2, key: 'manage_ideas', description: 'إدارة الأفكار' },
        { id: 3, key: 'manage_stages', description: 'إدارة المراحل' },
        { id: 4, key: 'create_ideas', description: 'إنشاء الأفكار' },
        { id: 5, key: 'vote', description: 'التصويت' },
        { id: 6, key: 'comment', description: 'التعليق' },
        { id: 7, key: 'view_reports', description: 'عرض التقارير' },
        { id: 8, key: 'manage_lookups', description: 'إدارة البيانات الأساسية' }
      ];
      setPermissions(permissionsData);

    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update category via API
        try {
          await api.put(`/categories/${editingCategory.id}`, categoryForm);
          setSuccess('تم تحديث الفئة بنجاح');
        } catch (err) {
          // Fallback to local update if API fails
          const updatedCategories = categories.map(cat => 
            cat.id === editingCategory.id 
              ? { ...editingCategory, ...categoryForm }
              : cat
          );
          setCategories(updatedCategories);
          setSuccess('تم تحديث الفئة بنجاح (محلياً)');
        }
        setEditingCategory(null);
      } else {
        // Add new category via API
        try {
          const response = await api.post('/categories', categoryForm);
          setSuccess('تم إضافة الفئة بنجاح');
        } catch (err) {
          // Fallback to local add if API fails
          const newCategory = {
            id: Date.now().toString(),
            ...categoryForm
          };
          setCategories([...categories, newCategory]);
          setSuccess('تم إضافة الفئة بنجاح (محلياً)');
        }
      }
      
      setCategoryForm({ name: '', nameEn: '', description: '', active: true });
      setShowCategoryForm(false);
      loadData(); // Reload data
    } catch (err) {
      setError('حدث خطأ في حفظ الفئة');
    }
  };

  const handleDepartmentSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        // Update department via API
        try {
          await api.put(`/departments/${editingDepartment.id}`, departmentForm);
          setSuccess('تم تحديث القسم بنجاح');
        } catch (err) {
          // Fallback to local update if API fails
          const updatedDepartments = departments.map(dept => 
            dept.id === editingDepartment.id 
              ? { ...editingDepartment, ...departmentForm }
              : dept
          );
          setDepartments(updatedDepartments);
          setSuccess('تم تحديث القسم بنجاح (محلياً)');
        }
        setEditingDepartment(null);
      } else {
        // Add new department via API
        try {
          const response = await api.post('/departments', departmentForm);
          setSuccess('تم إضافة القسم بنجاح');
        } catch (err) {
          // Fallback to local add if API fails
          const newDepartment = {
            id: Date.now().toString(),
            ...departmentForm
          };
          setDepartments([...departments, newDepartment]);
          setSuccess('تم إضافة القسم بنجاح (محلياً)');
        }
      }
      
      setDepartmentForm({ name: '', nameEn: '', description: '', active: true });
      setShowDepartmentForm(false);
      loadData(); // Reload data
    } catch (err) {
      setError('حدث خطأ في حفظ القسم');
    }
  };

  const handleRoleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingRole) {
        // Update role via API
        await api.put(`/roles/${editingRole.id}`, roleForm);
        setSuccess('تم تحديث الدور بنجاح');
        setEditingRole(null);
      } else {
        // Add new role via API
        await api.post('/roles', roleForm);
        setSuccess('تم إضافة الدور بنجاح');
      }
      
      setRoleForm({ name: '', description: '', permissionKeys: [] });
      setShowRoleForm(false);
      loadData(); // Reload data
    } catch (err) {
      setError('حدث خطأ في حفظ الدور');
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      active: category.active
    });
    setShowCategoryForm(true);
  };

  const editDepartment = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name,
      nameEn: department.nameEn || '',
      description: department.description || '',
      active: department.active
    });
    setShowDepartmentForm(true);
  };

  const editRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissionKeys: role.permissions ? role.permissions.map(rp => rp.permission.key) : []
    });
    setShowRoleForm(true);
  };

  const deleteCategory = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      try {
        await api.delete(`/categories/${id}`);
        setSuccess('تم حذف الفئة بنجاح');
        loadData();
      } catch (err) {
        // Fallback to local delete if API fails
        setCategories(categories.filter(cat => cat.id !== id));
        setSuccess('تم حذف الفئة بنجاح (محلياً)');
      }
    }
  };

  const deleteDepartment = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        await api.delete(`/departments/${id}`);
        setSuccess('تم حذف القسم بنجاح');
        loadData();
      } catch (err) {
        // Fallback to local delete if API fails
        setDepartments(departments.filter(dept => dept.id !== id));
        setSuccess('تم حذف القسم بنجاح (محلياً)');
      }
    }
  };

  const deleteRole = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      try {
        await api.delete(`/roles/${id}`);
        setSuccess('تم حذف الدور بنجاح');
        loadData();
      } catch (err) {
        setError('حدث خطأ في حذف الدور');
      }
    }
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, active: !cat.active } : cat
    ));
  };

  const toggleDepartmentStatus = (id: string) => {
    setDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, active: !dept.active } : dept
    ));
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["admin"]}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">إدارة البيانات الأساسية</h1>
            <p className="text-gray-600 mt-1">إدارة الفئات والأقسام والأدوار والصلاحيات</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                فئات الأفكار
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الأقسام
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الأدوار
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الصلاحيات
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">فئات الأفكار</h2>
                  <button
                    onClick={() => {
                      setShowCategoryForm(true);
                      setEditingCategory(null);
                      setCategoryForm({ name: '', nameEn: '', description: '', active: true });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    إضافة فئة جديدة
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم الفئة (بالعربية) *
                          </label>
                          <input
                            type="text"
                            required
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="أدخل اسم الفئة"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم الفئة (بالإنجليزية)
                          </label>
                          <input
                            type="text"
                            value={categoryForm.nameEn}
                            onChange={(e) => setCategoryForm({...categoryForm, nameEn: e.target.value})}
                            placeholder="Enter category name in English"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الوصف
                        </label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          rows={3}
                          placeholder="أدخل وصف الفئة"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="categoryActive"
                          checked={categoryForm.active}
                          onChange={(e) => setCategoryForm({...categoryForm, active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="categoryActive" className="mr-2 block text-sm text-gray-900">
                          فعال
                        </label>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          {editingCategory ? 'تحديث' : 'إضافة'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryForm(false);
                            setEditingCategory(null);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم الإنجليزي
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.nameEn}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {category.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleCategoryStatus(category.id)}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                category.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {category.active ? 'فعال' : 'غير فعال'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => editCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900 ml-3"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">الأقسام</h2>
                  <button
                    onClick={() => {
                      setShowDepartmentForm(true);
                      setEditingDepartment(null);
                      setDepartmentForm({ name: '', nameEn: '', description: '', active: true });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    إضافة قسم جديد
                  </button>
                </div>

                {showDepartmentForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {editingDepartment ? 'تعديل القسم' : 'إضافة قسم جديد'}
                    </h3>
                    <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم القسم (بالعربية) *
                          </label>
                          <input
                            type="text"
                            required
                            value={departmentForm.name}
                            onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                            placeholder="أدخل اسم القسم"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم القسم (بالإنجليزية)
                          </label>
                          <input
                            type="text"
                            value={departmentForm.nameEn}
                            onChange={(e) => setDepartmentForm({...departmentForm, nameEn: e.target.value})}
                            placeholder="Enter department name in English"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الوصف
                        </label>
                        <textarea
                          value={departmentForm.description}
                          onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                          rows={3}
                          placeholder="أدخل وصف القسم"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="departmentActive"
                          checked={departmentForm.active}
                          onChange={(e) => setDepartmentForm({...departmentForm, active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="departmentActive" className="mr-2 block text-sm text-gray-900">
                          فعال
                        </label>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          {editingDepartment ? 'تحديث' : 'إضافة'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDepartmentForm(false);
                            setEditingDepartment(null);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم الإنجليزي
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((department) => (
                        <tr key={department.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {department.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {department.nameEn}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {department.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleDepartmentStatus(department.id)}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                department.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {department.active ? 'فعال' : 'غير فعال'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => editDepartment(department)}
                              className="text-indigo-600 hover:text-indigo-900 ml-3"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => deleteDepartment(department.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">الأدوار</h2>
                  <button
                    onClick={() => {
                      setShowRoleForm(true);
                      setEditingRole(null);
                      setRoleForm({ name: '', description: '', permissionKeys: [] });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    إضافة دور جديد
                  </button>
                </div>

                {showRoleForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
                    </h3>
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الدور *
                        </label>
                        <input
                          type="text"
                          required
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                          placeholder="أدخل اسم الدور"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الوصف
                        </label>
                        <textarea
                          value={roleForm.description}
                          onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                          rows={3}
                          placeholder="أدخل وصف الدور"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الصلاحيات
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`permission-${permission.id}`}
                                checked={roleForm.permissionKeys.includes(permission.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRoleForm({
                                      ...roleForm,
                                      permissionKeys: [...roleForm.permissionKeys, permission.key]
                                    });
                                  } else {
                                    setRoleForm({
                                      ...roleForm,
                                      permissionKeys: roleForm.permissionKeys.filter(key => key !== permission.key)
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`permission-${permission.id}`} className="mr-2 block text-sm text-gray-900">
                                {permission.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          {editingRole ? 'تحديث' : 'إضافة'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleForm(false);
                            setEditingRole(null);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الصلاحيات
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {role.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {role.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {role.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions && role.permissions.length > 0 ? (
                                role.permissions.map((rp, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {permissions.find(p => p.key === rp.permission.key)?.description || rp.permission.key}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">لا توجد صلاحيات</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => editRole(role)}
                              className="text-indigo-600 hover:text-indigo-900 ml-3"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => deleteRole(role.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">الصلاحيات</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المفتاح
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.map((permission) => (
                        <tr key={permission.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {permission.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {permission.key}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {permission.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}