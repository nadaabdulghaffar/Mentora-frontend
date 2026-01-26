import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bgImage from "../../assets/images/bg.png"
import {
  FormContainer,
  FormCard,
  StepProgress,
  StepTitle,
  StepSubtitle,
  InputGroup,
  SelectField,
  CheckboxList,
  TextAreaField,
  FormNavigation,
  type Option,
  SelectWithTags,
} from "../../components/MultiStepForm"

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


const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return true // Empty is allowed
    
    // LinkedIn URL patterns
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company|school)\/[a-zA-Z0-9_-]+\/?$/
    return linkedinPattern.test(url)
  }

  const handleLinkedInChange = (value: string) => {
    setFormData({ ...formData, linkedinUrl: value })
    
    if (value && !validateLinkedInUrl(value)) {
      setLinkedinError('Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)')
    } else {
      setLinkedinError('')
    }
  }

  const handleNext = () => {
    // Validate LinkedIn URL before moving to next step
    if (currentStep === 1 && formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      setLinkedinError('Please enter a valid LinkedIn URL before continuing')
      return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    
    const hasValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!hasValidType) {
      setCvError('Please upload a valid CV/Resume file (PDF or Word document)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCvError('File size must be less than 5MB')
      return
    }

    // Check if file already exists in the list
    if (formData.cvFiles.some(f => f.name === file.name && f.size === file.size)) {
      setCvError('This file is already uploaded')
      return
    }

    setCvError('')
    setFormData({ ...formData, cvFiles: [...formData.cvFiles, file] })
    
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

          {currentStep === 1 && (
            <div className="space-y-4">
              <StepTitle>Getting to know you</StepTitle>
              <StepSubtitle>This will help us to understand you better.</StepSubtitle>
                <InputGroup label="Years of Experience" htmlFor="experience">
                <SelectField
                  id="experience"
                  value={formData.experience}
                  onChange={(v) => setFormData({ ...formData, experience: v })}
                  options={experienceOptions}
                />
              </InputGroup>

              <InputGroup label="LinkedIn Profile URL" htmlFor="linkedinUrl">
                <input
                  type="url"
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleLinkedInChange(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full rounded-xl border ${
                    linkedinError ? 'border-red-500' : 'border-gray-200'
                  } px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
                {linkedinError && (
                  <p className="mt-1 text-sm text-red-500">{linkedinError}</p>
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
                  onChange={(v) => setFormData({ ...formData, industry: v })}
                  options={industryOptions}
                />
              </InputGroup>
                <InputGroup label="What Relevant expertise to your career" htmlFor="expertise">
                <SelectWithTags
                  id="expertise"
                  options={relevantExpertiseOptions}
                  selected={formData.relevantExpertise}
                  onAdd={(item) => handleExpertiseToggle(item)}
                  onRemove={(item) => handleExpertiseToggle(item)}
                  placeholder="Select expertise..."
                />
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
              </InputGroup>

              <InputGroup label="Professional Bio" htmlFor="bio">
                <TextAreaField
                  id="bio"
                  value={formData.bio}
                  onChange={(v) => setFormData({ ...formData, bio: v })}
                  placeholder="Share your professional journey, achievements, and what you're passionate about..."
                  rows={5}
                />
                <p className="mt-1 text-right text-xs text-gray-500">{formData.bio.length}/500</p>
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
                    onChange={(v) => setFormData({ ...formData, availability: v })}
                    options={[
                      { label: '1-2 hours per week', value: '1-2hours' },
                      { label: '3-5 hours per week', value: '3-5hours' },
                      { label: '5-10 hours per week', value: '5-10hours' },
                      { label: '10+ hours per week', value: '10plus' },
                    ]}
                  />
                </InputGroup>

                <InputGroup label="How many mentees would you like?" htmlFor="mentees">
                  <SelectField
                    id="mentees"
                    value={formData.mentees}
                    onChange={(v) => setFormData({ ...formData, mentees: v })}
                    options={[
                      { label: '1 mentee', value: '1' },
                      { label: '2-3 mentees', value: '2-3' },
                      { label: '4-5 mentees', value: '4-5' },
                      {label: 'Group', value: 'group' },
                      { label: 'Unlimited', value: 'unlimited' },
                    ]}
                  />
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
