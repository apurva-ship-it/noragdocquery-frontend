import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState } from 'react';
import * as yup from 'yup';
import { WizardContext } from '../context/WizardContext';
const BRAND_MAX = 30;
const categoryOptions = ['Analgesic', 'Antibiotic', 'Vaccine'];
const productTypeOptions = ['OTC', 'Prescription', 'Supplement'];
const schema = yup.object().shape({
    brand: yup
        .string()
        .required('Brand is required')
        .max(BRAND_MAX, `Brand must be at most ${BRAND_MAX} characters`),
    category: yup
        .string()
        .oneOf(categoryOptions, 'Invalid category')
        .required('Category is required'),
    productType: yup
        .string()
        .oneOf(productTypeOptions, 'Invalid product type')
        .required('Product type is required'),
});
const inputBase = 'mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputNormal = `${inputBase} border-gray-300`;
const inputError = `${inputBase} border-red-500 bg-red-50`;
const InputForm = ({ onSubmit }) => {
    const wizard = useContext(WizardContext);
    const [values, setValues] = useState({ brand: '', category: '', productType: '' });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'brand' && value.length > BRAND_MAX)
            return;
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };
    const validate = async () => {
        try {
            await schema.validate(values, { abortEarly: false });
            setErrors({});
            return true;
        }
        catch (err) {
            if (err instanceof yup.ValidationError) {
                const next = {};
                err.inner.forEach((e) => {
                    if (e.path)
                        next[e.path] = e.message;
                });
                setErrors(next);
            }
            return false;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = await validate();
        if (!isValid)
            return;
        if (wizard) {
            wizard.setData('inputForm', values);
            wizard.setStep(wizard.step + 1);
        }
        onSubmit?.(values);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-4 max-w-md mx-auto p-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "brand", className: "block text-sm font-medium text-gray-700 mb-1", children: "Brand" }), _jsx("input", { type: "text", id: "brand", name: "brand", value: values.brand, onChange: handleChange, maxLength: BRAND_MAX, "aria-describedby": errors.brand ? 'brand-error' : undefined, "aria-invalid": !!errors.brand, className: errors.brand ? inputError : inputNormal }), _jsxs("div", { className: "flex justify-between mt-1", children: [errors.brand ? (_jsx("p", { id: "brand-error", role: "alert", className: "text-sm text-red-600", children: errors.brand })) : (_jsx("span", {})), _jsxs("span", { className: "text-xs text-gray-400", children: [values.brand.length, "/", BRAND_MAX] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "category", className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }), _jsxs("select", { id: "category", name: "category", value: values.category, onChange: handleChange, "aria-describedby": errors.category ? 'category-error' : undefined, "aria-invalid": !!errors.category, className: errors.category ? inputError : inputNormal, children: [_jsx("option", { value: "", children: "Select category" }), categoryOptions.map((opt) => (_jsx("option", { value: opt, children: opt }, opt)))] }), errors.category && (_jsx("p", { id: "category-error", role: "alert", className: "mt-1 text-sm text-red-600", children: errors.category }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "productType", className: "block text-sm font-medium text-gray-700 mb-1", children: "Product Type" }), _jsxs("select", { id: "productType", name: "productType", value: values.productType, onChange: handleChange, "aria-describedby": errors.productType ? 'productType-error' : undefined, "aria-invalid": !!errors.productType, className: errors.productType ? inputError : inputNormal, children: [_jsx("option", { value: "", children: "Select product type" }), productTypeOptions.map((opt) => (_jsx("option", { value: opt, children: opt }, opt)))] }), errors.productType && (_jsx("p", { id: "productType-error", role: "alert", className: "mt-1 text-sm text-red-600", children: errors.productType }))] }), _jsx("div", { children: _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "Submit" }) })] }));
};
export default InputForm;
