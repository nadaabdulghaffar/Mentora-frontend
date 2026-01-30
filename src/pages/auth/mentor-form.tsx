import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bgImage from "../../assets/images/bg.png"
import {
  FormCard,
  StepProgress,
  StepTitle,
  StepSubtitle,
  InputGroup,
  SelectField,
  TextAreaField,
  FormNavigation,
  type Option,
  SelectWithTags,
} from "../../components/MultiStepForm"
import { Alert } from "../../components/Alert"
import { 
  validateLinkedInUrl, 
  validateBio, 
  validateCVFile,
  validateMentorProfileForm 
} from "../../utils/validation"

interface MentorFormData {
  expertise: string[]
  industry: string
  experience: string
  availability: string
  mentees: string
  linkedinUrl: string
  relevantExpertise: string[]
  tools: string[]
  bio: string
  cvFiles: File[]
}

function MentorForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MentorFormData>({
    expertise: [],
    industry: '',
    experience: '',
    bio: '',
    availability: '',
    mentees: '',
    linkedinUrl: '',
    relevantExpertise: [],
    tools: [],
    cvFiles: [],
  })

  const [linkedinError, setLinkedinError] = useState('')
  const [cvError, setCvError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const totalSteps = 4

  const industryOptions: Option[] = [
    { label: 'Technology', value: 'tech' },
    { label: 'Finance', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'Consulting', value: 'consulting' },
    { label: 'Other', value: 'other' },
  ]

  const experienceOptions: Option[] = [
    { label: '2-5 years', value: '2-5' },
    { label: '5-10 years', value: '5-10' },
    { label: '10-15 years', value: '10-15' },
    { label: '15+ years', value: '15plus' },
  ]

   const relevantExpertiseOptions = [
    'Graphic Design',
    'Product Management',
    'User Experience',
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'Mobile Development',
    'Data Analysis',
  ]

  const toolsOptions = [
    'Figma',
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'SQL',
    'Git',
    'AWS',
    'Docker',
  ]

const handleToolsToggle = (tool: string) => {
  setFormData((prev) => ({
    ...prev,
    tools: prev.tools.includes(tool)
      ? prev.tools.filter((t) => t !== tool)
      : [...prev.tools, tool],
  }))
}


const handleLinkedInChange = (value: string) => {
    setFormData({ ...formData, linkedinUrl: value })
    
    if (value) {
      const validation = validateLinkedInUrl(value)
      if (!validation.valid) {
        setLinkedinError(validation.message || 'Invalid LinkedIn URL format')
      } else {
        setLinkedinError('')
      }
    } else {
      setLinkedinError('')
    }
  }

  const handleNext = () => {
    setGeneralError('')
    setFieldErrors({})

    // Validate based on current step
    if (currentStep === 1) {
      if (!formData.experience) {
        setGeneralError('Please select years of experience')
        return
      }
      if (formData.linkedinUrl) {
        const validation = validateLinkedInUrl(formData.linkedinUrl)
        if (!validation.valid) {
          setLinkedinError(validation.message || 'Invalid LinkedIn URL format')
          return
        }
      }
    } else if (currentStep === 2) {
      if (!formData.industry) {
        setGeneralError('Please select an industry')
        return
      }
      if (!formData.relevantExpertise || formData.relevantExpertise.length === 0) {
        setGeneralError('Please select at least one expertise')
        return
      }
    } else if (currentStep === 3) {
      if (formData.cvFiles.length === 0) {
        setCvError('Please upload at least one CV file')
        return
      }
      const bioValidation = validateBio(formData.bio)
      if (!bioValidation.valid) {
        setGeneralError(bioValidation.message || 'Invalid bio')
        return
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setGeneralError('')
    setFieldErrors({})
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    // Validate using utility function
    const newFiles = [...formData.cvFiles, file]
    const validation = validateCVFile(newFiles)
    
    if (!validation.valid) {
      setCvError(validation.message || 'Error uploading file')
      return
    }

    // Check if file already exists
    if (formData.cvFiles.some(f => f.name === file.name && f.size === file.size)) {
      setCvError('This file has already been uploaded')
      return
    }

    setCvError('')
    setFormData({ ...formData, cvFiles: newFiles })
    
    // Reset input
    event.target.value = ''
  }

  const handleRemoveCV = (index: number) => {
    setFormData({
      ...formData,
      cvFiles: formData.cvFiles.filter((_, i) => i !== index)
    })
    setCvError('')
  }

  const handleExpertiseToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      relevantExpertise: prev.relevantExpertise.includes(skill)
        ? prev.relevantExpertise.filter((s) => s !== skill)
        : [...prev.relevantExpertise, skill],
    }))
  }

  const handleSubmit = async () => {
    setGeneralError('')
    setFieldErrors({})

    // Validate entire form before submission
    const validation = validateMentorProfileForm(
      formData.expertise,
      formData.industry,
      formData.experience,
      formData.availability,
      formData.mentees,
      formData.bio,
      formData.linkedinUrl,
      formData.cvFiles
    )

    if (!validation.valid) {
      setGeneralError(validation.errors[0]?.message || 'Please check all form data')
      const errors: Record<string, string> = {}
      validation.errors.forEach(err => {
        errors[err.field] = err.message
      })
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    // TODO: Send data to backend
    console.log('Mentor Form Data:', formData)
    setTimeout(() => {
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <FormCard>
        <div className="space-y-8">
          <StepProgress current={currentStep} total={totalSteps} />

          {generalError && (
            <Alert 
              type="error" 
              message={generalError}
              dismissible
            />
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <StepTitle>Getting to know you</StepTitle>
              <StepSubtitle>This will help us to understand you better.</StepSubtitle>
                <InputGroup label="Years of Experience" htmlFor="experience">
                <SelectField
                  id="experience"
                  value={formData.experience}
                  onChange={(v) => {
                    setFormData({ ...formData, experience: v })
                    if (fieldErrors.experience) {
                      setFieldErrors(prev => ({ ...prev, experience: '' }))
                    }
                  }}
                  options={experienceOptions}
                />
                {fieldErrors.experience && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.experience}</p>
                )}
              </InputGroup>

              <InputGroup label="LinkedIn Profile URL" htmlFor="linkedinUrl">
                <input
                  type="url"
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => {
                    handleLinkedInChange(e.target.value)
                    if (fieldErrors.linkedinUrl) {
                      setFieldErrors(prev => ({ ...prev, linkedinUrl: '' }))
                    }
                  }}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full rounded-xl border ${
                    linkedinError ? 'border-red-500' : 'border-gray-200'
                  } px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
                {linkedinError && (
                  <p className="mt-1 text-sm text-red-500">{linkedinError}</p>
                )}
                {fieldErrors.linkedinUrl && !linkedinError && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.linkedinUrl}</p>
                )}
              </InputGroup>

            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <StepTitle>Tell us about your background</StepTitle>
              <StepSubtitle>This help us know your expertise</StepSubtitle>
          <InputGroup label="Select your career field" htmlFor="industry">
                <SelectField
                  id="industry"
                  value={formData.industry}
                  onChange={(v) => {
                    setFormData({ ...formData, industry: v })
                    if (fieldErrors.industry) {
                      setFieldErrors(prev => ({ ...prev, industry: '' }))
                    }
                  }}
                  options={industryOptions}
                />
                {fieldErrors.industry && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.industry}</p>
                )}
              </InputGroup>
                <InputGroup label="What Relevant expertise to your career" htmlFor="expertise">
                <SelectWithTags
                  id="expertise"
                  options={relevantExpertiseOptions}
                  selected={formData.relevantExpertise}
                  onAdd={(item) => {
                    handleExpertiseToggle(item)
                    if (fieldErrors.expertise) {
                      setFieldErrors(prev => ({ ...prev, expertise: '' }))
                    }
                  }}
                  onRemove={(item) => handleExpertiseToggle(item)}
                  placeholder="Select expertise..."
                />
                {fieldErrors.expertise && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.expertise}</p>
                )}
              </InputGroup>

              <InputGroup label="Which tools you have experience in" htmlFor="tools">
                <SelectWithTags
                  id="tools"
                  options={toolsOptions}
                  selected={formData.tools}
                  onAdd={(item) => handleToolsToggle(item)}
                  onRemove={(item) => handleToolsToggle(item)}
                  placeholder="Select tools..."
                />
              </InputGroup>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <StepTitle>Upload Your CV</StepTitle>
              <StepSubtitle>Help us understand your expertise</StepSubtitle>
              
              <InputGroup label="CV/Resume" htmlFor="cvFile">
                {formData.cvFiles.length === 0 ? (
                  <label
                    htmlFor="cvFile"
                    className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 cursor-pointer transition hover:border-primary hover:bg-indigo-50"
                  >
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload your CV/Resume
                    </span>
                  </label>
                ) : (
                  <div className="space-y-2">
                    {formData.cvFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">{file.name}</p>
                            <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCV(index)}
                          className="rounded-lg p-1 text-green-600 hover:bg-green-200 transition"
                          title="Remove file"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <label
                      htmlFor="cvFile"
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 cursor-pointer transition hover:border-primary hover:bg-indigo-50"
                    >
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Add another file
                      </span>
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  id="cvFile"
                  onChange={handleCVUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                {cvError && (
                  <p className="mt-2 text-sm text-red-500">{cvError}</p>
                )}
                {fieldErrors.cvFiles && !cvError && (
                  <p className="mt-2 text-sm text-red-500">{fieldErrors.cvFiles}</p>
                )}
              </InputGroup>

              <InputGroup label="Professional Bio" htmlFor="bio">
                <TextAreaField
                  id="bio"
                  value={formData.bio}
                  onChange={(v) => {
                    setFormData({ ...formData, bio: v })
                    if (fieldErrors.bio) {
                      setFieldErrors(prev => ({ ...prev, bio: '' }))
                    }
                  }}
                  placeholder="Share your professional journey, achievements, and what you're passionate about..."
                  rows={5}
                />
                <p className="mt-1 text-right text-xs text-gray-500">{formData.bio.length}/500</p>
                {fieldErrors.bio && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.bio}</p>
                )}
              </InputGroup>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <StepTitle>Set your mentorship details</StepTitle>
              <StepSubtitle>How much time can you dedicate and how many mentees?</StepSubtitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputGroup label="Preferred Availability" htmlFor="availability">
                  <SelectField
                    id="availability"
                    value={formData.availability}
                    onChange={(v) => {
                      setFormData({ ...formData, availability: v })
                      if (fieldErrors.availability) {
                        setFieldErrors(prev => ({ ...prev, availability: '' }))
                      }
                    }}
                    options={[
                      { label: '1-2 hours per week', value: '1-2hours' },
                      { label: '3-5 hours per week', value: '3-5hours' },
                      { label: '5-10 hours per week', value: '5-10hours' },
                      { label: '10+ hours per week', value: '10plus' },
                    ]}
                  />
                  {fieldErrors.availability && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.availability}</p>
                  )}
                </InputGroup>

                <InputGroup label="How many mentees would you like?" htmlFor="mentees">
                  <SelectField
                    id="mentees"
                    value={formData.mentees}
                    onChange={(v) => {
                      setFormData({ ...formData, mentees: v })
                      if (fieldErrors.mentees) {
                        setFieldErrors(prev => ({ ...prev, mentees: '' }))
                      }
                    }}
                    options={[
                      { label: '1 mentee', value: '1' },
                      { label: '2-3 mentees', value: '2-3' },
                      { label: '4-5 mentees', value: '4-5' },
                      {label: 'Group', value: 'group' },
                      { label: 'Unlimited', value: 'unlimited' },
                    ]}
                  />
                  {fieldErrors.mentees && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.mentees}</p>
                  )}
                </InputGroup>
              </div>
            </div>
          )}

          <FormNavigation
            canBack={currentStep !== 1}
            onBack={handlePrev}
            isLast={currentStep === totalSteps}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitting={loading}
          />
        </div>
      </FormCard>
    </div>
  )
}

export default MentorForm
