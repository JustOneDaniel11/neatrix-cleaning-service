import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { formatCurrency, formatDate } from '../../contexts/SupabaseDataContext';
import { 
  Calendar, 
  CreditCard, 
  Settings, 
  Pause, 
  Play, 
  X, 
  Plus,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SubscriptionManagementProps {
  className?: string;
}

export default function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const { 
    state, 
    fetchSubscriptionPlans, 
    fetchUserSubscriptions, 
    fetchSubscriptionBilling,
    fetchSubscriptionCustomizations,
    createUserSubscription,
    updateUserSubscription,
    cancelUserSubscription,
    createSubscriptionCustomization,
    updateSubscriptionCustomization
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'billing' | 'customize'>('overview');
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [customization, setCustomization] = useState({
    custom_frequency_days: '',
    preferred_service_days: [] as string[],
    special_instructions: '',
    custom_pricing: ''
  });

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchUserSubscriptions();
    fetchSubscriptionBilling();
    fetchSubscriptionCustomizations();
  }, []);

  const activeSubscription = state.userSubscriptions.find(sub => sub.status === 'active');
  const currentCustomization = state.subscriptionCustomizations.find(
    custom => custom.subscription_id === activeSubscription?.id
  );

  const handleSubscribeToPlan = async (planId: string) => {
    try {
      const plan = state.subscriptionPlans.find(p => p.id === planId);
      if (!plan) return;

      const now = new Date();
      const nextBilling = new Date(now);
      
      // Calculate next billing date based on cycle
      switch (plan.billing_cycle) {
        case 'weekly':
          nextBilling.setDate(now.getDate() + 7);
          break;
        case 'bi_weekly':
          nextBilling.setDate(now.getDate() + 14);
          break;
        case 'monthly':
          nextBilling.setMonth(now.getMonth() + 1);
          break;
        case 'custom':
          const customDays = parseInt(customization.custom_frequency_days) || 30;
          nextBilling.setDate(now.getDate() + customDays);
          break;
      }

      const cycleEnd = new Date(nextBilling);
      cycleEnd.setDate(cycleEnd.getDate() - 1);

      await createUserSubscription({
        plan_id: planId,
        status: 'active',
        start_date: now.toISOString(),
        next_billing_date: nextBilling.toISOString(),
        auto_renew: true,
        services_used_this_cycle: 0,
        current_cycle_start: now.toISOString(),
        current_cycle_end: cycleEnd.toISOString()
      });

      // Create customization if provided
      if (plan.billing_cycle === 'custom' && (
        customization.custom_frequency_days ||
        customization.preferred_service_days.length > 0 ||
        customization.special_instructions ||
        customization.custom_pricing
      )) {
        const newSubscription = state.userSubscriptions[state.userSubscriptions.length - 1];
        await createSubscriptionCustomization({
          subscription_id: newSubscription.id,
          custom_frequency_days: customization.custom_frequency_days ? parseInt(customization.custom_frequency_days) : undefined,
          preferred_service_days: customization.preferred_service_days,
          special_instructions: customization.special_instructions || undefined,
          custom_pricing: customization.custom_pricing ? parseFloat(customization.custom_pricing) : undefined
        });
      }

      setShowPlanSelector(false);
      setSelectedPlan('');
      setCustomization({
        custom_frequency_days: '',
        preferred_service_days: [],
        special_instructions: '',
        custom_pricing: ''
      });
    } catch (error) {
      console.error('Error subscribing to plan:', error);
    }
  };

  const handlePauseSubscription = async () => {
    if (!activeSubscription) return;
    await updateUserSubscription(activeSubscription.id, { status: 'paused' });
  };

  const handleResumeSubscription = async () => {
    if (!activeSubscription) return;
    await updateUserSubscription(activeSubscription.id, { status: 'active' });
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;
    await cancelUserSubscription(activeSubscription.id);
  };

  const handleUpdateCustomization = async () => {
    if (!activeSubscription || !currentCustomization) return;

    await updateSubscriptionCustomization(currentCustomization.id, {
      custom_frequency_days: customization.custom_frequency_days ? parseInt(customization.custom_frequency_days) : undefined,
      preferred_service_days: customization.preferred_service_days,
      special_instructions: customization.special_instructions || undefined,
      custom_pricing: customization.custom_pricing ? parseFloat(customization.custom_pricing) : undefined
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {activeSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Subscription</span>
              <Badge className={getStatusColor(activeSubscription.status)}>
                {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Plan</Label>
                <p className="text-lg font-semibold">{activeSubscription.plan?.name}</p>
                <p className="text-sm text-gray-600">{activeSubscription.plan?.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Next Billing</Label>
                <p className="text-lg font-semibold flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(activeSubscription.next_billing_date)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Services Used This Cycle</Label>
                <p className="text-lg font-semibold">
                  {activeSubscription.services_used_this_cycle} / {activeSubscription.plan?.max_services_per_cycle}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Auto Renew</Label>
                <p className="text-lg font-semibold flex items-center">
                  {activeSubscription.auto_renew ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Enabled</>
                  ) : (
                    <><AlertCircle className="w-4 h-4 mr-2 text-yellow-600" /> Disabled</>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              {activeSubscription.status === 'active' ? (
                <Button variant="outline" onClick={handlePauseSubscription}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Subscription
                </Button>
              ) : activeSubscription.status === 'paused' ? (
                <Button onClick={handleResumeSubscription}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume Subscription
                </Button>
              ) : null}
              
              <Button variant="outline" onClick={() => setActiveTab('customize')}>
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              
              <Button variant="destructive" onClick={handleCancelSubscription}>
                <X className="w-4 h-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">Subscribe to a plan to enjoy regular cleaning services with great savings!</p>
            <Button onClick={() => setShowPlanSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Choose a Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing</CardTitle>
        </CardHeader>
        <CardContent>
          {state.subscriptionBilling.length > 0 ? (
            <div className="space-y-3">
              {state.subscriptionBilling.slice(0, 3).map((billing) => (
                <div key={billing.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">{formatCurrency(billing.amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(billing.billing_date)}</p>
                    </div>
                  </div>
                  <Badge className={getBillingStatusColor(billing.status)}>
                    {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No billing history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPlans = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {state.subscriptionPlans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.billing_cycle === 'monthly' ? 'ring-2 ring-blue-500' : ''}`}>
          {plan.billing_cycle === 'monthly' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white">Most Popular</Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              {formatCurrency(plan.base_price)}
              <span className="text-sm font-normal text-gray-600">/{plan.billing_cycle.replace('_', ' ')}</span>
            </div>
            <p className="text-gray-600">{plan.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Features:</Label>
              <ul className="mt-2 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Up to {plan.max_services_per_cycle} services per cycle</p>
              {plan.discount_percentage > 0 && (
                <p className="text-green-600 font-medium">
                  {plan.discount_percentage}% discount on additional services
                </p>
              )}
            </div>

            {plan.billing_cycle === 'custom' && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Customize Your Plan</Label>
                <div>
                  <Label htmlFor="frequency" className="text-xs">Frequency (days)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    placeholder="e.g., 30"
                    value={customization.custom_frequency_days}
                    onChange={(e) => setCustomization(prev => ({ ...prev, custom_frequency_days: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Preferred Service Days</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <label key={day} className="flex items-center text-xs">
                        <Checkbox
                          checked={customization.preferred_service_days.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCustomization(prev => ({
                                ...prev,
                                preferred_service_days: [...prev.preferred_service_days, day]
                              }));
                            } else {
                              setCustomization(prev => ({
                                ...prev,
                                preferred_service_days: prev.preferred_service_days.filter(d => d !== day)
                              }));
                            }
                          }}
                        />
                        <span className="ml-1">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={() => handleSubscribeToPlan(plan.id)}
              disabled={!!activeSubscription}
            >
              {activeSubscription ? 'Already Subscribed' : 'Choose This Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {state.subscriptionBilling.length > 0 ? (
            <div className="space-y-3">
              {state.subscriptionBilling.map((billing) => (
                <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(billing.amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(billing.billing_date)}</p>
                      {billing.payment_method && (
                        <p className="text-xs text-gray-500">via {billing.payment_method}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getBillingStatusColor(billing.status)}>
                      {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                    </Badge>
                    {billing.invoice_url && (
                      <Button variant="link" size="sm" className="mt-1">
                        View Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No billing history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomize = () => (
    <div className="space-y-6">
      {activeSubscription && currentCustomization ? (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom-frequency">Custom Frequency (days)</Label>
              <Input
                id="custom-frequency"
                type="number"
                placeholder="e.g., 30"
                value={customization.custom_frequency_days}
                onChange={(e) => setCustomization(prev => ({ ...prev, custom_frequency_days: e.target.value }))}
              />
            </div>

            <div>
              <Label>Preferred Service Days</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center">
                    <Checkbox
                      checked={customization.preferred_service_days.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCustomization(prev => ({
                            ...prev,
                            preferred_service_days: [...prev.preferred_service_days, day]
                          }));
                        } else {
                          setCustomization(prev => ({
                            ...prev,
                            preferred_service_days: prev.preferred_service_days.filter(d => d !== day)
                          }));
                        }
                      }}
                    />
                    <span className="ml-2">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                placeholder="Any special requests or instructions for your cleaning service..."
                value={customization.special_instructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="custom-pricing">Custom Pricing (if applicable)</Label>
              <Input
                id="custom-pricing"
                type="number"
                step="0.01"
                placeholder="Custom price per service"
                value={customization.custom_pricing}
                onChange={(e) => setCustomization(prev => ({ ...prev, custom_pricing: e.target.value }))}
              />
            </div>

            <Button onClick={handleUpdateCustomization} className="w-full">
              Update Customization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">You need an active subscription to customize your plan.</p>
            <Button onClick={() => setActiveTab('plans')}>
              View Available Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Subscription Management</h2>
        <p className="text-gray-600">Manage your cleaning service subscriptions and billing</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'plans', label: 'Plans' },
          { id: 'billing', label: 'Billing' },
          { id: 'customize', label: 'Customize' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'plans' && renderPlans()}
      {activeTab === 'billing' && renderBilling()}
      {activeTab === 'customize' && renderCustomize()}
    </div>
  );
}