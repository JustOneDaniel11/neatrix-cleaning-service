import { useState, useEffect } from "react";
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Home,
  Building,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useSupabaseData, Address as SupabaseAddress } from "../../contexts/SupabaseDataContext";
import { useRealtimeData } from "../../hooks/useRealtimeData";

// Using Address interface from SupabaseDataContext

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  joinDate: string;
}

interface Preferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  services: {
    preferredCleaner?: string;
    defaultPickupTime: string;
    specialInstructions: string;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareData: boolean;
  };
}

const ProfileSettings = () => {
  const { state, updateUser, createAddress, updateAddress, deleteAddress } = useSupabaseData();
  const { currentUser } = state;
  
  // Use realtime data for addresses
  const { data: allAddresses, loading: addressesLoading, error: addressesError } = useRealtimeData<SupabaseAddress>('addresses');
  
  // Filter addresses for current user
  const addresses = allAddresses.filter((address: any) => address.user_id === currentUser?.id);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SupabaseAddress | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // User profile data from context
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: currentUser?.id || '',
    firstName: currentUser?.full_name?.split(' ')[0] || '',
    lastName: currentUser?.full_name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    profilePhoto: undefined,
    joinDate: currentUser?.created_at || ''
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      setUserProfile({
        id: currentUser.id,
        firstName: currentUser.full_name?.split(' ')[0] || '',
        lastName: currentUser.full_name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email,
        phone: currentUser.phone || '',
        profilePhoto: undefined,
        joinDate: currentUser.created_at
      });
    }
  }, [currentUser]);

  // Mock preferences data
  const [preferences, setPreferences] = useState<Preferences>({
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    },
    services: {
      preferredCleaner: undefined,
      defaultPickupTime: '09:00',
      specialInstructions: 'Please handle delicate items with care'
    },
    privacy: {
      profileVisibility: 'private',
      shareData: false
    }
  });

  const [newAddress, setNewAddress] = useState<Omit<SupabaseAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Building },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleProfileSave = async () => {
    try {
      if (currentUser) {
        await updateUser(currentUser.id, {
          full_name: `${editedProfile.firstName} ${editedProfile.lastName}`,
          email: editedProfile.email,
          phone: editedProfile.phone
        });
        setIsEditing(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAddressSubmit = async () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, newAddress);
        setEditingAddress(null);
      } else {
        // Add new address
        if (currentUser) {
          await createAddress({
            ...newAddress,
            user_id: currentUser.id
          });
        }
      }

      // Reset form
      setNewAddress({
        type: 'home',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        is_default: false
      });
      setShowAddressForm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // First, set all addresses to not default
      for (const address of addresses) {
        if (address.is_default) {
          await updateAddress(address.id, { is_default: false });
        }
      }
      // Then set the selected address as default
      await updateAddress(addressId, { is_default: true });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const handleEditAddress = (address: SupabaseAddress) => {
    setNewAddress({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      is_default: address.is_default
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handlePreferencesSave = () => {
    // Here you would save to your backend
    console.log('Saving preferences:', preferences);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to your server/cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProfile(prev => ({
          ...prev,
          profilePhoto: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {(editedProfile.profilePhoto || userProfile.profilePhoto) ? (
                      <img
                        src={editedProfile.profilePhoto || userProfile.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {userProfile.firstName} {userProfile.lastName}
                  </h3>
                  <p className="text-gray-600">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.firstName : userProfile.firstName}
                    onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.lastName : userProfile.lastName}
                    onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      value={isEditing ? editedProfile.email : userProfile.email}
                      onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="tel"
                      value={isEditing ? editedProfile.phone : userProfile.phone}
                      onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleProfileSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(userProfile);
                    }}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Addresses List */}
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Saved</h3>
                  <p className="text-gray-600 mb-6">Add your addresses to make booking services easier</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => {
                    const AddressIcon = addressTypes.find(type => type.value === address.type)?.icon || MapPin;
                    return (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                        {address.is_default && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <AddressIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 capitalize">{address.type}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zip_code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex space-x-2">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add/Edit Address Form Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-medium text-gray-900">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h4>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({
                            type: 'home',
                            street: '',
                            city: '',
                            state: '',
                            zip_code: '',
                            is_default: false
                          });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Type
                        </label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {addressTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="123 Main St, Apt 4B"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="New York"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="NY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={newAddress.zip_code}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, zip_code: e.target.value }))}
                          placeholder="10001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            setNewAddress({
                              type: 'home',
                              street: '',
                              city: '',
                              state: '',
                              zip_code: '',
                              is_default: false
                            });
                          }}
                          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddressSubmit}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {editingAddress ? 'Update Address' : 'Add Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email notifications', description: 'Receive updates via email' },
                    { key: 'sms', label: 'SMS notifications', description: 'Receive text message updates' },
                    { key: 'push', label: 'Push notifications', description: 'Receive browser notifications' },
                    { key: 'marketing', label: 'Marketing emails', description: 'Receive promotional offers and news' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications[key as keyof typeof preferences.notifications]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Service Preferences</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Cleaner
                    </label>
                    <div className="relative">
                      <select
                        value={preferences.services.preferredCleaner || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            preferredCleaner: e.target.value || undefined
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No preference</option>
                        <option value="coming-soon" disabled>Coming Soon - Feature in Development</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      This feature is coming soon! You'll be able to select your preferred cleaner.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Pickup Time
                    </label>
                    <select
                      value={preferences.services.defaultPickupTime}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          defaultPickupTime: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={preferences.services.specialInstructions}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          specialInstructions: e.target.value
                        }
                      }))}
                      rows={3}
                      placeholder="Any special instructions for our team..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Control who can see your profile information</p>
                    </div>
                    <select
                      value={preferences.privacy.profileVisibility}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          profileVisibility: e.target.value as 'public' | 'private'
                        }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Share Usage Data</p>
                      <p className="text-sm text-gray-600">Help us improve our services by sharing anonymous usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.shareData}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            shareData: e.target.checked
                          }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreferencesSave}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;