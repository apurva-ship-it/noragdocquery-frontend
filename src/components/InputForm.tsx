import React, { useState, ChangeEvent, FormEvent } from 'react';
import * as yup from 'yup';

interface FormValues {
  brand: string;
  category: string;
  productType: string;
}

const categoryOptions = ['Analgesic', 'Antibiotic', 'Vaccine'];
const productTypeOptions = ['OTC', 'Prescription', 'Supplement'];

const schema = yup.object().shape({
  brand: yup.string().required('Brand is required').max(30, 'Brand must be at most 30 characters'),
  category: yup.string().oneOf(categoryOptions, 'Invalid category').required('Category is required'),
  productType: yup.string().oneOf(productTypeOptions, 'Invalid product type').required('Product type is required'),
});

const InputForm: React.FC = () => {
  const [values, setValues] = useState<FormValues>({ brand: '', category: '', productType: '' });
  const [errors, setErrors] = useState<Partial<FormValues>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'brand' && value.length > 30) return; // block beyond limit
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = async (): Promise<boolean> => {
    try {
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Partial<FormValues> = {};
        err.inner.forEach((e) => {
          if (e.path) newErrors[e.path as keyof FormValues] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isValid = await validate();
    if (isValid) {
      // TODO: replace with actual submit logic
      console.log('Submitted values:', values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={values.brand}
          onChange={handleChange}
          maxLength={30}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          {categoryOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
          Product Type
        </label>
        <select
          id="productType"
          name="productType"
          value={values.productType}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select product type</option>
          {productTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.productType && <p className="mt-1 text-sm text-red-600">{errors.productType}</p>}
      </div>

      <div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default InputForm;
