import { useState, useEffect } from "react"
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
  SelectWithTags,
  FormNavigation,
  type Option,
} from "../../components/MultiStepForm"
import lookupAPI from "../../services/lookupService"
import authAPI from "../../services/authService"
import type { SubDomain, Technology } from "../../types/api"

interface MenteeFormData {
  educationStatus: string
  countryCode: string
  careerGoalId: string
  learningStyleId: string
  domainId: string
  experienceLevel: string
  relevantExpertise: string[]
  tools: string[]
  bio: string
}

function MenteeForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MenteeFormData>({
    educationStatus: '',
    countryCode: '',
    careerGoalId: '',
    learningStyleId: '',
    domainId: '',
    experienceLevel: '',
    relevantExpertise: [],
    tools: [],
    bio: '',
  })

  // البيانات من الـ API
  const [domains, setDomains] = useState<Option[]>([])
  const [subDomainOptions, setSubDomainOptions] = useState<SubDomain[]>([])
  const [technologyOptions, setTechnologyOptions] = useState<Technology[]>([])
  const [careerGoals, setCareerGoals] = useState<Option[]>([])
  const [learningStyles, setLearningStyles] = useState<Option[]>([])
  const [educationStatuses, setEducationStatuses] = useState<Option[]>([])
  const [experienceLevels, setExperienceLevels] = useState<Option[]>([])
  const [countries, setCountries] = useState<Option[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const totalSteps = 4

  // جلب البيانات من الـ API
  useEffect(() => {
    const loadLookupData = async () => {
      setLoadingData(true)
      try {
        // جلب المجالات
        const domainsResponse = await lookupAPI.getDomains()
        if (domainsResponse.success && domainsResponse.data) {
          const domainOptions = domainsResponse.data.map(d => ({ 
            label: d.name, 
            value: d.id 
          }))
          setDomains(domainOptions)
          if (domainOptions.length > 0) {
            setFormData((prev) =>
              prev.domainId ? prev : { ...prev, domainId: domainOptions[0].value }
            )
          }
        }

        // جلب الأهداف المهنية
        const goalsResponse = await lookupAPI.getCareerGoals()
        if (goalsResponse.success && goalsResponse.data) {
          setCareerGoals(goalsResponse.data.map((g: any) => ({
            label: g.name,
            value: String(g.careerGoalId || g.id),
          })))
        }

        // جلب أساليب التعلم
        const stylesResponse = await lookupAPI.getLearningStyles()
        if (stylesResponse.success && stylesResponse.data) {
          setLearningStyles(stylesResponse.data.map((s: any) => ({
            label: s.name,
            value: String(s.learningStyleId || s.id),
          })))
        }

        const educationResponse = await lookupAPI.getEducationStatuses()
        if (educationResponse.success && educationResponse.data) {
          setEducationStatuses(educationResponse.data.map((status: any) => ({
            label: status.name,
            value: status.value,
          })))
        }

        const countriesResponse = await lookupAPI.getCountries()
        if (countriesResponse.success && countriesResponse.data) {
          const countryOptions = countriesResponse.data.map((country) => ({
            label: country.name,
            value: country.code,
          }))
          setCountries(countryOptions)
          if (countryOptions.length > 0) {
            setFormData((prev) =>
              prev.countryCode ? prev : { ...prev, countryCode: countryOptions[0].value }
            )
          }
        }

        const experienceResponse = await lookupAPI.getExperienceLevels()
        if (experienceResponse.success && experienceResponse.data) {
          setExperienceLevels(experienceResponse.data.map((level: any) => ({
            label: level.name,
            value: level.value,
          })))
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error)
        // في حالة الفشل، استخدم بيانات افتراضية
        setDomains([
          { label: "Design", value: "design" },
          { label: "Software", value: "software" },
          { label: "Marketing", value: "marketing" },
        ])
        setCareerGoals([
          { label: 'Grow and advance in my current field', value: 'goal-1' },
          { label: 'Explore a new career path', value: 'goal-2' },
          { label: 'Start my own business or project', value: 'goal-3' },
        ])
        setLearningStyles([
          { label: 'Visual (learn best through images, charts, videos)', value: 'style-1' },
          { label: 'Auditory (learn best through listening and speaking)', value: 'style-2' },
          { label: 'Kinesthetic (learn best through hands-on activities)', value: 'style-3' },
        ])
        setEducationStatuses([
          { label: 'Student', value: 'student' },
          { label: 'Graduate', value: 'graduate' },
        ])
        setExperienceLevels([
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Expert', value: 'expert' },
        ])
        setCountries([
          { label: 'Egypt', value: 'EG' },
          { label: 'Saudi Arabia', value: 'SA' },
          { label: 'United Arab Emirates', value: 'AE' },
        ])
      } finally {
        setLoadingData(false)
      }
    }

    loadLookupData()
  }, [])

  useEffect(() => {
    const loadSubDomains = async () => {
      if (!formData.domainId) {
        setSubDomainOptions([])
        setTechnologyOptions([])
        setFormData((prev) => ({ ...prev, relevantExpertise: [], tools: [] }))
        return
      }

      try {
        const subDomainsResponse = await lookupAPI.getSubDomains(formData.domainId)
        if (subDomainsResponse.success && subDomainsResponse.data) {
          setSubDomainOptions(subDomainsResponse.data)
        } else {
          setSubDomainOptions([])
        }
      } catch (error) {
        console.error('خطأ في تحميل المجالات الفرعية:', error)
        setSubDomainOptions([])
      }
    }

    loadSubDomains()
  }, [formData.domainId])

  useEffect(() => {
    const loadTechnologies = async () => {
      const selectedSubDomainIds = subDomainOptions
        .filter((sd) => formData.relevantExpertise.includes(sd.name))
        .map((sd) => sd.id)

      if (selectedSubDomainIds.length === 0) {
        setTechnologyOptions([])
        setFormData((prev) => ({ ...prev, tools: [] }))
        return
      }

      try {
        const responses = await Promise.all(
          selectedSubDomainIds.map((id) => lookupAPI.getTechnologies(id))
        )
        const allTechnologies = responses
          .filter((res) => res.success && res.data)
          .flatMap((res) => res.data || [])

        const uniqueByName = new Map<string, Technology>()
        allTechnologies.forEach((tech) => {
          if (!uniqueByName.has(tech.name)) {
            uniqueByName.set(tech.name, tech)
          }
        })
        setTechnologyOptions(Array.from(uniqueByName.values()))
      } catch (error) {
        console.error('خطأ في تحميل التقنيات:', error)
        setTechnologyOptions([])
      }
    }

    loadTechnologies()
  }, [formData.relevantExpertise, subDomainOptions])

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
    const registrationToken = localStorage.getItem('registrationToken')
    if (!registrationToken) {
      setLoading(false)
      navigate('/signup')
      return
    }

    const selectedSubDomainIds = subDomainOptions
      .filter((sd) => formData.relevantExpertise.includes(sd.name))
      .map((sd) => sd.id)

    const selectedTechnologyIds = technologyOptions
      .filter((tech) => formData.tools.includes(tech.name))
      .map((tech) => tech.id)

    try {
      const response = await authAPI.completeMenteeProfile({
        registrationToken,
        educationStatus: formData.educationStatus,
        countryCode: formData.countryCode,
        careerGoalId: formData.careerGoalId,
        learningStyleId: formData.learningStyleId,
        domainId: formData.domainId,
        experienceLevel: formData.experienceLevel,
        subDomainIds: selectedSubDomainIds,
        technologyIds: selectedTechnologyIds,
        bio: formData.bio,
      })

      if (response.success) {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
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
          <div className="space-y-8">
            <StepProgress current={currentStep} total={totalSteps} />

          {currentStep === 1 && (
            <div className="space-y-4">
              <StepTitle>Getting to know you </StepTitle>
              <StepSubtitle>This will help us offer you the most appropriate guidance.</StepSubtitle>
              <InputGroup label="What is your education level?" htmlFor="educationLevel">
                <SelectField
                  id="educationLevel"
                  value={formData.educationStatus}
                  onChange={(v) => setFormData({ ...formData, educationStatus: v })}
                  options={educationStatuses}
                />
              </InputGroup >

              <InputGroup label="Your country" htmlFor="country">
                <SelectField
                  id="country"
                  value={formData.countryCode}
                  onChange={(v) => setFormData({ ...formData, countryCode: v })}
                  options={countries}
                />
              </InputGroup>

              <InputGroup label="What is your career goal?" htmlFor="goals">
                <SelectField
                  id="goals"
                  value={formData.careerGoalId}
                  onChange={(v) => setFormData({ ...formData, careerGoalId: v })}
                  options={careerGoals}
                />
              </InputGroup>
            </div>
          )}

          {currentStep === 2 && (
              <div className="space-y-4">
              <StepTitle>Getting to know you</StepTitle>
              <StepSubtitle>This will help us offer you the most appropriate guidance.</StepSubtitle>
              <InputGroup label=" What’s your preferred learning style" htmlFor="learningStyle">
                <SelectField
                  id="learningStyle"
                  value={formData.learningStyleId}
                  onChange={(v) => setFormData({ ...formData, learningStyleId: v })}
                  options={learningStyles}
                />
              </InputGroup>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <StepTitle>Tell us about your journey</StepTitle>
              <StepSubtitle>We’ll use this to match you with the right mentor</StepSubtitle>
            <InputGroup label="Select your career field" htmlFor="industry">
                <SelectField
                  id="industry"
                  value={formData.domainId}
                  onChange={(v) => setFormData({ ...formData, domainId: v })}
                  options={domains}
                />
              </InputGroup>

              <InputGroup label="Years of Experience" htmlFor="experience">
                <SelectField
                  id="experience"
                  value={formData.experienceLevel}
                  onChange={(v) => setFormData({ ...formData, experienceLevel: v })}
                  options={experienceLevels}
                />
              </InputGroup>

              <InputGroup label="What Relevant expertise to your career" htmlFor="expertise">
                <SelectWithTags
                  id="expertise"
                  options={subDomainOptions.map((sd) => sd.name)}
                  selected={formData.relevantExpertise}
                  onAdd={(item) => handleExpertiseToggle(item)}
                  onRemove={(item) => handleExpertiseToggle(item)}
                  placeholder="Select expertise..."
                />
              </InputGroup>

              <InputGroup label="Which tools you have experience in" htmlFor="tools">
                <SelectWithTags
                  id="tools"
                  options={technologyOptions.map((tech) => tech.name)}
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
