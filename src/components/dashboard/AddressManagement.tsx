import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus, X } from "lucide-react";

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  addresses: Address[];
  onSetDefault: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
  onAddAddress: (address: Address) => void;
  onEditAddress: (address: Address) => void;
}

const AddressManagement = ({
  addresses,
  onSetDefault,
  onDeleteAddress,
  onAddAddress,
  onEditAddress
}: AddressManagementProps) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: '',
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      id: address.id,
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setIsEditingAddress(true);
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    const addressData = {
      ...addressForm,
      id: isEditingAddress ? addressForm.id : Date.now().toString()
    };

    if (isEditingAddress) {
      onEditAddress(addressData);
    } else {
      onAddAddress(addressData);
    }

    setShowAddressModal(false);
    setIsEditingAddress(false);
    setAddressForm({
      id: '',
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    alert(`Address ${isEditingAddress ? 'updated' : 'added'} successfully!`);
  };

  const resetForm = () => {
    setAddressForm({
      id: '',
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    setIsEditingAddress(false);
    setShowAddressModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Addresses</h2>
        <button
          onClick={() => setShowAddressModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium capitalize">
                      {address.type} Address
                      {address.isDefault && (
                        <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {address.street}<br />
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => onSetDefault(address.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteAddress(address.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="New York"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="defaultAddress"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="defaultAddress" className="text-sm">Set as default address</label>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isEditingAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;