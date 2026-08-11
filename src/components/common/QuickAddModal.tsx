import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './FormControls';
import { erpService } from '../../services/storage';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'wholesaler' | 'tailor' | 'employee';
  onSuccess: (newId: string) => void;
  showToast: (msg: string) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
  showToast
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: '',
    specialization: '',
    ratePerPiece: '45',
    designation: 'Staff',
    baseSalary: '20000',
    joiningDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (type === 'wholesaler') {
        const ws = erpService.addWholesaler({
          name: formData.name,
          phone: formData.phone || '-',
          address: formData.address || '-',
          gstNumber: formData.gstNumber
        });
        showToast(`Wholesaler "${ws.name}" added`);
        onSuccess(ws.id);
      } else if (type === 'tailor') {
        const tailor = erpService.addTailor({
          name: formData.name,
          phone: formData.phone || '-',
          specialization: formData.specialization || 'General Stitching',
          ratePerPiece: Number(formData.ratePerPiece || 45)
        });
        showToast(`Tailor "${tailor.name}" added`);
        onSuccess(tailor.id);
      } else if (type === 'employee') {
        const emp = erpService.addEmployee({
          name: formData.name,
          phone: formData.phone || '-',
          designation: formData.designation || 'Worker',
          baseSalary: Number(formData.baseSalary || 20000),
          joiningDate: formData.joiningDate
        });
        showToast(`Employee "${emp.name}" added`);
        onSuccess(emp.id);
      }
      setFormData({
        name: '',
        phone: '',
        address: '',
        gstNumber: '',
        specialization: '',
        ratePerPiece: '45',
        designation: 'Staff',
        baseSalary: '20000',
        joiningDate: new Date().toISOString().split('T')[0]
      });
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  };

  const titles = {
    wholesaler: 'Quick Add Wholesaler',
    tailor: 'Quick Add Tailor',
    employee: 'Quick Add Employee'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[type]}
      subtitle="Add master record quickly without leaving this form."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            Save & Select
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}
        
        <InputField
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={type === 'wholesaler' ? 'e.g. Surat Cloth Mills' : 'e.g. Ramesh Kumar'}
        />

        <InputField
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+91 98765 43210"
        />

        {type === 'wholesaler' && (
          <>
            <InputField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Market / City"
            />
            <InputField
              label="GST Number (Optional)"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="24AAAAA0000A1Z5"
            />
          </>
        )}

        {type === 'tailor' && (
          <>
            <InputField
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Shirts & Trousers"
            />
            <InputField
              label="Standard Rate Per Piece"
              type="number"
              unit="₹"
              value={formData.ratePerPiece}
              onChange={(e) => setFormData({ ...formData, ratePerPiece: e.target.value })}
            />
          </>
        )}

        {type === 'employee' && (
          <>
            <InputField
              label="Designation / Role"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Packing Inspector"
            />
            <InputField
              label="Monthly Base Salary"
              type="number"
              unit="₹"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            />
          </>
        )}
      </form>
    </Modal>
  );
};
