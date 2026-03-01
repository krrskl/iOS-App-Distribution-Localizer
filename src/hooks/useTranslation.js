import { useState, useCallback, useEffect } from 'react'
import { translateStrings, SUPPORTED_LANGUAGES, PROVIDERS, DEFAULT_CONCURRENT_REQUESTS, DEFAULT_TEXTS_PER_BATCH } from '../services/translationService'
import { parseXCStrings, generateXCStrings, getTranslationStats } from '../utils/xcstringsParser'
import { PROTECTED_WORDS_KEY } from '../constants'

export function useTranslation() {
  const [xcstringsData, setXcstringsData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, currentText: '' })
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [languageSearch, setLanguageSearch] = useState('')
  const [concurrency, setConcurrency] = useState(DEFAULT_CONCURRENT_REQUESTS)
  const [batchSize, setBatchSize] = useState(DEFAULT_TEXTS_PER_BATCH)

  const [protectedWords, setProtectedWords] = useState(() => {
    const saved = localStorage.getItem(PROTECTED_WORDS_KEY)
    return saved ? JSON.parse(saved) : ['MyAppName']
  })
  const [newProtectedWord, setNewProtectedWord] = useState('')

  useEffect(() => {
    localStorage.setItem(PROTECTED_WORDS_KEY, JSON.stringify(protectedWords))
  }, [protectedWords])

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-100), { message, type, timestamp }])
  }, [])

  const addProtectedWord = () => {
    const word = newProtectedWord.trim()
    if (word && !protectedWords.includes(word)) {
      setProtectedWords([...protectedWords, word])
      setNewProtectedWord('')
      addLog(`Added "${word}" to protected words`, 'success')
    }
  }

  const removeProtectedWord = (word) => {
    setProtectedWords(protectedWords.filter(w => w !== word))
    addLog(`Removed "${word}" from protected words`, 'info')
  }

  const processFile = async (file) => {
    if (!file) return

    if (!file.name.endsWith('.xcstrings')) {
      addLog('Please upload a .xcstrings file', 'error')
      return
    }

    try {
      const text = await file.text()
      const data = parseXCStrings(text)
      setXcstringsData(data)
      setFileName(file.name)
      const fileStats = getTranslationStats(data)
      setStats(fileStats)
      addLog(`Loaded ${file.name} with ${fileStats.totalStrings} strings`, 'success')
    } catch (error) {
      addLog(`Error loading file: ${error.message}`, 'error')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    await processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleLanguageToggle = (langCode) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  const handleSelectAll = () => {
    if (selectedLanguages.length === SUPPORTED_LANGUAGES.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(SUPPORTED_LANGUAGES.map(l => l.code))
    }
  }

  const handleTranslate = async (providerConfig, currentApiKey, currentModel) => {
    if (!currentApiKey) {
      addLog(`Please enter your ${PROVIDERS[providerConfig.provider].name} API key`, 'error')
      return
    }
    if (!xcstringsData) {
      addLog('Please load an .xcstrings file first', 'error')
      return
    }
    if (selectedLanguages.length === 0) {
      addLog('Please select at least one language', 'error')
      return
    }

    setIsTranslating(true)
    setProgress({ current: 0, total: 0, currentText: 'Starting...' })

    const config = {
      provider: providerConfig.provider,
      apiKey: currentApiKey,
      model: currentModel,
      region: providerConfig.region,
      endpoint: providerConfig.endpoint || PROVIDERS[providerConfig.provider]?.placeholder || '',
      serviceTier: providerConfig.serviceTier || 'auto'
    }

    try {
      const result = await translateStrings(
        xcstringsData,
        selectedLanguages,
        config,
        protectedWords,
        (progressInfo) => {
          setProgress(progressInfo)
          if (progressInfo.log) {
            addLog(progressInfo.log, progressInfo.logType || 'info')
          }
        },
        concurrency,
        batchSize
      )

      setXcstringsData(result)
      const newStats = getTranslationStats(result)
      setStats(newStats)
      addLog('Translation completed!', 'success')
    } catch (error) {
      addLog(`Translation error: ${error.message}`, 'error')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSave = () => {
    if (!xcstringsData) {
      addLog('No data to save', 'error')
      return
    }

    try {
      const jsonString = generateXCStrings(xcstringsData)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'Localizable.xcstrings'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addLog(`Saved ${fileName || 'Localizable.xcstrings'}`, 'success')
    } catch (error) {
      addLog(`Error saving file: ${error.message}`, 'error')
    }
  }

  const progressPercent = progress.total ? (progress.current / progress.total) * 100 : 0

  return {
    xcstringsData,
    setXcstringsData,
    fileName,
    selectedLanguages,
    isTranslating,
    progress,
    stats,
    setStats,
    logs,
    addLog,
    isDragging,
    languageSearch,
    setLanguageSearch,
    concurrency,
    setConcurrency,
    batchSize,
    setBatchSize,
    protectedWords,
    newProtectedWord,
    setNewProtectedWord,
    addProtectedWord,
    removeProtectedWord,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleLanguageToggle,
    handleSelectAll,
    handleTranslate,
    handleSave,
    progressPercent,
  }
}
