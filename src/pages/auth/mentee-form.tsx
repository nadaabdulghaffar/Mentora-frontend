import { useState, useEffect } from "react"
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
  TextAreaField,
  CheckboxList,
  RadioList,
  SelectWithTags,
  FormNavigation,
  type Option,
} from "../../components/MultiStepForm"
import lookupAPI from "../../services/lookupService"

interface MenteeFormData {
  educationLevel: string
  expertise: string
  learningStyle: string
  goals: string[]
  industry: string
  experience: string
  relevantExpertise: string[]
  tools: string[]
  bio: string
}

function MenteeForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MenteeFormData>({
    educationLevel: '',
    expertise: '',
    learningStyle: '',
    goals: [],
    industry: '',
    experience: '',
    relevantExpertise: [],
    tools: [],
    bio: '',
  })

  // البيانات من الـ API
  const [domains, setDomains] = useState<Option[]>([])
  const [subDomains, setSubDomains] = useState<string[]>([])
  const [careerGoals, setCareerGoals] = useState<string[]>([])
  const [learningStyles, setLearningStyles] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const totalSteps = 4

  const educationOptions: Option[] = [
    { label: "Student", value: "student" },
    { label: "Graduate", value: "graduate" },
  ]

  const experienceOptions : Option[] = [
    { label: "0-1 years", value: "0-1" },
    { label: "1-3 years", value: "1-3" },
    { label: "3-5 years", value: "3-5" },
    { label: "5+ years", value: "5plus" },
  ]

  // جلب البيانات من الـ API
  useEffect(() => {
    const loadLookupData = async () => {
      setLoadingData(true)
      try {
        // جلب المجالات
        const domainsResponse = await lookupAPI.getDomains()
        if (domainsResponse.success && domainsResponse.data) {
          setDomains(domainsResponse.data.map(d => ({ 
            label: d.name, 
            value: d.id 
          })))
        }

        // جلب المجالات الفرعية
        const subDomainsResponse = await lookupAPI.getSubDomains()
        if (subDomainsResponse.success && subDomainsResponse.data) {
          setSubDomains(subDomainsResponse.data.map(sd => sd.name))
        }

        // جلب الأهداف المهنية
        const goalsResponse = await lookupAPI.getCareerGoals()
        if (goalsResponse.success && goalsResponse.data) {
          setCareerGoals(goalsResponse.data.map(g => g.name))
        }

        // جلب أساليب التعلم
        const stylesResponse = await lookupAPI.getLearningStyles()
        if (stylesResponse.success && stylesResponse.data) {
          setLearningStyles(stylesResponse.data.map(s => s.name))
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error)
        // في حالة الفشل، استخدم بيانات افتراضية
        setDomains([
          { label: "Design", value: "design" },
          { label: "Software", value: "software" },
          { label: "Marketing", value: "marketing" },
        ])
        setSubDomains([
          'Graphic Design',
          'Full Stack Development',
          'Frontend Development',
          'Backend Development',
        ])
        setCareerGoals([
          'Grow and advance in my current field',
          'Explore a new career path',
          'Start my own business or project',
        ])
        setLearningStyles([
          'Visual (learn best through images, charts, videos)',
          'Auditory (learn best through listening and speaking)',
          'Kinesthetic (learn best through hands-on activities)',
        ])
      } finally {
        setLoadingData(false)
      }
    }

    loadLookupData()
  }, [])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))
  }

  const handleExpertiseToggle = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      relevantExpertise: prev.relevantExpertise.includes(expertise)
        ? prev.relevantExpertise.filter((e) => e !== expertise)
        : [...prev.relevantExpertise, expertise],
    }))
  }

  const handleToolsToggle = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    // TODO: Send data to backend
    console.log('Mentee Form Data:', formData)
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
        {loadingData ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Loading form data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">.
            <StepProgress current={currentStep} total={totalSteps} />

          {currentStep === 1 && (
            <div className="space-y-4">
              <StepTitle>Getting to know you </StepTitle>
              <StepSubtitle>This will help us offer you the most appropriate guidance.</StepSubtitle>
              <InputGroup label="What is your education level?" htmlFor="educationLevel">
                <SelectField
                  id="educationLevel"
                  value={formData.educationLevel}
                  onChange={(v) => setFormData({ ...formData, educationLevel: v })}
                  options={educationOptions}
                />
              </InputGroup >

              <InputGroup label="What is your career goal?" htmlFor="goals"></InputGroup>
              <CheckboxList
                items={careerGoals.length > 0 ? careerGoals : [
                  'Grow and advance in my current field',
                  'Explore a new career path',
                  'Start my own business or project',
                ]}
                selected={formData.goals}
                onToggle={handleGoalToggle}
              />
            </div>
          )}

          {currentStep === 2 && (
              <div className="space-y-4">
              <StepTitle>Getting to know you</StepTitle>
              <StepSubtitle>This will help us offer you the most appropriate guidance.</StepSubtitle>
              <InputGroup label=" What’s your preferred learning style" htmlFor="learningStyle"></InputGroup>
              <RadioList
                name="learningStyle"
                items={learningStyles.length > 0 ? learningStyles : [
                  "Visual (learn best through images, charts, videos)",
                  "Auditory (learn best through listening and speaking)",
                  "Kinesthetic (learn best through hands-on activities)",
                ]}
                value={formData.learningStyle}
                onChange={(v) => setFormData({ ...formData, learningStyle: v })}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <StepTitle>Tell us about your journey</StepTitle>
              <StepSubtitle>We’ll use this to match you with the right mentor</StepSubtitle>
            <InputGroup label="Select your career field" htmlFor="industry">
                <SelectField
                  id="industry"
                  value={formData.industry}
                  onChange={(v) => setFormData({ ...formData, industry: v })}
                  options={domains}
                />
              </InputGroup>

              <InputGroup label="Years of Experience" htmlFor="experience">
                <SelectField
                  id="experience"
                  value={formData.experience}
                  onChange={(v) => setFormData({ ...formData, experience: v })}
                  options={experienceOptions}
                />
              </InputGroup>

              <InputGroup label="What Relevant expertise to your career" htmlFor="expertise">
                <SelectWithTags
                  id="expertise"
                  options={subDomains}
                  selected={formData.relevantExpertise}
                  onAdd={(item) => handleExpertiseToggle(item)}
                  onRemove={(item) => handleExpertiseToggle(item)}
                  placeholder="Select expertise..."
                />
              </InputGroup>

              <InputGroup label="Which tools you have experience in" htmlFor="tools">
                <SelectWithTags
                  id="tools"
                  options={subDomains}
                  selected={formData.tools}
                  onAdd={(item) => handleToolsToggle(item)}
                  onRemove={(item) => handleToolsToggle(item)}
                  placeholder="Select tools..."
                />
              </InputGroup>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <StepTitle>Share your story</StepTitle>
              <StepSubtitle>Introduce yourself to our community</StepSubtitle>
              <InputGroup label="Tell us about yourself" htmlFor="bio">
                <TextAreaField
                  id="bio"
                  value={formData.bio}
                  onChange={(v) => setFormData({ ...formData, bio: v })}
                  rows={6}
                  placeholder="Share your background, interests, and what you hope to achieve..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500
                </div>
              </InputGroup>
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
        )}
      </FormCard>
    </div>
  )
}

export default MenteeForm
