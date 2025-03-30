'use client';

import React from 'react';
import { useKYC } from '@/contexts/KYCContext';
import { toast } from 'react-hot-toast';
import { useForm } from '@/utils/formUtils';

// Step components
const PersonalInfoStep: React.FC = () => {
  const { formData, setFormData } = useKYC();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ fullName: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ dateOfBirth: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={(e) => setFormData({ nationality: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ phoneNumber: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
      </div>
    </div>
  );
};

const AddressInfoStep: React.FC = () => {
  const { formData, setFormData } = useKYC();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-decode-white mb-1">
          Street Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={(e) => setFormData({ address: e.target.value })}
          required
          className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ city: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ country: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ postalCode: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
      </div>
    </div>
  );
};

const IdentityDocumentsStep: React.FC = () => {
  const { formData, setFormData, uploadDocument } = useKYC();
  const { formState, setFormError, setFormSuccess } = useForm({ dummy: '' });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof typeof formData
  ) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const fileHash = await uploadDocument(fieldName, e.target.files[0]);
        setFormData({ [fieldName]: fileHash } as any);
        toast.success(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`);
      } catch (error) {
        toast.error('Failed to upload document');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            ID Type
          </label>
          <select
            value={formData.idType}
            name="idType"
            onChange={(e) => setFormData({ idType: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          >
            <option value="">Select ID Type</option>
            <option value="national_id">National ID</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-decode-white mb-1">
            ID Number
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={(e) => setFormData({ idNumber: e.target.value })}
            required
            className="w-full px-3 py-2 border border-decode-green/20 bg-decode-black/20 rounded-md shadow-sm focus:outline-none focus:ring-decode-green focus:border-decode-green"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-decode-white mb-1">
          Government-issued ID Document
        </label>
        <div className="mt-1 flex items-center">
          <label
            className={`cursor-pointer w-full flex justify-center px-4 py-2 border border-dashed ${formData.idDocumentHash
                ? 'border-decode-green/50 bg-decode-green/10'
                : 'border-gray-500/30 hover:border-decode-green/30'
              } rounded-md`}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-400">
                <span className="text-decode-green">
                  {formData.idDocumentHash ? 'Document Uploaded' : 'Upload ID Document'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
            <input
              name="idDocument"
              type="file"
              className="sr-only"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => handleFileUpload(e, 'idDocumentHash')}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-decode-white mb-1">
          Proof of Address
        </label>
        <div className="mt-1 flex items-center">
          <label
            className={`cursor-pointer w-full flex justify-center px-4 py-2 border border-dashed ${formData.proofOfAddressHash
                ? 'border-decode-green/50 bg-decode-green/10'
                : 'border-gray-500/30 hover:border-decode-green/30'
              } rounded-md`}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-400">
                <span className="text-decode-green">
                  {formData.proofOfAddressHash ? 'Document Uploaded' : 'Upload Proof of Address'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Utility bill, bank statement (last 3 months)
              </p>
            </div>
            <input
              name="proofOfAddress"
              type="file"
              className="sr-only"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => handleFileUpload(e, 'proofOfAddressHash')}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-decode-white mb-1">
          Selfie with ID
        </label>
        <div className="mt-1 flex items-center">
          <label
            className={`cursor-pointer w-full flex justify-center px-4 py-2 border border-dashed ${formData.selfieHash
                ? 'border-decode-green/50 bg-decode-green/10'
                : 'border-gray-500/30 hover:border-decode-green/30'
              } rounded-md`}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-400">
                <span className="text-decode-green">
                  {formData.selfieHash ? 'Selfie Uploaded' : 'Upload Selfie with ID'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Clear photo of yourself holding your ID
              </p>
            </div>
            <input
              name="selfie"
              type="file"
              className="sr-only"
              accept=".png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e, 'selfieHash')}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * KYC Form component
 */
const KYCForm: React.FC = () => {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    submitKYC,
    isLoading,
    isSubmitting,
    error
  } = useKYC();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === totalSteps) {
      // Final step - submit the KYC data
      await submitKYC();
    } else {
      // Move to the next step
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <AddressInfoStep />;
      case 3:
        return <IdentityDocumentsStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center text-sm ${index + 1 === currentStep
                      ? 'bg-decode-green text-decode-black font-medium'
                      : index + 1 < currentStep
                        ? 'bg-decode-green/20 text-decode-green'
                        : 'bg-gray-700/30 text-gray-500'
                    }`}
                >
                  {index + 1 < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-12 h-0.5 ${index + 1 < currentStep ? 'bg-decode-green/50' : 'bg-gray-700/30'
                      }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-sm text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <h2 className="text-xl font-bold mb-6 text-decode-white">
          {currentStep === 1 ? 'Personal Information' :
            currentStep === 2 ? 'Address Information' :
              'Identity Documents'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || isLoading}
            className={`px-4 py-2 rounded-md border border-decode-green/50 text-decode-green hover:bg-decode-green/10 disabled:opacity-50 disabled:cursor-not-allowed ${currentStep === 1 ? 'invisible' : ''
              }`}
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="px-6 py-2 bg-decode-green text-decode-black font-medium rounded-md hover:bg-decode-green/90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-decode-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : currentStep === totalSteps ? (
              'Submit Verification'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCForm;
