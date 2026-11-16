import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { sanity } from './sanityClient'
import Breadcrumb from './Breadcrumb'
import { useLanguage } from './languageContext'
import { t } from './uiStrings'
import './SubmitForm.css'

function SubmitForm() {
  const lang = useLanguage()
  const [searchParams] = useSearchParams()
  const [type, setType] = useState(
    searchParams.get('type') === 'communityStory' ? 'communityStory' : 'resource'
  )
  const fieldLabel = (labelKey, required = false) => (
    <span>
      {t(lang, labelKey)}{' '}
      {required && (
        <span className="submit-field-requirement">
          {t(lang, 'pages.submitForm.requiredIndicator')}
        </span>
      )}
    </span>
  )

  const initialFormState = {
    submitterName: '',
    submitterEmail: '',
    resourceTitle: '',
    resourceUrl: '',
    resourceDescription: '',
    resourceCategory: '',
    resourceContactEmail: '',
    resourceContactPhone: '',
    resourceAddressStreet: '',
    resourceAddressCity: '',
    resourceAddressState: '',
    resourceAddressZipCode: '',
    storyTitle: '',
    storyPersonName: '',
    storyLocation: '',
    storySummary: '',
    storyBody: '',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [status, setStatus] = useState('idle')
  const [categoryError, setCategoryError] = useState(false)
  const [formError, setFormError] = useState('')
  const resourceCategoryRef = useRef(null)

  const categoryOptions = [
    { value: 'legal-aid', label: t(lang, 'pages.submitForm.categories.legalAid') },
    {
      value: 'community-organizations',
      label: t(lang, 'pages.submitForm.categories.communityOrganizations'),
    },
    { value: 'mutual-aid-support', label: t(lang, 'pages.submitForm.categories.mutualAidSupport') },
    {
      value: 'collaborative-support',
      label: t(lang, 'pages.submitForm.categories.collaborativeSupport'),
    },
    { value: 'employment-support', label: t(lang, 'pages.submitForm.categories.employmentSupport') },
    {
      value: 'food-access-and-housing-support',
      label: t(lang, 'pages.submitForm.categories.foodAccessAndHousingSupport'),
    },
    { value: 'healthcare-support', label: t(lang, 'pages.submitForm.categories.healthcareSupport') },
    { value: 'transportation-services', label: t(lang, 'pages.submitForm.categories.transportationServices') },
    { value: 'multilingual-support', label: t(lang, 'pages.submitForm.categories.multilingualSupport') },
    { value: 'mental-health-support', label: t(lang, 'pages.submitForm.categories.mentalHealthSupport') },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'resourceCategory' && value) {
      setCategoryError(false)
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryKeyDown = (e) => {
    // Improve cross-browser keyboard access (VoiceOver + Chrome/Safari).
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      if (typeof e.currentTarget.showPicker === 'function') {
        e.preventDefault()
        e.currentTarget.showPicker()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredMissing = []

    if (type === 'resource') {
      if (!formData.resourceCategory) {
        setCategoryError(true)
        requiredMissing.push('category')
      }
      if (!formData.resourceTitle) {
        requiredMissing.push('resourceTitle')
      }
      if (!formData.resourceDescription) {
        requiredMissing.push('resourceDescription')
      }
    }

    if (type === 'communityStory') {
      if (!formData.storyTitle) {
        requiredMissing.push('storyTitle')
      }
      if (!formData.storyBody) {
        requiredMissing.push('storyBody')
      }
    }

    if (requiredMissing.length > 0) {
      setFormError(t(lang, 'pages.submitForm.requiredFieldsError'))
      setStatus('error')

      const firstMissing = requiredMissing[0]
      const firstFieldMap = {
        category: resourceCategoryRef,
        resourceTitle: document.getElementById('resourceTitle'),
        resourceDescription: document.getElementById('resourceDescription'),
        storyTitle: document.getElementById('storyTitle'),
        storyBody: document.getElementById('storyBody'),
      }
      firstFieldMap[firstMissing]?.current?.focus?.() || firstFieldMap[firstMissing]?.focus?.()
      return
    }

    setFormError('')
    setStatus('submitting')

    try {
      const doc = {
        _type: 'submission',
        type,
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,

        // Resource fields
        resourceTitle: formData.resourceTitle,
        resourceUrl: formData.resourceUrl || undefined,
        resourceDescription: formData.resourceDescription,
        resourceCategory: formData.resourceCategory,
        resourceContactEmail: formData.resourceContactEmail,
        resourceContactPhone: formData.resourceContactPhone,

        resourceAddress: {
          street: formData.resourceAddressStreet,
          city: formData.resourceAddressCity,
          state: formData.resourceAddressState,
          zipCode: formData.resourceAddressZipCode,
        },

        // Story fields
        storyTitle: formData.storyTitle,
        storyPersonName: formData.storyPersonName,
        storyLocation: formData.storyLocation,
        storySummary: formData.storySummary,
        storyBody: formData.storyBody,
      }

      await sanity.create(doc)

      setStatus('success')
      setFormData(initialFormState)
    } catch (err) {
      console.error('Sanity submission error:', err)
      setStatus('error')
    }
  }

  return (
    <main className="container">
      <Breadcrumb />
      <header className="submit-header">
        <Link to="/" className="back-link">
          {t(lang, 'pages.submitForm.backHome')}
        </Link>
        <h1>{t(lang, 'pages.submitForm.title')}</h1>
        <p className="subtitle">
          {t(lang, 'pages.submitForm.subtitle')}
        </p>
      </header>
      <nav className="submit-skip-links" aria-label={t(lang, 'pages.submitForm.skipNavAria')}>
        <a href="#submit-type">{t(lang, 'pages.submitForm.skipToType')}</a>
        <a href="#submit-contact">{t(lang, 'pages.submitForm.skipToContact')}</a>
        <a href="#submit-details">{t(lang, 'pages.submitForm.skipToDetails')}</a>
        <a href="#submit-send">{t(lang, 'pages.submitForm.skipToSend')}</a>
      </nav>

      <section className="submit-section">
        <form onSubmit={handleSubmit} className="submit-form">
          <fieldset id="submit-type" className="submit-fieldset radio-fieldset">
            <legend>{t(lang, 'pages.submitForm.shareLegend')}</legend>

            <div className="radio-options">
              <label className={`radio-option-card ${type === 'resource' ? 'radio-option-selected' : ''}`}>
                <input
                  type="radio"
                  name="submissionType"
                  value="resource"
                  checked={type === 'resource'}
                  onChange={() => setType('resource')}
                  className="radio-input-visually-hidden"
                  aria-describedby="resource-description"
                />
                <span className="radio-option-title">{t(lang, 'pages.submitForm.shareResourceTitle')}</span>
                <span id="resource-description" className="radio-option-description">
                  {t(lang, 'pages.submitForm.shareResourceDescription')}
                </span>
              </label>

              <label className={`radio-option-card ${type === 'communityStory' ? 'radio-option-selected' : ''}`}>
                <input
                  type="radio"
                  name="submissionType"
                  value="communityStory"
                  checked={type === 'communityStory'}
                  onChange={() => setType('communityStory')}
                  className="radio-input-visually-hidden"
                  aria-describedby="story-description"
                />
                <span className="radio-option-title">{t(lang, 'pages.submitForm.shareStoryTitle')}</span>
                <span id="story-description" className="radio-option-description">
                  {t(lang, 'pages.submitForm.shareStoryDescription')}
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset id="submit-contact" className="submit-fieldset">
            <legend>{t(lang, 'pages.submitForm.contactLegend')}</legend>

            <label className="submit-label" htmlFor="submitterName">
                  {fieldLabel('pages.submitForm.nameLabel')}
              <input
                id="submitterName"
                type="text"
                name="submitterName"
                value={formData.submitterName}
                onChange={handleChange}
              />
            </label>

            <label className="submit-label" htmlFor="submitterEmail">
              {fieldLabel('pages.submitForm.emailLabel')}
              <input
                id="submitterEmail"
                type="email"
                name="submitterEmail"
                value={formData.submitterEmail}
                onChange={handleChange}
              />
            </label>
          </fieldset>

          {type === 'resource' && (
            <fieldset id="submit-details" className="submit-fieldset">
              <legend>{t(lang, 'pages.submitForm.resourceLegend')}</legend>

              <label className="submit-label" htmlFor="resourceTitle">
                {fieldLabel('pages.submitForm.resourceNameLabel', true)}
                <input
                  id="resourceTitle"
                  type="text"
                  name="resourceTitle"
                  required
                  aria-invalid={formError && !formData.resourceTitle ? 'true' : 'false'}
                  aria-describedby={formError && !formData.resourceTitle ? 'submit-form-error' : undefined}
                  value={formData.resourceTitle}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceUrl">
                {fieldLabel('pages.submitForm.websiteLinkLabel')}
                <input
                  id="resourceUrl"
                  type="url"
                  name="resourceUrl"
                  value={formData.resourceUrl}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceCategory">
                {fieldLabel('pages.submitForm.categoryLabel', true)}
                <select
                  ref={resourceCategoryRef}
                  id="resourceCategory"
                  name="resourceCategory"
                  value={formData.resourceCategory}
                  onChange={handleChange}
                  onKeyDown={handleCategoryKeyDown}
                  onInvalid={() => setCategoryError(true)}
                  required
                  aria-required="true"
                  aria-invalid={categoryError ? 'true' : 'false'}
                  aria-describedby={`resource-category-help resource-category-keyboard-help${categoryError ? ' resource-category-error' : ''}`}
                >
                  <option value="">
                    {t(lang, 'pages.submitForm.categorySelectPlaceholder')}
                  </option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span id="resource-category-help" className="submit-help-text">
                  {t(lang, 'pages.submitForm.categoryHelpText')}
                </span>
                <span id="resource-category-keyboard-help" className="submit-help-text">
                  {t(lang, 'pages.submitForm.categoryKeyboardHelpText')}
                </span>
                {categoryError && (
                  <span id="resource-category-error" className="submit-field-error" role="alert">
                    {t(lang, 'pages.submitForm.categoryRequiredError')}
                  </span>
                )}
              </label>

              <label className="submit-label" htmlFor="resourceDescription">
                {fieldLabel('pages.submitForm.descriptionLabel', true)}
                <textarea
                  id="resourceDescription"
                  name="resourceDescription"
                  rows={4}
                  required
                  aria-invalid={formError && !formData.resourceDescription ? 'true' : 'false'}
                  aria-describedby={formError && !formData.resourceDescription ? 'submit-form-error' : undefined}
                  value={formData.resourceDescription}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceContactEmail">
                {fieldLabel('pages.submitForm.resourceContactEmailLabel')}
                <input
                  id="resourceContactEmail"
                  type="email"
                  name="resourceContactEmail"
                  value={formData.resourceContactEmail}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceContactPhone">
                {fieldLabel('pages.submitForm.resourceContactPhoneLabel')}
                <input
                  id="resourceContactPhone"
                  type="tel"
                  name="resourceContactPhone"
                  value={formData.resourceContactPhone}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceAddressStreet">
                {fieldLabel('pages.submitForm.streetAddressLabel')}
                <input
                  id="resourceAddressStreet"
                  type="text"
                  name="resourceAddressStreet"
                  value={formData.resourceAddressStreet}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceAddressCity">
                {fieldLabel('pages.submitForm.cityLabel')}
                <input
                  id="resourceAddressCity"
                  type="text"
                  name="resourceAddressCity"
                  value={formData.resourceAddressCity}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceAddressState">
                {fieldLabel('pages.submitForm.stateLabel')}
                <input
                  id="resourceAddressState"
                  type="text"
                  name="resourceAddressState"
                  value={formData.resourceAddressState}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="resourceAddressZipCode">
                {fieldLabel('pages.submitForm.zipCodeLabel')}
                <input
                  id="resourceAddressZipCode"
                  type="text"
                  name="resourceAddressZipCode"
                  value={formData.resourceAddressZipCode}
                  onChange={handleChange}
                />
              </label>
            </fieldset>
          )}

          {type === 'communityStory' && (
            <fieldset className="submit-fieldset">
              <legend>{t(lang, 'pages.submitForm.storyLegend')}</legend>

              <label className="submit-label" htmlFor="storyTitle">
                {fieldLabel('pages.submitForm.storyTitleLabel', true)}
                <input
                  id="storyTitle"
                  type="text"
                  name="storyTitle"
                  required
                  aria-invalid={formError && !formData.storyTitle ? 'true' : 'false'}
                  aria-describedby={formError && !formData.storyTitle ? 'submit-form-error' : undefined}
                  value={formData.storyTitle}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="storyPersonName">
                {fieldLabel('pages.submitForm.storyPersonNameLabel')}
                <input
                  id="storyPersonName"
                  type="text"
                  name="storyPersonName"
                  value={formData.storyPersonName}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="storyLocation">
                {fieldLabel('pages.submitForm.storyLocationLabel')}
                <input
                  id="storyLocation"
                  type="text"
                  name="storyLocation"
                  value={formData.storyLocation}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="storySummary">
                {fieldLabel('pages.submitForm.storySummaryLabel')}
                <textarea
                  id="storySummary"
                  name="storySummary"
                  rows={3}
                  value={formData.storySummary}
                  onChange={handleChange}
                />
              </label>

              <label className="submit-label" htmlFor="storyBody">
                {fieldLabel('pages.submitForm.storyBodyLabel', true)}
                <textarea
                  id="storyBody"
                  name="storyBody"
                  rows={6}
                  required
                  aria-invalid={formError && !formData.storyBody ? 'true' : 'false'}
                  aria-describedby={formError && !formData.storyBody ? 'submit-form-error' : undefined}
                  value={formData.storyBody}
                  onChange={handleChange}
                />
              </label>
            </fieldset>
          )}

          <button id="submit-send" type="submit" className="submit-button" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
            {status === 'submitting' ? t(lang, 'pages.submitForm.sending') : t(lang, 'pages.submitForm.sendButton')}
          </button>

          {status === 'success' && (
            <p className="submit-message success" role="status" aria-live="polite">
              {type === 'communityStory' ? (
                <>
                  {t(lang, 'pages.submitForm.storySuccessMessage')}{' '}
                  <Link to="/community-stories">
                    {t(lang, 'pages.submitForm.storySuccessLinkLabel')}
                  </Link>
                </>
              ) : (
                <>
                  {t(lang, 'pages.submitForm.resourceSuccessMessage')}{' '}
                  <Link to="/resources">
                    {t(lang, 'pages.submitForm.resourceSuccessLinkLabel')}
                  </Link>
                </>
              )}
            </p>
          )}

          {(status === 'error' || formError) && (
            <p id="submit-form-error" className="submit-message error" role="alert" aria-live="assertive" aria-atomic="true">
              {formError || t(lang, 'pages.submitForm.errorMessage')}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default SubmitForm
