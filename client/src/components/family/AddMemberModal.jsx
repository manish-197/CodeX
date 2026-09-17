import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';

export default function AddMemberModal({ isOpen, onClose, onAddMember }) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Father');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [medicalHistory, setMedicalHistory] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    onAddMember({
      name,
      relation,
      age: Number(age) || undefined,
      gender,
      bloodGroup,
      medicalHistory: medicalHistory ? medicalHistory.split(',').map(s => s.trim()) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md glass-card p-6 relative shadow-2xl bg-white/95 dark:bg-dark-card/95"
        data-lenis-prevent="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-deep-teal/10 text-deep-teal dark:text-sky-mist"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-2xl bg-leaf-green text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist">
            Add Family Member
          </h3>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            Registers under your household ABHA digital health hub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shakuntala Patil"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none focus:border-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Relation
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
              >
                <option value="Father">Father / वडील</option>
                <option value="Mother">Mother / आई</option>
                <option value="Grandfather">Grandfather / आजोबा</option>
                <option value="Grandmother">Grandmother / आजी</option>
                <option value="Spouse">Spouse / पती-पत्नी</option>
                <option value="Child">Child / मूल</option>
                <option value="Other">Other / इतर</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
              Known Medical Conditions (comma separated)
            </label>
            <input
              type="text"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Hypertension, Type 2 Diabetes"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-terracotta py-2.5 text-xs font-bold mt-2"
          >
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}
