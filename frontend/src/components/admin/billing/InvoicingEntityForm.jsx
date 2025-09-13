import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../ui/Button';

export default function InvoicingEntityForm({ initialValue, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({
    name: '',
    tax_id: '',
    tax_system_code: '',
    email: '',
    phone: '',
    address_json: '',
    is_default: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValue) {
      setValues({
        name: initialValue.name || '',
        tax_id: initialValue.tax_id || '',
        tax_system_code: initialValue.tax_system_code || '',
        email: initialValue.email || '',
        phone: initialValue.phone || '',
        address_json: initialValue.address_json ? JSON.stringify(initialValue.address_json) : '',
        is_default: Number(initialValue.is_default || 0),
      });
    }
  }, [initialValue]);

  const validate = () => {
    const next = {};
    if (!values.name || values.name.trim().length === 0) next.name = 'Name is required';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Invalid email';
    if (values.address_json) {
      try { JSON.parse(values.address_json); } catch { next.address_json = 'Invalid JSON'; }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: values.name.trim(),
      tax_id: values.tax_id || null,
      tax_system_code: values.tax_system_code || null,
      email: values.email || null,
      phone: values.phone || null,
      address_json: values.address_json ? JSON.parse(values.address_json) : null,
      is_default: Number(values.is_default) || 0,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm">Name *</label>
        <input name="name" value={values.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Tax ID</label>
          <input name="tax_id" value={values.tax_id} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Tax System Code</label>
          <input name="tax_system_code" value={values.tax_system_code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" value={values.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input name="phone" value={values.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm">Address JSON</label>
        <textarea name="address_json" value={values.address_json} onChange={handleChange} rows={4} className="w-full border rounded px-3 py-2" />
        {errors.address_json && <div className="text-red-600 text-sm mt-1">{errors.address_json}</div>}
      </div>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="is_default" checked={Number(values.is_default) === 1} onChange={handleChange} />
        <span>Default emitter</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}


