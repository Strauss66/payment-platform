import React, { useEffect, useState } from 'react';
import Button from '../../ui/Button';

export default function CashRegisterForm({ initialValue, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({
    name: '',
    location: '',
    is_active: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValue) {
      setValues({
        name: initialValue.name || '',
        location: initialValue.location || '',
        is_active: Number(initialValue.is_active || 0),
      });
    }
  }, [initialValue]);

  const validate = () => {
    const next = {};
    if (!values.name || values.name.trim().length === 0) next.name = 'Name is required';
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
      location: values.location || null,
      is_active: Number(values.is_active) || 0,
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
      <div>
        <label className="block text-sm">Location</label>
        <input name="location" value={values.location} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="is_active" checked={Number(values.is_active) === 1} onChange={handleChange} />
        <span>Active</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}


